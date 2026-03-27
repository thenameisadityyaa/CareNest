const express = require('express');
const router  = express.Router();
const HealthData = require('../models/HealthData');
const Alert      = require('../models/Alert');
const { auth, authorizeRoles } = require('../middleware/auth');

// ─── POST /api/health ─────────────────────────────────────────────────────────
// Accessible by: Care Manager, Child, Admin
router.post('/health', auth, authorizeRoles('caremanager', 'child', 'admin'), async (req, res) => {
  try {
    const io = req.app.get('io');   // Socket.io instance injected by server.js
    const { patientId, heartRate, oxygen, bpSystolic, bpDiastolic } = req.body;

    // ── Smart Alert Logic ─────────────────────────────────────────────────────
    let alertType    = null;
    const alertParts = [];

    if (heartRate < 50 || heartRate > 110) {
      alertType = 'warning';
      alertParts.push(`Heart rate is abnormal (${heartRate} bpm)`);
    }
    if (bpSystolic > 140 || bpDiastolic > 90) {
      alertType = 'warning';
      alertParts.push(`Blood pressure is high (${bpSystolic}/${bpDiastolic} mmHg)`);
    }
    if (oxygen < 92) {
      alertType = 'critical';   // critical overrides warning
      alertParts.push(`Oxygen levels critically low (${oxygen}%)`);
    }

    // ── Write to MongoDB ──────────────────────────────────────────────────────
    const healthData = new HealthData({ patientId, heartRate, oxygen, bpSystolic, bpDiastolic });
    await healthData.save();

    let savedAlert = null;
    if (alertType) {
      savedAlert = new Alert({ patientId, type: alertType, message: alertParts.join(' | ') });
      await savedAlert.save();
    }

    // ── Real-time broadcast (per-patient room) ───────────────────────────────
    // Only clients that called join_patient_room(<patientId>) will receive this
    io.to(`patient_${patientId}`).emit('health_update', {
      record: healthData,
      alert:  savedAlert,
    });

    res.status(201).json(healthData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/patient/:id — Full history (newest first → reversed for charts) ─
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const data = await HealthData
      .find({ patientId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50);            // increased from 20 for richer chart history
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/alerts/:patientId ───────────────────────────────────────────────
router.get('/alerts/:patientId', auth, async (req, res) => {
  try {
    const alerts = await Alert
      .find({ patientId: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
