import React, { useState } from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const RedPanicButton = () => {
  const { triggerEmergency } = useHealthData();
  const [sent, setSent] = useState(false);

  const handleClick = () => {
    triggerEmergency();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        style={{
          width: '100%',
          background: sent ? '#C53030' : '#E53E3E',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 0',
          fontFamily: 'Lato, sans-serif',
          fontSize: '13px',
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background 0.2s',
          boxShadow: '0 2px 8px rgba(229,62,62,0.45)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pulse ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '6px',
            border: '2px solid #E53E3E',
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            opacity: 0.4,
          }}
        />
        <ShieldAlert size={17} />
        {sent ? 'ALERT SENT!' : 'EMERGENCY'}
      </button>

      {/* Tooltip */}
      {sent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            bottom: '56px',
            left: 0,
            right: 0,
            background: '#1A202C',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 12px',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 50,
          }}
        >
          📡 Family & Care Services Alerted
        </motion.div>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RedPanicButton;
