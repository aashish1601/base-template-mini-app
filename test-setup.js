// Quick test to verify environment is configured correctly
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Environment Configuration...\n');

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
  const value = process.env[test.key];
  const status = value ? '✅' : (test.required ? '❌' : '⏸️ ');
  const display = value ? `${value.substring(0, 20)}...` : 'Not set';
  
  console.log(`${status} ${test.name.padEnd(20)} ${test.required ? '(Required)' : '(Optional)'}`);
  
  if (test.required && !value) {
    failed++;
  } else if (value) {
    passed++;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 Results: ${passed} configured, ${failed} missing required keys\n`);

if (failed === 0) {
  console.log('🎉 SUCCESS! All required keys are configured.');
  console.log('✅ Your app is ready to run!\n');
  console.log('Start the server:');
  console.log('  npm run dev\n');
  process.exit(0);
} else {
  console.log('❌ FAILED! Missing required configuration.');
  console.log('Check .env.local file.\n');
  process.exit(1);
}
