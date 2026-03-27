const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientCode:   { type: String, unique: true },   // e.g. "CN-0001"
  name:          { type: String, required: true },
  age:           { type: Number, default: 70 },
  childId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  careManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// ── Auto-generate patientCode before first save ───────────────────────────────
// Finds the highest existing sequential number and increments it.
patientSchema.pre('save', async function (next) {
  if (this.patientCode) return next();   // already assigned, skip

  try {
    // Get the patient with the highest code by sorting descending
    const last = await this.constructor
      .findOne({ patientCode: { $exists: true, $ne: null } })
      .sort({ patientCode: -1 })
      .select('patientCode');

    let seq = 1;
    if (last?.patientCode) {
      // patientCode format: "CN-XXXX"
      const num = parseInt(last.patientCode.replace('CN-', ''), 10);
      if (!isNaN(num)) seq = num + 1;
    }

    this.patientCode = `CN-${String(seq).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Patient', patientSchema);
