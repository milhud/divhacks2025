@echo off
echo 🚀 Installing Vibe Coach...

REM Clean up any existing node_modules
echo 🧹 Cleaning up existing dependencies...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    echo.
    echo 🎯 Next steps:
    echo 1. Copy .env.local.example to .env.local
    echo 2. Add your Supabase and OpenAI credentials
    echo 3. Run: npm run dev
    echo.
    echo 📖 See BACKEND_SETUP.md for detailed instructions
) else (
    echo ❌ Installation failed. Please check the error messages above.
    exit /b 1
)