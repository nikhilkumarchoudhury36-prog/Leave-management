// Check Railway environment variables
const { execSync } = require('child_process');

console.log('🔍 Checking Railway Environment Variables...\n');

try {
  const output = execSync('railway variables', { encoding: 'utf-8' });
  console.log(output);
  
  console.log('\n📋 Looking for required variables:');
  console.log('✓ MYSQL_URL or DATABASE_URL - for database connection');
  console.log('✓ JWT_SECRET - for authentication');
  console.log('\nIf any are missing, you need to add them in Railway dashboard.\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nTry running: railway variables');
}
