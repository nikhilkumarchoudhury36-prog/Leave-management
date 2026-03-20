// Automatic Railway MySQL Import Script
// This will import the database schema to Railway automatically

const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function importToRailway() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     Automatic Railway MySQL Database Import Tool        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('📋 Instructions:');
  console.log('1. Go to Railway dashboard: https://railway.app');
  console.log('2. Click on "MySQL" service');
  console.log('3. Click "Connect" tab');
  console.log('4. Find the password (shown as ********)');
  console.log('5. Click "show" button to reveal it');
  console.log('6. Copy the password\n');

  const password = await question('🔑 Paste your Railway MySQL password here: ');
  
  if (!password || password.trim() === '') {
    console.log('\n❌ Error: Password is required!');
    rl.close();
    process.exit(1);
  }

  console.log('\n🔌 Connecting to Railway MySQL...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'autorack.proxy.rlwy.net',
      port: 22260,
      user: 'root',
      password: password.trim(),
      database: 'railway',
      multipleStatements: true
    });

    console.log('✅ Connected successfully!\n');

    // Read schema file
    console.log('📖 Reading schema file...');
    const schemaPath = './database/schema-railway.sql';
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and clean up
    schema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Execute the entire schema at once using multipleStatements
    console.log('⚙️  Executing SQL statements...\n');
    
    try {
      await connection.query(schema);
      console.log('✅ All SQL statements executed successfully!\n');
    } catch (err) {
      console.error(`❌ Error executing schema: ${err.message}`);
      throw err;
    }

    // Verify the import
    console.log('\n📊 Verifying import...\n');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count;
    console.log(`${userCount === 5 ? '✅' : '❌'} Users: ${userCount} ${userCount === 5 ? '(Expected: 5)' : '(ERROR: Expected 5)'}`);
    
    const [leaveTypes] = await connection.execute('SELECT COUNT(*) as count FROM leave_types');
    const leaveTypesCount = leaveTypes[0].count;
    console.log(`${leaveTypesCount === 4 ? '✅' : '❌'} Leave types: ${leaveTypesCount} ${leaveTypesCount === 4 ? '(Expected: 4)' : '(ERROR: Expected 4)'}`);
    
    const [leaveBalances] = await connection.execute('SELECT COUNT(*) as count FROM leave_balances');
    const balancesCount = leaveBalances[0].count;
    console.log(`${balancesCount === 20 ? '✅' : '❌'} Leave balances: ${balancesCount} ${balancesCount === 20 ? '(Expected: 20)' : '(ERROR: Expected 20)'}`);
    
    const [holidays] = await connection.execute('SELECT COUNT(*) as count FROM holidays');
    const holidaysCount = holidays[0].count;
    console.log(`${holidaysCount === 6 ? '✅' : '❌'} Holidays: ${holidaysCount} ${holidaysCount === 6 ? '(Expected: 6)' : '(ERROR: Expected 6)'}`);

    if (userCount === 5 && leaveTypesCount === 4 && balancesCount === 20 && holidaysCount === 6) {
      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║              🎉 IMPORT SUCCESSFUL! 🎉                    ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      
      console.log('✅ Database is ready!\n');
      console.log('📝 Next steps:\n');
      console.log('1. Visit your Railway app health endpoint:');
      console.log('   https://your-app.railway.app/api/health');
      console.log('   Should show: "users": 5, "leaveTypes": 4\n');
      console.log('2. Test login:');
      console.log('   Email: manager@company.com');
      console.log('   Password: Admin@123\n');
      console.log('3. Test registration:');
      console.log('   Create a new account - should work now!\n');
    } else {
      console.log('\n⚠️  Import completed but counts don\'t match expected values.');
      console.log('Please check the Railway logs for any errors.\n');
    }

  } catch (error) {
    console.log('\n❌ Error occurred:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused. Possible issues:');
      console.log('- Railway MySQL service is not running');
      console.log('- Incorrect host or port');
      console.log('- Network/firewall blocking connection');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Access denied. Possible issues:');
      console.log('- Incorrect password');
      console.log('- Copy the password again from Railway (click "show" button)');
      console.log('- Make sure there are no extra spaces');
    } else {
      console.log('Error:', error.message);
    }
    
    console.log('\n💡 Tip: Double-check your Railway MySQL password');
    console.log('   Go to Railway → MySQL → Connect → Click "show" next to password\n');
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Disconnected from Railway MySQL\n');
    }
    rl.close();
  }
}

// Run the import
importToRailway().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
