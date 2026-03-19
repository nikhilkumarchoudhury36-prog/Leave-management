const db = require('../config/db');
const { validationResult } = require('express-validator');

// Helper: Calculate working days excluding weekends and holidays
const calculateWorkingDays = (startDate, endDate, holidays) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  const holidaySet = new Set(holidays.map(h => h.date));

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    
    // Exclude weekends (0 = Sunday, 6 = Saturday) and holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Get all leave requests for current user or their reports
exports.getLeaves = async (req, res) => {
  try {
    const { status, year } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        lr.id, lr.user_id, lr.start_date, lr.end_date, lr.total_days, 
        lr.reason, lr.status, lr.created_at, lr.updated_at,
        lr.review_comment, lr.reviewed_at,
        lt.name as leave_type,
        u.first_name, u.last_name, u.employee_id, u.department,
        r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users r ON lr.reviewed_by = r.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by user role
    if (userRole === 'employee') {
      query += ' AND lr.user_id = ?';
      params.push(userId);
    } else if (userRole === 'manager') {
      query += ' AND (lr.user_id = ? OR u.manager_id = ?)';
      params.push(userId, userId);
    }

    // Filter by status
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    // Filter by year
    if (year) {
      query += ' AND YEAR(lr.start_date) = ?';
      params.push(year);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [leaves] = await db.query(query, params);
    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

// Create new leave request
exports.createLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaveTypeId, startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }

    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Fetch holidays
    const [holidays] = await db.query(
      'SELECT date FROM holidays WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    // Calculate working days
    const totalDays = calculateWorkingDays(start, end, holidays);

    if (totalDays === 0) {
      return res.status(400).json({ error: 'No working days in selected range' });
    }

    // Check leave balance
    const currentYear = start.getFullYear();
    const [balances] = await db.query(
      'SELECT remaining_days FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?',
      [userId, leaveTypeId, currentYear]
    );

    if (balances.length === 0) {
      return res.status(400).json({ error: 'Leave balance not found for this year' });
    }

    if (balances[0].remaining_days < totalDays) {
      return res.status(400).json({ 
        error: 'Insufficient leave balance',
        required: totalDays,
        available: balances[0].remaining_days
      });
    }

    // Insert leave request
    const [result] = await db.query(
      'INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, leaveTypeId, startDate, endDate, totalDays, reason]
    );

    res.status(201).json({ 
      message: 'Leave request submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

// Get single leave request
exports.getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [leaves] = await db.query(
      `SELECT 
        lr.*, lt.name as leave_type,
        u.first_name, u.last_name, u.employee_id, u.department, u.manager_id
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ?`,
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaves[0];

    // Check access: owner or their manager
    if (userRole === 'employee' && leave.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (userRole === 'manager' && leave.user_id !== userId && leave.manager_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch leave request' });
  }
};

// Cancel leave request
exports.cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if request exists and belongs to user
    const [leaves] = await db.query(
      'SELECT status FROM leave_requests WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaves[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be cancelled' });
    }

    // Update status
    await db.query(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
};
