// Generate proper bcrypt hashes for Railway database
const bcrypt = require('bcryptjs');

async function generateHashes() {
  console.log('Generating bcrypt hashes for Railway database...\n');
  
  const password = 'Admin@123';
  
  // Generate 5 hashes (one for each user)
  const hashes = [];
  for (let i = 0; i < 5; i++) {
    const hash = await bcrypt.hash(password, 10);
    hashes.push(hash);
  }
  
  console.log('Password for all users: Admin@123\n');
  console.log('Copy these hashes into database/schema-railway.sql:\n');
  
  hashes.forEach((hash, index) => {
    console.log(`User ${index + 1}: '${hash}',`);
  });
  
  console.log('\n--- SQL INSERT Statement ---\n');
  console.log(`INSERT INTO users (employee_id, first_name, last_name, email, password_hash, role, manager_id, department) VALUES`);
  console.log(`('EMP001', 'Admin', 'User', 'admin@company.com', '${hashes[0]}', 'admin', NULL, 'Management'),`);
  console.log(`('EMP002', 'John', 'Manager', 'manager@company.com', '${hashes[1]}', 'manager', NULL, 'Management'),`);
  console.log(`('EMP003', 'John', 'Doe', 'john.doe@company.com', '${hashes[2]}', 'employee', 1, 'Engineering'),`);
  console.log(`('EMP004', 'Jane', 'Smith', 'jane.smith@company.com', '${hashes[3]}', 'employee', 1, 'Marketing'),`);
  console.log(`('EMP005', 'Bob', 'Wilson', 'bob.wilson@company.com', '${hashes[4]}', 'employee', 1, 'Sales');`);
}

generateHashes().catch(console.error);
