const db = require('../config/db');
const { validationResult } = require('express-validator');

// Get all pending leave requests for manager's team
exports.getPendingRequests = async (req, res) => {
  try {
    const managerId = req.user.id;

    const [requests] = await db.query(
      `SELECT 
        lr.id, lr.start_date, lr.end_date, lr.total_days, lr.reason, 
        lr.created_at, lr.status,
        lt.name as leave_type,
        u.id as user_id, u.first_name, u.last_name, u.employee_id, u.department
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      WHERE u.manager_id = ? AND lr.status = 'pending'
      ORDER BY lr.created_at ASC`,
      [managerId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

// Review leave request (approve/reject)
exports.reviewRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { action, comment } = req.body;
    const managerId = req.user.id;

    // Validate action
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get leave request details
    const [requests] = await db.query(
      `SELECT lr.*, u.manager_id 
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE lr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const request = requests[0];

    // Verify manager has authority
    if (request.manager_id !== managerId) {
      return res.status(403).json({ error: 'You can only review your direct reports' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be reviewed' });
    }

    // Update leave request
    await db.query(
      'UPDATE leave_requests SET status = ?, reviewed_by = ?, review_comment = ?, reviewed_at = NOW() WHERE id = ?',
      [action, managerId, comment, id]
    );

    // If approved, update leave balance
    if (action === 'approved') {
      const year = new Date(request.start_date).getFullYear();
      await db.query(
        'UPDATE leave_balances SET used_days = used_days + ? WHERE user_id = ? AND leave_type_id = ? AND year = ?',
        [request.total_days, request.user_id, request.leave_type_id, year]
      );
    }

    res.json({ message: `Leave request ${action} successfully` });
  } catch (error) {
    console.error('Review request error:', error);
    res.status(500).json({ error: 'Failed to review leave request' });
  }
};

// Get team overview with leave balances
exports.getTeam = async (req, res) => {
  try {
    const managerId = req.user.id;
    const currentYear = new Date().getFullYear();

    const [team] = await db.query(
      `SELECT 
        u.id, u.employee_id, u.first_name, u.last_name, u.email, u.department,
        lb.leave_type_id, lt.name as leave_type,
        lb.total_days, lb.used_days, lb.remaining_days
      FROM users u
      LEFT JOIN leave_balances lb ON u.id = lb.user_id AND lb.year = ?
      LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE u.manager_id = ?
      ORDER BY u.last_name, u.first_name, lt.name`,
      [currentYear, managerId]
    );

    // Group by employee
    const teamMap = {};
    team.forEach(row => {
      if (!teamMap[row.id]) {
        teamMap[row.id] = {
          id: row.id,
          employeeId: row.employee_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          department: row.department,
          balances: []
        };
      }
      if (row.leave_type_id) {
        teamMap[row.id].balances.push({
          leaveType: row.leave_type,
          total: row.total_days,
          used: row.used_days,
          remaining: row.remaining_days
        });
      }
    });

    res.json(Object.values(teamMap));
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team data' });
  }
};
