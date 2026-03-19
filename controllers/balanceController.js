const db = require('../config/db');

// Get current user's leave balances
exports.getBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const [balances] = await db.query(
      `SELECT 
        lb.id, lb.total_days, lb.used_days, lb.remaining_days, lb.year,
        lt.name as leave_type, lt.carry_over
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.user_id = ? AND lb.year = ?
      ORDER BY lt.name`,
      [userId, currentYear]
    );

    res.json(balances);
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balances' });
  }
};

// Get specific user's leave balances (manager access)
exports.getUserBalances = async (req, res) => {
  try {
    const { userId } = req.params;
    const managerId = req.user.id;
    const currentYear = new Date().getFullYear();

    // Verify manager has access to this employee
    const [users] = await db.query(
      'SELECT manager_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role === 'manager' && users[0].manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [balances] = await db.query(
      `SELECT 
        lb.id, lb.total_days, lb.used_days, lb.remaining_days, lb.year,
        lt.name as leave_type, lt.carry_over
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.user_id = ? AND lb.year = ?
      ORDER BY lt.name`,
      [userId, currentYear]
    );

    res.json(balances);
  } catch (error) {
    console.error('Get user balances error:', error);
    res.status(500).json({ error: 'Failed to fetch user balances' });
  }
};
