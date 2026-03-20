// Check users and their manager assignments in Railway database
const mysql = require('mysql2/promise');

async function checkUsers() {
  console.log('\n🔍 Checking Railway Database Users...\n');

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

    // Get all users
    const [users] = await connection.execute(`
      SELECT 
        u.id, 
        u.employee_id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.role, 
        u.manager_id,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      ORDER BY u.id
    `);

    console.log('📋 All Users:\n');
    console.log('ID | Employee ID | Name | Email | Role | Manager ID | Manager Name');
    console.log('─'.repeat(100));
    
    users.forEach(user => {
      const managerName = user.manager_first_name 
        ? `${user.manager_first_name} ${user.manager_last_name}` 
        : 'None';
      console.log(
        `${user.id} | ${user.employee_id} | ${user.first_name} ${user.last_name} | ${user.email} | ${user.role} | ${user.manager_id || 'NULL'} | ${managerName}`
      );
    });

    // Get leave requests
    console.log('\n📋 Leave Requests:\n');
    const [leaves] = await connection.execute(`
      SELECT 
        lr.id,
        lr.user_id,
        u.first_name,
        u.last_name,
        u.manager_id,
        lr.status,
        lr.start_date,
        lr.end_date,
        lt.name as leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      ORDER BY lr.created_at DESC
    `);

    if (leaves.length === 0) {
      console.log('No leave requests found.');
    } else {
      console.log('ID | User | Manager ID | Status | Leave Type | Dates');
      console.log('─'.repeat(100));
      leaves.forEach(leave => {
        console.log(
          `${leave.id} | ${leave.first_name} ${leave.last_name} (ID: ${leave.user_id}) | ${leave.manager_id || 'NULL'} | ${leave.status} | ${leave.leave_type} | ${leave.start_date} to ${leave.end_date}`
        );
      });
    }

    // Check for users without managers
    const usersWithoutManagers = users.filter(u => u.role === 'employee' && !u.manager_id);
    
    if (usersWithoutManagers.length > 0) {
      console.log('\n⚠️  WARNING: Found employees without managers:\n');
      usersWithoutManagers.forEach(user => {
        console.log(`- ${user.first_name} ${user.last_name} (${user.email}) - ID: ${user.id}`);
      });
      
      console.log('\n💡 Fix: Assign these users to a manager');
      console.log('Run this SQL in Railway:');
      usersWithoutManagers.forEach(user => {
        console.log(`UPDATE users SET manager_id = 1 WHERE id = ${user.id};`);
      });
    } else {
      console.log('\n✅ All employees have managers assigned!');
    }

    await connection.end();
    console.log('\n🔌 Disconnected\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkUsers().catch(console.error);
