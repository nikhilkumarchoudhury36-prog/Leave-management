const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Register new employee
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, department: req.body.department });
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, department } = req.body;

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate employee_id
    console.log('Generating employee ID...');
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const employeeId = `EMP${String(countResult[0].count + 1).padStart(3, '0')}`;
    console.log('Generated employee ID:', employeeId);

    // Get first manager to assign
    console.log('Finding manager...');
    const [managers] = await db.query(
      'SELECT id FROM users WHERE role IN ("manager", "admin") ORDER BY id LIMIT 1'
    );
    const managerId = managers.length > 0 ? managers[0].id : null;
    console.log('Assigned manager ID:', managerId);

    // Insert user
    console.log('Inserting user...');
    const [result] = await db.query(
      'INSERT INTO users (employee_id, first_name, last_name, email, password_hash, department, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employeeId, firstName, lastName, email, passwordHash, department, managerId]
    );

    const userId = result.insertId;
    console.log('User created with ID:', userId);

    // Create leave balances for current year
    console.log('Creating leave balances...');
    const currentYear = new Date().getFullYear();
    const [leaveTypes] = await db.query('SELECT id, default_days FROM leave_types');
    console.log('Found leave types:', leaveTypes.length);
    
    for (const leaveType of leaveTypes) {
      await db.query(
        'INSERT INTO leave_balances (user_id, leave_type_id, year, total_days) VALUES (?, ?, ?, ?)',
        [userId, leaveType.id, currentYear, leaveType.default_days]
      );
    }
    console.log('Leave balances created');

    console.log('Registration successful for:', email);
    res.status(201).json({ 
      message: 'Registration successful', 
      employeeId 
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL message:', error.sqlMessage);
    console.error('Stack:', error.stack);
    console.error('========================');
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
