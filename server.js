require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const adminRoutes = require('./routes/adminRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join room based on user role
  socket.on('join', (data) => {
    if (data.role === 'manager' || data.role === 'admin') {
      socket.join('managers');
      console.log(`Manager ${data.userId} joined managers room`);
    }
    socket.join(`user_${data.userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check and database test endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/db');
    const [result] = await db.query('SELECT 1 + 1 as result');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [leaveTypes] = await db.query('SELECT COUNT(*) as count FROM leave_types');
    const [managers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role IN ("manager", "admin")');
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      test: result[0].result,
      stats: {
        users: users[0].count,
        leaveTypes: leaveTypes[0].count,
        managers: managers[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
