"""
Google OAuth authentication routes.
Handles the OAuth 2.0 flow: redirect to Google, handle callback, issue JWT.
"""
import logging
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import RedirectResponse
import httpx

from app.core.config import settings
from app.models.user import find_or_create_user, serialize_user
from app.services.auth_service import create_access_token
from app.middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Google OAuth URLs
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/login")
async def login_with_google(request: Request):
    """
    Redirect the user to Google's OAuth consent screen.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured (GOOGLE_CLIENT_ID missing)")
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    
    # Build the Google auth URL
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    auth_url = f"{GOOGLE_AUTH_URL}?{query_string}"
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def google_callback(request: Request, code: str = None, error: str = None):
    """
    Handle the OAuth callback from Google.
    Exchanges the authorization code for user profile, creates/finds user, issues JWT.
    """
    if error:
        logger.error(f"Google OAuth error: {error}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=no_code")
    
    try:
        # 1. Exchange authorization code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.GOOGLE_CALLBACK_URL,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=token_exchange_failed")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                logger.error("No access token in response")
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=no_access_token")
            
            # 2. Fetch user profile from Google
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if userinfo_response.status_code != 200:
                logger.error(f"Userinfo fetch failed: {userinfo_response.text}")
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=userinfo_failed")
            
            google_user = userinfo_response.json()
        
        # 3. Extract user info
        google_id = google_user.get("id")
        email = google_user.get("email", "")
        name = google_user.get("name", "")
        avatar = google_user.get("picture", "")
        
        if not google_id:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=no_google_id")
        
        logger.info(f"Google OAuth success for: {email}")
        
        # 4. Find or create user in MongoDB
        user = find_or_create_user(
            google_id=google_id,
            email=email,
            name=name,
            avatar=avatar,
        )
        
        # 5. Create JWT token
        user_data = serialize_user(user)
        jwt_token = create_access_token(user_data)
        
        # 6. Set cookie and redirect to frontend
        response = RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback", status_code=302)
        response.set_cookie(
            key="access_token",
            value=jwt_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=settings.JWT_EXPIRATION_HOURS * 3600,
            path="/",
        )
        
        return response
        
    except RuntimeError as e:
        logger.error(f"Database error during OAuth: {e}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=database_error")
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=server_error")


@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's info.
    Returns 401 if not authenticated.
    """
    return {"user": user}


@router.post("/logout")
async def logout(response: Response):
    """
    Log the user out by clearing the auth cookie.
    """
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"message": "Logged out successfully"}
