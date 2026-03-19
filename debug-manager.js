require('dotenv').config();
const db = require('./config/db');

async function debugManager() {
  try {
    console.log('=== Debugging Manager Dashboard ===\n');
    
    // Check users
    console.log('1. Checking users...');
    const [users] = await db.query('SELECT id, employee_id, first_name, last_name, role, manager_id FROM users');
    console.log('Users:');
    users.forEach(u => {
      console.log(`  - ${u.employee_id}: ${u.first_name} ${u.last_name} (${u.role}) - Manager ID: ${u.manager_id}`);
    });
    console.log('');
    
    // Check leave requests
    console.log('2. Checking leave requests...');
    const [requests] = await db.query(`
      SELECT 
        lr.id, lr.status, lr.start_date, lr.end_date,
        u.first_name, u.last_name, u.manager_id,
        lt.name as leave_type
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      ORDER BY lr.created_at DESC
    `);
    
    console.log(`Total leave requests: ${requests.length}`);
    requests.forEach(r => {
      console.log(`  - ID ${r.id}: ${r.first_name} ${r.last_name} - ${r.leave_type} (${r.status}) - Manager: ${r.manager_id}`);
    });
    console.log('');
    
    // Check pending requests for manager ID 1
    console.log('3. Checking pending requests for Manager ID 1...');
    const [pending] = await db.query(`
      SELECT 
        lr.id, lr.start_date, lr.end_date, lr.total_days, lr.reason, 
        lr.created_at, lr.status,
        lt.name as leave_type,
        u.id as user_id, u.first_name, u.last_name, u.employee_id, u.department
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      WHERE u.manager_id = 1 AND lr.status = 'pending'
      ORDER BY lr.created_at ASC
    `);
    
    console.log(`Pending requests for Manager 1: ${pending.length}`);
    if (pending.length > 0) {
      pending.forEach(p => {
        console.log(`  - ${p.first_name} ${p.last_name}: ${p.leave_type} from ${p.start_date} to ${p.end_date}`);
      });
    } else {
      console.log('  No pending requests found!');
    }
    console.log('');
    
    // Check team for manager ID 1
    console.log('4. Checking team for Manager ID 1...');
    const [team] = await db.query('SELECT id, employee_id, first_name, last_name, department FROM users WHERE manager_id = 1');
    console.log(`Team members: ${team.length}`);
    team.forEach(t => {
      console.log(`  - ${t.employee_id}: ${t.first_name} ${t.last_name} (${t.department})`);
    });
    
    console.log('\n=== Debug Complete ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debugManager();
