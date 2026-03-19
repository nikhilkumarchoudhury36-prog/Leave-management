const db = require('../config/db');

// Get calendar data for a specific month
exports.getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

    let query = `
      SELECT 
        lr.id, lr.start_date, lr.end_date, lr.status,
        lt.name as leave_type,
        u.first_name, u.last_name, u.employee_id, u.department
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      WHERE lr.status = 'approved'
        AND (
          (lr.start_date BETWEEN ? AND ?) OR
          (lr.end_date BETWEEN ? AND ?) OR
          (lr.start_date <= ? AND lr.end_date >= ?)
        )
    `;
    const params = [startDate, endDate, startDate, endDate, startDate, endDate];

    // Filter by role
    if (userRole === 'employee') {
      query += ' AND u.department = (SELECT department FROM users WHERE id = ?)';
      params.push(userId);
    } else if (userRole === 'manager') {
      query += ' AND (u.manager_id = ? OR u.id = ?)';
      params.push(userId, userId);
    }

    query += ' ORDER BY lr.start_date';

    const [leaves] = await db.query(query, params);

    // Fetch holidays for the month
    const [holidays] = await db.query(
      'SELECT id, name, date FROM holidays WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    res.json({
      leaves,
      holidays
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
};
