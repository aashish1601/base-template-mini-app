import { readFileSync } from 'fs';

console.log('🧪 Testing Environment Configuration...\n');

// Read .env.local
let envVars = {};
try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('❌ Could not read .env.local file');
  process.exit(1);
}

const tests = [
  { name: 'Neynar API Key', key: 'NEYNAR_API_KEY', required: true },
  { name: 'App URL', key: 'NEXT_PUBLIC_URL', required: true },
  { name: 'Oracle Secret', key: 'ORACLE_SECRET', required: true },
  { name: 'Cron Secret', key: 'CRON_SECRET', required: true },
  { name: 'Redis URL', key: 'KV_REST_API_URL', required: false },
  { name: 'Redis Token', key: 'KV_REST_API_TOKEN', required: false },
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  const value = envVars[test.key];
  const status = value ? '✅' : (test.required ? '❌' : '⏸️ ');
  const display = value ? `${value.substring(0, 25)}...` : 'Not set';
  
  console.log(`${status} ${test.name.padEnd(20)} ${test.required ? '(Required)  ' : '(Optional)  '} ${display}`);
  
  if (test.required && !value) {
    failed++;
  } else if (value) {
    passed++;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 Results: ${passed} configured, ${failed} missing required keys\n`);

if (failed === 0) {
  console.log('🎉 SUCCESS! All required keys are configured.');
  console.log('✅ Your app is ready to run!\n');
  console.log('Next steps:');
  console.log('  1. Start the server:  npm run dev');
  console.log('  2. Open browser:      http://localhost:3000/fantasy');
  console.log('  3. Test oracle:       curl -X POST http://localhost:3000/api/oracle/aggregate?test=true\n');
  process.exit(0);
} else {
  console.log('❌ FAILED! Missing required configuration.');
  console.log('Check .env.local file.\n');
  process.exit(1);
}
