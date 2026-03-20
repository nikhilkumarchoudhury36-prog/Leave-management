// Fix manager assignment for users
const mysql = require('mysql2/promise');

async function fixManagerAssignment() {
  console.log('\n🔧 Fixing Manager Assignments...\n');

  const password = 'NkbjyJsLTrmsdARjRZnsIkwtgyyXOGfD';

  try {
    const connection = await mysql.createConnection({
      host: 'autorack.proxy.rlwy.net',
      port: 22260,
      user: 'root',
      password: password,
      database: 'railway'
    });

    console.log('✅ Connected to Railway MySQL\n');

    // Update all employees to have manager_id = 2 (John Manager)
    const [result] = await connection.execute(`
      UPDATE users 
      SET manager_id = 2 
      WHERE role = 'employee' AND manager_id != 2
    `);

    console.log(`✅ Updated ${result.affectedRows} users to have Manager (ID: 2) as their manager\n`);

    // Verify the changes
    const [users] = await connection.execute(`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.role, 
        u.manager_id,
        m.first_name as manager_first_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      WHERE u.role = 'employee'
      ORDER BY u.id
    `);

    console.log('📋 Updated Employee List:\n');
    users.forEach(user => {
      console.log(`✅ ${user.first_name} ${user.last_name} → Manager: ${user.manager_first_name} (ID: ${user.manager_id})`);
    });

    await connection.end();
    console.log('\n🎉 Done! Now login as manager@company.com to see all leave requests.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

fixManagerAssignment().catch(console.error);
