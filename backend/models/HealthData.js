const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  heartRate: { type: Number, required: true },
  oxygen: { type: Number, required: true },
  bpSystolic: { type: Number, required: true },
  bpDiastolic: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthData', healthDataSchema);
