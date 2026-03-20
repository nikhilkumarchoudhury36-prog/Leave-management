// Direct import to Railway MySQL - no prompts
const mysql = require('mysql2/promise');
const fs = require('fs');

async function importToRailway() {
  console.log('\n🚀 Importing database to Railway MySQL...\n');

  const password = 'NkbjyJsLTrmsdARjRZnsIkwtgyyXOGfD';

  console.log('🔌 Connecting to Railway MySQL...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'autorack.proxy.rlwy.net',
      port: 22260,
      user: 'root',
      password: password,
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

    // Execute the entire schema at once
    console.log('⚙️  Executing SQL statements...\n');
    
    await connection.query(schema);
    console.log('✅ All SQL statements executed successfully!\n');

    // Verify the import
    console.log('📊 Verifying import...\n');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count;
    console.log(`${userCount === 5 ? '✅' : '❌'} Users: ${userCount}`);
    
    const [leaveTypes] = await connection.execute('SELECT COUNT(*) as count FROM leave_types');
    const leaveTypesCount = leaveTypes[0].count;
    console.log(`${leaveTypesCount === 4 ? '✅' : '❌'} Leave types: ${leaveTypesCount}`);
    
    const [leaveBalances] = await connection.execute('SELECT COUNT(*) as count FROM leave_balances');
    const balancesCount = leaveBalances[0].count;
    console.log(`${balancesCount === 20 ? '✅' : '❌'} Leave balances: ${balancesCount}`);
    
    const [holidays] = await connection.execute('SELECT COUNT(*) as count FROM holidays');
    const holidaysCount = holidays[0].count;
    console.log(`${holidaysCount === 6 ? '✅' : '❌'} Holidays: ${holidaysCount}`);

    if (userCount === 5 && leaveTypesCount === 4) {
      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║              🎉 IMPORT SUCCESSFUL! 🎉                    ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      
      console.log('✅ Database is ready!\n');
      console.log('📝 Next: Test your Railway app\n');
      console.log('Visit: https://leave-management-production-55dd.up.railway.app/api/health');
      console.log('Should show: "users": 5, "leaveTypes": 4\n');
      console.log('Login with: manager@company.com / Admin@123\n');
    }

  } catch (error) {
    console.log('\n❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Disconnected from Railway MySQL\n');
    }
  }
}

importToRailway().catch(console.error);
