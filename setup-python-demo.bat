@echo off
echo Setting up Python dependencies for Vibe Coach Demo...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r python\requirements.txt

echo.
echo Setup complete! 
echo.
echo To run the demo:
echo 1. Activate the virtual environment: venv\Scripts\activate.bat
echo 2. Start the Next.js server: npm run dev
echo 3. Open http://localhost:3000
echo.
echo Demo credentials:
echo Provider: sarah.wilson@demorehab.com / DemoProvider123!
echo Users: john.smith@email.com / DemoUser123!
echo.
pause
