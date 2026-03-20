// Quick script to check Railway deployment status
// Run this after deploying to Railway

const https = require('https');

// REPLACE THIS with your actual Railway app URL
const RAILWAY_URL = 'your-app-name.railway.app';

console.log('🔍 Checking Railway Deployment Status...\n');

// Test 1: Health endpoint
console.log('Test 1: Checking /api/health endpoint...');
https.get(`https://${RAILWAY_URL}/api/health`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log('✅ Health check passed!');
      console.log('Database:', json.database);
      console.log('Stats:', json.stats);
      
      if (json.stats.users === 0) {
        console.log('\n⚠️  WARNING: Database is empty!');
        console.log('   You need to import schema.sql to Railway MySQL');
      } else {
        console.log('\n✅ Database has data!');
      }
    } else {
      console.log('❌ Health check failed');
      console.log('Response:', data);
    }
  });
}).on('error', (err) => {
  console.log('❌ Connection failed:', err.message);
  console.log('\nPossible issues:');
  console.log('1. Railway app is not deployed yet');
  console.log('2. Wrong URL (update RAILWAY_URL in this script)');
  console.log('3. Server not starting on Railway');
});

// Test 2: Main page
console.log('\nTest 2: Checking main page...');
https.get(`https://${RAILWAY_URL}/`, (res) => {
  console.log('Status Code:', res.statusCode);
  
  if (res.statusCode === 200) {
    console.log('✅ Main page is accessible');
  } else {
    console.log('❌ Main page failed');
  }
}).on('error', (err) => {
  console.log('❌ Connection failed:', err.message);
});

console.log('\n📝 Instructions:');
console.log('1. Update RAILWAY_URL in this script with your actual Railway URL');
console.log('2. Run: node check-railway-status.js');
console.log('3. Share the output if you need help debugging\n');
