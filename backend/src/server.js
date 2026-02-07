const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/database');
const { sequelize, User, Doctor, Appointment } = require('./models/index');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const seedAdmin = require('./scripts/seedAdmin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'https://your-admin-panel.vercel.app' // Future deployment
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy: This origin is not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// ✅ ADD THESE ROUTES - IMPORTANT!
// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Sehat AI Backend API is running!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      ai: '/api/ai',
      health: '/health',
      socket: 'ws://' + (req.headers.host || `localhost:${PORT}`)
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ Health check endpoint (Railway monitors this)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Sehat AI Backend',
    database: 'Connected',
    sockets: 'Active',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/records', medicalRecordRoutes);

// REAL-TIME EMERGENCY SOCKET LOGIC
io.on('connection', (socket) => {
  console.log('⚡ User Connected to Real-Time Layer:', socket.id);

  socket.on('EMERGENCY_TRIGGER', (data) => {
    const { patientId, location, type } = data;
    console.log(`🚨 SOS RECEIVED from Patient ${patientId} at ${location}`);

    io.to('emergency_responders').emit('NEW_EMERGENCY', {
      alertId: Date.now(),
      patientId,
      location,
      type: type || 'General Emergency',
      timestamp: new Date()
    });
    
    socket.emit('EMERGENCY_ACKNOWLEDGED', { status: 'Help is on the way!' });
  });

  socket.on('JOIN_RESPONDERS', () => {
    socket.join('emergency_responders');
    console.log(`👨‍⚕️ Doctor/Admin ${socket.id} joined Emergency Channel`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
  });
});

// Pass 'io' to routes
app.set('io', io);

// ADD ERROR HANDLING MIDDLEWARE
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/users',
      'GET /api/doctors',
      'GET /api/appointments',
      'GET /api/ai'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB(); 
    console.log('✅ Database connected');

    // 2. THIS IS THE MISSING PART: Create/Update tables
    // 'alter: true' checks current tables and adds missing columns/tables without deleting data
    await sequelize.sync({ alter: true });
    await seedAdmin(); // Ensure admin user exists on startup
    console.log('✅ Database Tables Synced (Users, Doctors, Appointments)');

  } catch (dbError) {
    console.error('⚠️ Database Error:', dbError);
    // Optional: Exit process if DB fails, so Railway restarts it
    // process.exit(1); 
  }
  
  // 3. Start Server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server + Sockets running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log('-------------------------------------------\n');
  });
};

startServer();