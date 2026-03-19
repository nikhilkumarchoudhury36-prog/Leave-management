require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function setupUsers() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'leave_management',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database...');

    // Generate hashes
    const managerHash = await bcrypt.hash('Admin@123', 10);
    const employeeHash = await bcrypt.hash('Emp@1234', 10);

    console.log('Updating user passwords...');

    // Update manager password
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [managerHash, 'manager@company.com']
    );

    // Update employee passwords
    const employeeEmails = ['emp1@company.com', 'emp2@company.com', 'emp3@company.com', 'emp4@company.com'];
    for (const email of employeeEmails) {
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [employeeHash, email]
      );
    }

    console.log('✓ User passwords updated successfully!');
    console.log('\nDefault credentials:');
    console.log('Manager: manager@company.com / Admin@123');
    console.log('Employees: emp1@company.com ... emp4@company.com / Emp@1234');
    
  } catch (error) {
    console.error('Setup error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupUsers();
