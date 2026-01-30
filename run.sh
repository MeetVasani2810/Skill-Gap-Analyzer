#!/usr/bin/env bash
# Colors for better visibility
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${RED}Stopping backend and frontend...${NC}"
    # Kill all child processes of this script
    pkill -P $$ > /dev/null 2>&1
    exit
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo -e "${CYAN}🚀 Starting Skill Gap Analyzer (macOS/Linux)...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[!] Error: Node.js is not installed. Please install it to run the frontend.${NC}"
    exit 1
fi

# Check if venv exists and run setup if not
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[*] Virtual environment not found. Running setup...${NC}"
    python3 scripts/setup_dev.py
fi

if [ -d "venv" ]; then
    echo -e "${GREEN}[*] Activating virtual environment...${NC}"
    source venv/bin/activate
fi

echo -e "${GREEN}✨ Starting Backend (FastAPI)...${NC}"
if [ -f "venv/bin/python" ]; then
    venv/bin/python -m uvicorn app.main:app --reload &
else
    python3 -m uvicorn app.main:app --reload &
fi
BACKEND_PID=$!

echo -e "${CYAN}[*] Waiting for backend to initialize...${NC}"
sleep 5

echo -e "${GREEN}✨ Starting Frontend (React)...${NC}"
cd client && npm run dev &
FRONTEND_PID=$!

echo -e "\n${CYAN}--------------------------------------------------${NC}"
echo -e "${GREEN}✔ Backend is running in the background.${NC}"
echo -e "${GREEN}✔ Frontend is running in the background.${NC}"
echo -e "${CYAN}Press Ctrl+C to stop both services.${NC}"
echo -e "${CYAN}--------------------------------------------------${NC}"

# Wait for all background processes
wait
