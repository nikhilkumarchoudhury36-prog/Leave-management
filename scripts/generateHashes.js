const bcrypt = require('bcryptjs');

console.log('Generating password hashes...\n');
console.log('Manager password (Admin@123):');
console.log(bcrypt.hashSync('Admin@123', 10));
console.log('\nEmployee password (Emp@1234):');
console.log(bcrypt.hashSync('Emp@1234', 10));
