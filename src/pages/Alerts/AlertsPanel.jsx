import React from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Clock, Bell } from 'lucide-react';

const AlertsPanel = () => {
  const { alerts } = useHealthData();

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#28328C', letterSpacing: '-0.5px' }}>Notifications & Alerts</h1>
        <p style={{ fontSize: '14px', color: '#787887', marginTop: '4px' }}>All health warnings and critical events from the monitoring system</p>
      </div>

      {/* Alert count badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Bell size={16} color="#787887" />
        <span style={{ fontSize: '13px', color: '#787887', fontWeight: 700 }}>
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''} recorded
        </span>
        {alerts.some(a => a.type === 'critical') && (
          <span style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', fontSize: '11px', fontWeight: 900, padding: '3px 9px', borderRadius: '20px', letterSpacing: '0.05em' }}>
            CRITICAL ACTIVE
          </span>
        )}
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0E0EA', borderRadius: '8px', padding: '60px 0', textAlign: 'center', boxShadow: '0 2px 10px rgba(40,50,140,0.07)' }}>
          <Bell size={30} color="#CBD5E0" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#787887' }}>No alerts yet</p>
          <p style={{ fontSize: '13px', color: '#A0AEC0', marginTop: '4px' }}>System is monitoring 24/7</p>
        </div>
      )}

      {/* Alert cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert, idx) => {
          const isCritical = alert.type === 'critical';
          const isWarning = alert.type === 'warning';
          const Icon = isCritical ? ShieldAlert : AlertTriangle;

          const colors = isCritical
            ? { bg: '#FFF5F5', border: '#FED7D7', text: '#C53030', accent: '#E53E3E', icon: '#FEB2B2' }
            : isWarning
              ? { bg: '#FFFAF0', border: '#FEEBC8', text: '#C05621', accent: '#DD6B20', icon: '#FBD38D' }
              : { bg: '#EBF8FF', border: '#BEE3F8', text: '#2A69AC', accent: '#3182CE', icon: '#90CDF4' };

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderLeft: `4px solid ${colors.accent}`,
                borderRadius: '6px',
                padding: '16px 20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s',
                cursor: 'default',
              }}
              whileHover={{ boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
            >
              {/* Icon circle */}
              <div style={{ background: colors.icon, borderRadius: '50%', padding: '10px', marginRight: '16px', flexShrink: 0 }}>
                <Icon size={18} color={colors.text} style={isCritical ? { animation: 'pulse 1.2s infinite' } : {}} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: colors.text }}>
                    {isCritical ? 'Critical Medical Alert' : isWarning ? 'Health Warning' : 'System Notification'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                    <Clock size={12} color={colors.text} style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: colors.text, opacity: 0.7 }}>{alert.time}</span>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: colors.text, opacity: 0.85, lineHeight: 1.5 }}>{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPanel;
