@echo off
echo 🚀 Starting DreamPool Development Environment...

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the DreamPool root directory
    pause
    exit /b 1
)

REM Start backend
echo 📡 Starting backend server...
cd backend

REM Check if venv exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt > nul 2>&1

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Backend .env file not found. Please create it from env.example
    echo    copy env.example .env
    echo    Then add your OpenAI API key
)

start "Backend Server" cmd /k "python main.py"

REM Start frontend
echo 🎨 Starting frontend server...
cd ..\frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Frontend .env.local file not found. Please create it from .env.example
    echo    copy .env.example .env.local
    echo    Then add your Openfort API key
)

start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ DreamPool is starting up!
echo 📡 Backend: http://localhost:8000
echo 🎨 Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
