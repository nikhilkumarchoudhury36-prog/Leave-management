// Import schema to Railway MySQL using the connection details
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  console.log('🚀 Starting Railway MySQL import...\n');
  
  // Railway connection details from your Railway dashboard
  const connection = await mysql.createConnection({
    host: 'autorack.proxy.rlwy.net',
    port: 22260,
    user: 'root',
    password: process.env.RAILWAY_MYSQL_PASSWORD || '', // You'll need to provide this
    database: 'railway'
  });

  console.log('✅ Connected to Railway MySQL\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema-railway.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons to get individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        const [result] = await connection.execute(statement);
        
        // Show progress
        if (statement.toUpperCase().includes('INSERT INTO users')) {
          console.log('✅ Users inserted');
        } else if (statement.toUpperCase().includes('INSERT INTO leave_types')) {
          console.log('✅ Leave types inserted');
        } else if (statement.toUpperCase().includes('INSERT INTO leave_balances')) {
          console.log('✅ Leave balances inserted');
        } else if (statement.toUpperCase().includes('INSERT INTO holidays')) {
          console.log('✅ Holidays inserted');
        } else if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
          console.log(`✅ Table created: ${tableName}`);
        } else if (statement.toUpperCase().includes('DROP TABLE')) {
          console.log('🗑️  Cleaned up old tables');
        }
      } catch (err) {
        // Ignore "table doesn't exist" errors for DROP statements
        if (!err.message.includes("doesn't exist") && !statement.toUpperCase().includes('DROP')) {
          console.error(`❌ Error executing statement: ${err.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Verify the import
    console.log('\n📊 Verifying import...\n');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users: ${users[0].count}`);
    
    const [leaveTypes] = await connection.execute('SELECT COUNT(*) as count FROM leave_types');
    console.log(`✅ Leave types: ${leaveTypes[0].count}`);
    
    const [leaveBalances] = await connection.execute('SELECT COUNT(*) as count FROM leave_balances');
    console.log(`✅ Leave balances: ${leaveBalances[0].count}`);
    
    const [holidays] = await connection.execute('SELECT COUNT(*) as count FROM holidays');
    console.log(`✅ Holidays: ${holidays[0].count}`);

    console.log('\n🎉 Import completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Visit your Railway app health endpoint: /api/health');
    console.log('2. Should show users: 5, leaveTypes: 4');
    console.log('3. Test login with: manager@company.com / Admin@123');
    console.log('4. Test registration - should work now!\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Disconnected from Railway MySQL');
  }
}

// Get password from command line argument or environment variable
const password = process.argv[2] || process.env.RAILWAY_MYSQL_PASSWORD;

if (!password) {
  console.error('❌ Error: MySQL password required!');
  console.error('\nUsage:');
  console.error('  node import-to-railway.js YOUR_MYSQL_PASSWORD');
  console.error('\nOr set environment variable:');
  console.error('  $env:RAILWAY_MYSQL_PASSWORD="your_password"');
  console.error('  node import-to-railway.js');
  process.exit(1);
}

process.env.RAILWAY_MYSQL_PASSWORD = password;

importSchema().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
