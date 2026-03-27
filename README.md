# 🛡️ CareNest | Elder Health Monitoring System

CareNest is a professional-grade, role-based health monitoring application designed for elder care. It enables families and healthcare providers to track vital signs, manage patient records, and receive smart alerts for critical health events.

[![Deployment Status](https://img.shields.io/badge/Status-Ready-brightgreen)](https://care-nest-zeta.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://mongodb.com)

## 🎯 Key Features

### 🔐 Sophisticated Role-Based Access (RBAC)
- **Super Admin**: Full control over user accounts and system configuration.
- **Care Manager**: Dedicated tools for data entry and monitoring multiple patients.
- **Parent (Primary Owner)**: Full access to their own child/elder's health records.
- **Child (Read-only)**: Secure, limited access to monitor parents' vital metrics.

### 🔍 Smart Patient Lookup
- Privacy-first approach using unique **Patient Codes** (e.g., `CN-0001`).
- Secure gating mechanism ensuring that parents and children only see authorized data.

### 📊 Real-time Health Dashboard
- **Live Metrics**: Heart Rate (BPM), Oxygen Levels (SpO2), and Blood Pressure.
- **Dynamic Charts**: Interactive visualization of health trends using `Recharts`.
- **Smart Alerts**: Automated detection of critical conditions (e.g., Low Oxygen < 92%).

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide icons |
| **Backend** | Node.js, Express, Socket.io (Real-time events) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Deployment** | Vercel (Optimized Serverless Mono-repo) |

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- MongoDB Atlas account (with `0.0.0.0/0` whitelisted)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/thenameisadityyaa/CareNest.git
   cd CareNest
   ```
2. Install dependencies for Both Frontend AND Backend:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
3. Set up environment variables in `.env`:
   ```env
   MONGO_URI=mongodb+srv://your_uri
   JWT_SECRET=your_secret
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start development server:
   ```bash
   npm run dev
   # In a separate terminal
   node backend/server.js
   ```

## 🌐 Deployment (Vercel Optimization)

CareNest is optimized for Vercel's serverless environment including:
- **Connection Caching**: Prevents database connection exhaustion during function execution.
- **API Rewrites**: Unified mono-repo routing using `vercel.json`.
- **Vercel Analytics & Speed Insights**: Integrated for real-time performance monitoring.

---
Built with ❤️ by [thenameisadityyaa](https://github.com/thenameisadityyaa)
