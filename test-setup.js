// Simple test to verify the setup
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Vibe Coach setup...\n');

// Check if package.json exists and has correct dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['@supabase/supabase-js', '@tensorflow/tfjs', 'openai', 'next', 'react'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length === 0) {
  console.log('✅ Package.json has all required dependencies');
} else {
  console.log('❌ Missing dependencies:', missingDeps.join(', '));
}

// Check if environment file exists
if (fs.existsSync('.env.local')) {
  console.log('✅ Environment file (.env.local) exists');
} else {
  console.log('⚠️  Environment file (.env.local) not found - copy from .env.local.example');
}

// Check if key files exist
const keyFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/video-upload.tsx',
  'components/auth-form.tsx',
  'lib/supabase.ts',
  'lib/auth-context.tsx',
  'supabase/schema.sql'
];

let allFilesExist = true;
keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

console.log('\n🎯 Setup Status:');
if (missingDeps.length === 0 && allFilesExist) {
  console.log('✅ All files and dependencies are ready!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Copy .env.local.example to .env.local');
  console.log('3. Fill in your environment variables');
  console.log('4. Run: npm run dev');
} else {
  console.log('❌ Setup incomplete - please fix the issues above');
}
