const express = require('express');
const router  = express.Router();
const Patient = require('../models/Patient');
const { auth, authorizeRoles } = require('../middleware/auth');

// ── GET /api/patients/me ──────────────────────────────────────────────────────
// Returns the patient(s) linked to the current user based on their role
router.get('/me', auth, async (req, res) => {
  try {
    const role = req.user.role;
    let query  = {};
    if (role === 'caremanager') query = { careManagerId: req.user._id };
    else if (role === 'parent') query = { parentId: req.user._id };
    else if (role === 'child')  query = { childId: req.user._id };

    const patients = await Patient.find(query);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/patients/lookup?code=CN-0001 ─────────────────────────────────────
// Care Manager enters a patient code — returns that patient if it exists.
// Restricted to caremanager role only.
router.get('/lookup', auth, authorizeRoles('caremanager'), async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide a patient code.' });
    }

    const patient = await Patient.findOne({
      patientCode: code.trim().toUpperCase()
    });

    if (!patient) {
      return res.status(404).json({ error: `No patient found with code "${code.trim().toUpperCase()}".` });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
