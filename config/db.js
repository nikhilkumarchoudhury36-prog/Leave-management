const mysql = require('mysql2');
require('dotenv').config();

let pool;

// Railway provides MYSQL_URL or DATABASE_URL
if (process.env.MYSQL_URL) {
  console.log('Using MYSQL_URL for database connection');
  pool = mysql.createPool(process.env.MYSQL_URL);
} else if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for database connection');
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Fallback to individual variables
  console.log('Using individual DB variables for connection');
  pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'leave_management',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Export promise-based pool
module.exports = pool.promise();
