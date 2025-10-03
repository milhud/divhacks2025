@echo off
echo 🚀 Installing Vibe Coach dependencies...

REM Clean up any existing node_modules
echo 🧹 Cleaning up existing dependencies...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
del pnpm-lock.yaml 2>nul
del yarn.lock 2>nul

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    echo.
    echo Next steps:
    echo 1. Copy .env.local.example to .env.local
    echo 2. Fill in your environment variables
    echo 3. Run 'npm run dev' to start the development server
) else (
    echo ❌ Installation failed. Please check the error messages above.
    exit /b 1
)
