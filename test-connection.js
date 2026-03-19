// Test database connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST || 'localhost');
  console.log('  User:', process.env.DB_USER || 'root');
  console.log('  Password:', process.env.DB_PASSWORD ? '***' : '(empty)');
  console.log('  Database:', process.env.DB_NAME || 'leave_management');
  console.log('  Port:', process.env.DB_PORT || 3306);
  console.log('\n');

  try {
    // Test 1: Connect to MySQL server (without database)
    console.log('Test 1: Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    console.log('✓ Successfully connected to MySQL server!\n');

    // Test 2: Check if database exists
    console.log('Test 2: Checking if database exists...');
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'leave_management']);
    
    if (databases.length === 0) {
      console.log('✗ Database does not exist!');
      console.log('\nTo create the database, run ONE of these options:\n');
      console.log('Option 1 - Command line:');
      console.log('  mysql -u root -p < database/schema.sql\n');
      console.log('Option 2 - MySQL Workbench:');
      console.log('  1. Open MySQL Workbench');
      console.log('  2. Connect to your server');
      console.log('  3. File → Open SQL Script → select database/schema.sql');
      console.log('  4. Click the lightning bolt to execute\n');
      await connection.end();
      return;
    }
    
    console.log('✓ Database exists!\n');

    // Test 3: Connect to the database
    console.log('Test 3: Connecting to the database...');
    await connection.query(`USE ${process.env.DB_NAME || 'leave_management'}`);
    console.log('✓ Successfully connected to database!\n');

    // Test 4: Check tables
    console.log('Test 4: Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('✗ No tables found! Database is empty.');
      console.log('\nYou need to import the schema.sql file.');
      await connection.end();
      return;
    }

    console.log(`✓ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    console.log('');

    // Test 5: Check users
    console.log('Test 5: Checking users...');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Found ${users[0].count} users in database\n`);

    if (users[0].count === 0) {
      console.log('⚠ No users found! The database is empty.');
      console.log('Run: npm run setup\n');
    } else {
      console.log('✓ All tests passed! Database is ready.\n');
      console.log('Next step: Run "npm run setup" to hash passwords');
      console.log('Then start the server: npm start');
    }

    await connection.end();
    console.log('\n✓ Connection test completed successfully!');

  } catch (error) {
    console.error('\n✗ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nCommon solutions:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('1. MySQL server is not running');
      console.error('   → Start MySQL service:');
      console.error('   → Press Win+R, type "services.msc", find MySQL, right-click → Start\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('1. Wrong username or password');
      console.error('   → Check your .env file');
      console.error('   → Make sure DB_USER and DB_PASSWORD are correct\n');
    } else if (error.code === 'ENOTFOUND') {
      console.error('1. Wrong hostname');
      console.error('   → Check DB_HOST in .env file (should be "localhost")\n');
    }
    
    console.error('2. Verify your .env file exists and has correct values');
    console.error('3. Check MySQL is installed and running');
    
    process.exit(1);
  }
}

testConnection();
