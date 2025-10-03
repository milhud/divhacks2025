@echo off
echo 🏃‍♀️ Setting up Wearable Device Integration...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    exit /b 1
)

echo ✅ Python found

REM Install additional Python dependencies for wearable integration
echo 📦 Installing wearable integration dependencies...
pip install pandas==2.0.3 requests==2.31.0

echo ✅ Wearable integration setup complete!
echo.
echo 🎯 Supported Devices:
echo   • Apple Watch (HealthKit export)
echo   • Fitbit (CSV export)
echo   • Garmin (CSV export)
echo   • Samsung Health (CSV export)
echo   • Google Fit (CSV export)
echo.
echo 📝 How to use:
echo 1. Export your data from your device/app
echo 2. Go to /wearable page in the app
echo 3. Select your device type
echo 4. Upload your data file
echo 5. Get personalized recommendations!
echo.
echo 🔧 Python script location: python/wearable_integration.py
echo 📊 API endpoint: /api/wearable/upload
