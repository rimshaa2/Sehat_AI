const express = require('express');
const http = require('http'); // <--- NEW: Required for Sockets
const { Server } = require('socket.io'); // <--- NEW: Socket.io Library
const { connectDB } = require('./config/database');
const { User, Doctor, Appointment } = require('./models/index');

require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app); // <--- WRAP EXPRESS APP
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all connections (React Native/Web)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);

// ⚡ REAL-TIME EMERGENCY SOCKET LOGIC ⚡
// Reference: SDS Figure 16 - Emergency Trigger Workflow
io.on('connection', (socket) => {
  console.log('⚡ User Connected to Real-Time Layer:', socket.id);

  // 1. Listen for SOS Trigger
  socket.on('EMERGENCY_TRIGGER', (data) => {
    const { patientId, location, type } = data;
    console.log(`🚨 SOS RECEIVED from Patient ${patientId} at ${location}`);

    // 2. Broadcast to Ambulance/Admins (Room: 'emergency_responders')
    io.to('emergency_responders').emit('NEW_EMERGENCY', {
      alertId: Date.now(),
      patientId,
      location,
      type: type || 'General Emergency',
      timestamp: new Date()
    });
    
    // 3. Confirm receipt to the sender
    socket.emit('EMERGENCY_ACKNOWLEDGED', { status: 'Help is on the way!' });
  });

  // Allow Doctors/Admins to join the "Responders" room
  socket.on('JOIN_RESPONDERS', () => {
    socket.join('emergency_responders');
    console.log(`👨‍⚕️ Doctor/Admin ${socket.id} joined Emergency Channel`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
  });
});

// Pass 'io' to routes if needed (e.g., to trigger alerts from API calls)
app.set('io', io);

const startServer = async () => {
  await connectDB();
  // ⚡ CHANGE: app.listen -> server.listen
  server.listen(PORT, () => {
    console.log(`\n🚀 Server + Sockets running on http://localhost:${PORT}`);
    console.log('-------------------------------------------');
  });
};

startServer();