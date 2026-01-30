Write-Host "Starting Skill Gap Analyzer..." -ForegroundColor Cyan

# Check if venv exists, if not, suggest running setup
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Running setup..." -ForegroundColor Yellow
    python scripts/setup_dev.py
}

# Start Backend
Write-Host "Starting Backend (FastAPI) in a new window..." -ForegroundColor Green
# Use the venv python if available
if (Test-Path "venv/Scripts/python.exe") {
    Start-Process cmd -ArgumentList "/k venv\Scripts\python.exe -m uvicorn app.main:app --reload"
} else {
    Start-Process cmd -ArgumentList "/k python -m uvicorn app.main:app --reload"
}

Write-Host "Waiting for backend to initialize..."
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (React) in a new window..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd client && npm run dev"

Write-Host "`nBoth services have been started in separate windows." -ForegroundColor Cyan
Write-Host "Check the new windows for the 'http://localhost' links." -ForegroundColor Gray

