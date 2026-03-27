require('dotenv').config();
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./routes/authRoutes');
const healthRoutes  = require('./routes/healthRoutes');
const patientRoutes = require('./routes/patientRoutes');
const adminRoutes   = require('./routes/adminRoutes');

const app    = express();
const server = http.createServer(app);

// ─── Environment Variables (Production Ready) ───────────────────────────────
const PORT       = process.env.PORT || 5000;
const MONGO_URI   = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carenest';
console.log('📡 DB Connection:', MONGO_URI.includes('mongodb+srv') ? 'ATLAS (Cloud)' : 'LOCAL (127.0.0.1)');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ─── Socket.io ───────────────────────────────────────────────────────────────
// NOTE: Socket.io does not work reliably on Vercel Serverless Functions.
// For full real-time support, host this backend on Render, Railway, or Heroku.
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('join_patient_room', (patientId) => {
    socket.join(`patient_${patientId}`);
  });

  socket.on('leave_patient_room', (patientId) => {
    socket.leave(`patient_${patientId}`);
  });

  socket.on('disconnect', () => { /* Logic here */ });
});

app.set('io', io);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Often needed for SPAs in production
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);

// Root route for monitoring
app.get('/', (req, res) => res.send('CareNest API is running...'));

// ─── Database + Start ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => console.error('MongoDB error:', err));
} else {
  // On Vercel, we connect to DB on first request (Serverless style)
  mongoose.connect(MONGO_URI);
}

module.exports = app;
