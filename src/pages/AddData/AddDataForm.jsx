import React, { useState } from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Lock, Stethoscope } from 'lucide-react';

const InputField = ({ label, name, value, onChange, placeholder, hint }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
      {label}
    </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      style={{
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid #E0E0EA',
        borderRadius: '5px',
        fontSize: '15px',
        fontWeight: 400,
        color: '#414146',
        background: '#fff',
        outline: 'none',
        transition: 'border-color 0.15s',
        fontFamily: 'Lato, sans-serif',
      }}
      onFocus={e => (e.target.style.borderColor = '#14BEF0')}
      onBlur={e => (e.target.style.borderColor = '#E0E0EA')}
    />
    {hint && <p style={{ fontSize: '11px', color: '#787887', marginTop: '5px' }}>{hint}</p>}
  </div>
);

const AddDataForm = () => {
  const { addHealthData } = useHealthData();
  const { userRole } = useAuth();
  const [form, setForm] = useState({ heartRate: '', oxygen: '', bpSystolic: '', bpDiastolic: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    addHealthData({
      heartRate: Number(form.heartRate),
      oxygen: Number(form.oxygen),
      bpSystolic: Number(form.bpSystolic),
      bpDiastolic: Number(form.bpDiastolic),
    });
    setForm({ heartRate: '', oxygen: '', bpSystolic: '', bpDiastolic: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#28328C', letterSpacing: '-0.5px' }}>Log Health Data</h1>
        <p style={{ fontSize: '14px', color: '#787887', marginTop: '4px' }}>Manual medical entry — Care Manager / Parent access only</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #E0E0EA',
            boxShadow: '0 2px 10px rgba(40,50,140,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Banner */}
          <div style={{ position: 'relative', height: '140px', background: '#28328C', overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80&auto=format&fit=crop"
              alt="Medical"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
            />
            <div style={{ position: 'relative', zIndex: 1, padding: '28px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Stethoscope size={22} color="#14BEF0" />
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Daily Health Entry</p>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Record today's vitals for elder monitoring
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '22px' }}>
              <InputField label="Heart Rate (bpm)" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="e.g. 72" hint="Normal: 60–100 bpm" />
              <InputField label="Blood Oxygen (%)" name="oxygen" value={form.oxygen} onChange={handleChange} placeholder="e.g. 98" hint="Normal: 95–100%" />
              <InputField label="Systolic BP (mmHg)" name="bpSystolic" value={form.bpSystolic} onChange={handleChange} placeholder="e.g. 120" hint="Normal: < 120 mmHg" />
              <InputField label="Diastolic BP (mmHg)" name="bpDiastolic" value={form.bpDiastolic} onChange={handleChange} placeholder="e.g. 80" hint="Normal: < 80 mmHg" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #F0F0F5' }}>
              {success ? (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#276749', fontWeight: 700, fontSize: '14px' }}>
                  <CheckCircle2 size={18} />
                  Data saved successfully!
                </motion.div>
              ) : <div />}
              <button type="submit" className="btn-cyan" style={{ fontFamily: 'Lato, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Save size={15} />
                Save Record
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info side panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #E0E0EA', boxShadow: '0 2px 10px rgba(40,50,140,0.07)', overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80&auto=format&fit=crop"
              alt="Elder care"
              style={{ width: '100%', height: '170px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 900, color: '#28328C', marginBottom: '10px' }}>Why log daily vitals?</p>
              {[
                'Detect health changes early',
                'Automatically trigger alerts',
                'Allow doctors to review trends',
              ].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#14BEF0', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: '#787887' }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddDataForm;
