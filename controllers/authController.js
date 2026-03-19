const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Register new employee
exports.register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, department } = req.body;

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate employee_id
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const employeeId = `EMP${String(countResult[0].count + 1).padStart(3, '0')}`;

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (employee_id, first_name, last_name, email, password_hash, department) VALUES (?, ?, ?, ?, ?, ?)',
      [employeeId, firstName, lastName, email, passwordHash, department]
    );

    const userId = result.insertId;

    // Create leave balances for current year
    const currentYear = new Date().getFullYear();
    const [leaveTypes] = await db.query('SELECT id, default_days FROM leave_types');
    
    for (const leaveType of leaveTypes) {
      await db.query(
        'INSERT INTO leave_balances (user_id, leave_type_id, year, total_days) VALUES (?, ?, ?, ?)',
        [userId, leaveType.id, currentYear, leaveType.default_days]
      );
    }

    res.status(201).json({ 
      message: 'Registration successful', 
      employeeId 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, employee_id, first_name, last_name, email, password_hash, role, department FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        employeeId: user.employee_id,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, employee_id, first_name, last_name, email, role, department FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
