const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Vibe Coach Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  // Read and check contents
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log(`📄 Found ${lines.length} environment variables`);
  
  // Check for placeholder values
  const placeholders = lines.filter(line => 
    line.includes('your_') || 
    line.includes('placeholder') ||
    line.endsWith('=') ||
    line.split('=')[1]?.trim() === ''
  );
  
  if (placeholders.length > 0) {
    console.log('⚠️  Found placeholder values:');
    placeholders.forEach(line => {
      const [key] = line.split('=');
      console.log(`   - ${key}`);
    });
  } else {
    console.log('✅ No placeholder values found');
  }
  
  // Check specific variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXTAUTH_SECRET'
  ];
  
  console.log('\n🔑 Checking required variables:');
  requiredVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(varName + '='));
    if (line) {
      const value = line.split('=')[1];
      if (value && !value.includes('your_') && !value.includes('placeholder')) {
        console.log(`   ✅ ${varName}: Set`);
      } else {
        console.log(`   ❌ ${varName}: Placeholder value`);
      }
    } else {
      console.log(`   ❌ ${varName}: Missing`);
    }
  });
  
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Create .env.local with your Supabase and OpenAI credentials');
}

console.log('\n🚀 Next steps:');
console.log('1. Fix any issues above');
console.log('2. Run: npm run dev');
console.log('3. Check the diagnostic button on the homepage');
console.log('4. See TROUBLESHOOTING.md for detailed help');
