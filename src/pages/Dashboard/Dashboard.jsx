import React, { useMemo } from 'react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import {
  Heart, Wind, Activity, AlertCircle, FileText,
  User, Flame, Moon, TrendingUp, Zap, Shield,
  Calendar, Clock, CheckCircle2, ArrowUpRight,
  Droplets, Thermometer, ChevronRight
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatus = (metric, value) => {
  if (!value) return { label: 'No Data', color: '#94A3B8', bg: '#F8FAFC' };
  if (metric === 'heartRate') {
    if (value < 50 || value > 110) return { label: 'Abnormal', color: '#EF4444', bg: '#FEF2F2' };
    return { label: 'Normal', color: '#10B981', bg: '#ECFDF5' };
  }
  if (metric === 'oxygen') {
    if (value < 92) return { label: 'Critical', color: '#EF4444', bg: '#FEF2F2' };
    return { label: 'Normal', color: '#10B981', bg: '#ECFDF5' };
  }
  if (metric === 'bpSystolic') {
    if (value > 140) return { label: 'High', color: '#F59E0B', bg: '#FFFBEB' };
    return { label: 'Normal', color: '#10B981', bg: '#ECFDF5' };
  }
  return { label: 'Normal', color: '#10B981', bg: '#ECFDF5' };
};

const now = new Date();
const month = now.toLocaleString('default', { month: 'long' });
const year = now.getFullYear();

const getDaysInMonth = () => {
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Array.from({ length: d }, (_, i) => i + 1);
};

// ─── Tiny sparkline ───────────────────────────────────────────────────────────
const Spark = ({ data, dataKey, color }) => (
  <ResponsiveContainer width="100%" height={56}>
    <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`gs_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
        fill={`url(#gs_${dataKey})`} dot={false} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Vital card ───────────────────────────────────────────────────────────────
const VCard = ({ icon: Icon, title, value, unit, dataKey, color, bg, history }) => {
  const st = getStatus(dataKey, value);
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: '18px 18px 10px', border: '1px solid #F0F4FF',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)', flex: 1, minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{
          background: bg, borderRadius: '10px', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={17} color={color} />
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: st.color, background: st.bg,
          borderRadius: '20px', padding: '3px 9px', border: `1px solid ${st.color}22`
        }}>
          {st.label}
        </span>
      </div>
      <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, margin: '0 0 2px' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: '30px', fontWeight: 700, color: '#1E293B', lineHeight: 1 }}>{value ?? '--'}</span>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{unit}</span>
      </div>
      <Spark data={history} dataKey={dataKey} color={color} />
    </div>
  );
};

// ─── Category card ────────────────────────────────────────────────────────────
const CatCard = ({ icon: Icon, title, sub, value, color, bg, trend }) => (
  <div style={{
    background: bg, borderRadius: '16px', padding: '20px',
    border: '1px solid #F0F4FF', flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden'
  }}>
    <ArrowUpRight size={14} color={color} style={{ position: 'absolute', top: 16, right: 16, opacity: 0.6 }} />
    <div style={{
      background: 'white', borderRadius: '10px', width: 36, height: 36,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
    }}>
      <Icon size={17} color={color} />
    </div>
    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 2px' }}>{title}</p>
    <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 10px' }}>{sub}</p>
    <p style={{ fontSize: '22px', fontWeight: 700, color: color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>{trend}</p>
  </div>
);

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '12px'
    }}>
      <p style={{ color: '#64748B', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map(e => (
        <p key={e.dataKey} style={{ color: e.stroke || e.fill, fontWeight: 700, margin: '2px 0' }}>
          {e.name}: {e.value}
        </p>
      ))}
    </div>
  );
};

// ─── Weekly bar data ──────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { latestMetrics, metricsHistory, alerts, patientInfo } = useHealthData();
  const { user } = useAuth();

  const hasCritical = alerts.some(a => a.type === 'critical');
  const hasWarning = alerts.some(a => a.type === 'warning');

  // Build weekly bar data from history (last 7 entries bucketed by day)
  const weeklyBars = useMemo(() => {
    return DAYS.map((day, i) => {
      const entry = metricsHistory[metricsHistory.length - 7 + i];
      return { day, heartRate: entry?.heartRate ?? 0, oxygen: entry?.oxygen ?? 0 };
    });
  }, [metricsHistory]);

  const recentLog = useMemo(() => [...metricsHistory].reverse().slice(0, 5), [metricsHistory]);
  const today = now.getDate();
  const calDays = getDaysInMonth();

  if (!user) return null;

  return (
    <div style={{
      padding: '20px 24px', fontFamily: 'Inter, system-ui, sans-serif',
      background: '#F0F4FF', minHeight: '100%', overflowX: 'hidden'
    }}>

      {/* ── Super Admin Banner ──────────────────────────────────────────────── */}
      {user.role === 'admin' && (
        <div style={{
          background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '16px',
          padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 2px 8px rgba(251,146,60,0.1)'
        }}>
          <Shield size={20} color="#F97316" />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>Super Admin Global Access</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#C2410C' }}>You have unrestricted access to all patient data, system logs, and administrative controls.</p>
          </div>
        </div>
      )}

      {/* ── Quick Tip Banner ───────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        borderRadius: '20px', padding: '20px 28px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(37,99,235,0.3)', overflow: 'hidden', position: 'relative'
      }}>
        {/* decorative blob */}
        <div style={{
          position: 'absolute', right: 180, top: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
        }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Zap size={16} color="#FCD34D" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FCD34D' }}>Quick Tip</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Track your health goals daily
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Consistency is the foundation of long-term wellness
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: '14px',
          padding: '10px 18px', backdropFilter: 'blur(8px)', textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '0 0 4px' }}>Status</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
            {hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Good'}
          </p>
        </div>
      </div>

      {/* ── Row 1: Patient profile  +  Vital cards ─────────────────────────── */}
      <div className="dash-grid-cm" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Profile card */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '22px 18px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px', boxShadow: '0 6px 20px rgba(37,99,235,0.4)'
          }}>
            <User size={30} color="#fff" />
          </div>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B', margin: 0 }}>{user.name}</p>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: '3px 0 8px', textTransform: 'capitalize' }}>
            {user.role === 'admin' ? 'Super Administrator' : user.role === 'caremanager' ? 'Care Manager' : user.role}
          </p>

          {/* Patient Code badge */}
          {patientInfo?.patientCode && (
            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: '8px', padding: '5px 14px', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                {patientInfo.patientCode}
              </span>
            </div>
          )}

          {[
            { label: 'Heart Rate', val: latestMetrics?.heartRate ? `${latestMetrics.heartRate} bpm` : '--', icon: Heart, color: '#EF4444' },
            { label: 'Blood Pressure', val: latestMetrics?.bpSystolic ? `${latestMetrics.bpSystolic}/${latestMetrics.bpDiastolic}` : '--', icon: Activity, color: '#8B5CF6' },
            { label: 'SpO₂', val: latestMetrics?.oxygen ? `${latestMetrics.oxygen}%` : '--', icon: Wind, color: '#3B82F6' },
          ].map(r => (
            <div key={r.label} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <r.icon size={13} color={r.color} />
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{r.label}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>{r.val}</span>
            </div>
          ))}

          {(hasCritical || hasWarning) && (
            <div style={{
              marginTop: 14, width: '100%', borderRadius: '10px', padding: '10px 12px',
              background: hasCritical ? '#FEF2F2' : '#FFFBEB',
              border: `1px solid ${hasCritical ? '#FCA5A5' : '#FCD34D'}`,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <AlertCircle size={14} color={hasCritical ? '#EF4444' : '#F59E0B'} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: hasCritical ? '#DC2626' : '#D97706' }}>
                {hasCritical ? 'CRITICAL alert active!' : 'Health warning detected'}
              </span>
            </div>
          )}
        </div>

        {/* Vital sign cards */}
        <div className="dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <VCard icon={Heart} title="Heart Rate" value={latestMetrics?.heartRate} unit="bpm" dataKey="heartRate" color="#EF4444" bg="#FEF2F2" history={metricsHistory} />
          <VCard icon={Wind} title="Blood Oxygen" value={latestMetrics?.oxygen} unit="%" dataKey="oxygen" color="#3B82F6" bg="#EFF6FF" history={metricsHistory} />
          <VCard icon={Activity} title="Systolic BP" value={latestMetrics?.bpSystolic} unit="mmHg" dataKey="bpSystolic" color="#8B5CF6" bg="#F5F3FF" history={metricsHistory} />
          <VCard icon={Droplets} title="Diastolic BP" value={latestMetrics?.bpDiastolic} unit="mmHg" dataKey="bpDiastolic" color="#06B6D4" bg="#ECFEFF" history={metricsHistory} />
        </div>
      </div>

      {/* ── Row 2: Category cards ──────────────────────────────────────────── */}
      <div className="dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <CatCard icon={Zap} title="Activity" sub="Steps today" value="6,240" color="#2563EB" bg="#EFF6FF" trend="+12% vs yesterday" />
        <CatCard icon={Flame} title="Calories & Nutrition" sub="Burned today" value="1,850 kcal" color="#F97316" bg="#FFF7ED" trend="Daily goal: 2,000" />
        <CatCard icon={Moon} title="Sleep Quality" sub="Last night" value="7h 20m" color="#7C3AED" bg="#F5F3FF" trend="Deep Sleep: 2h" />
        <CatCard icon={TrendingUp} title="Weekly Trend" sub="Readings logged" value={`${metricsHistory.length}`} color="#10B981" bg="#ECFDF5" trend="Consistent monitoring" />
      </div>

      {/* ── Row 3: Big chart  +  Calendar  +  Log ─────────────────────────── */}
      <div className="dash-grid-3">

        {/* Weekly Health Timeline chart */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '22px 22px 14px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Weekly Health Timeline</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '3px 0 0' }}>
                {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {[
                { label: 'Heart Rate', color: '#3B82F6' },
                { label: 'Oxygen', color: '#10B981' },
                { label: 'Systolic BP', color: '#8B5CF6' },
              ].map(l => (
                <span key={l.label} style={{
                  fontSize: '11px', fontWeight: 600, color: '#64748B',
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {metricsHistory.length === 0 ? (
            <div style={{
              height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94A3B8', fontSize: '13px', flexDirection: 'column', gap: 8
            }}>
              <TrendingUp size={28} color="#CBD5E1" />
              <span>Add health data to see the weekly timeline</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={metricsHistory} margin={{ top: 5, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  {[['hr', '#3B82F6'], ['ox', '#10B981'], ['bp', '#8B5CF6']].map(([id, c]) => (
                    <linearGradient key={id} id={`g_${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }} dy={8} minTickGap={22} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="heartRate" stroke="#3B82F6" strokeWidth={2.5}
                  fill="url(#g_hr)" dot={{ r: 3, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5 }} name="Heart Rate" />
                <Area type="monotone" dataKey="oxygen" stroke="#10B981" strokeWidth={2.5}
                  fill="url(#g_ox)" dot={{ r: 3, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5 }} name="Oxygen %" />
                <Area type="monotone" dataKey="bpSystolic" stroke="#8B5CF6" strokeWidth={2.5}
                  fill="url(#g_bp)" dot={{ r: 3, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5 }} name="Systolic BP" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mini Calendar */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '20px 16px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              {month} {year}
            </h4>
            <Calendar size={14} color="#2563EB" />
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: '#94A3B8' }}>{d}</div>
            ))}
          </div>
          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {/* offset for first day of month */}
            {Array.from({ length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {calDays.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '10px', fontWeight: d === today ? 700 : 400,
                padding: '4px 0', borderRadius: '6px', cursor: 'pointer',
                background: d === today ? '#2563EB' : 'transparent',
                color: d === today ? '#fff' : d < today ? '#94A3B8' : '#334155',
              }}>{d}</div>
            ))}
          </div>

          {/* Upcoming events */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', margin: '0 0 8px' }}>TODAY'S SCHEDULE</p>
            {[
              { time: '9:00 AM', label: 'Health Check-in', color: '#3B82F6' },
              { time: '2:00 PM', label: 'Vitals Review', color: '#10B981' },
              { time: '6:00 PM', label: 'Report Update', color: '#8B5CF6' },
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                <div style={{ width: 3, height: 28, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>{ev.time}</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#334155', margin: 0 }}>{ev.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Log */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '20px 18px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>My Health Log</h4>
            <span style={{
              fontSize: '11px', fontWeight: 600, color: '#2563EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 2
            }}>
              View All <ChevronRight size={12} />
            </span>
          </div>

          {recentLog.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No health records yet.<br />Add data to start tracking.
            </div>
          ) : recentLog.map((rec, i) => {
            const ts = rec.timestamp
              ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `Entry ${i + 1}`;
            const date = rec.timestamp
              ? new Date(rec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : '';
            const hr = rec.heartRate || 0;
            const status = hr < 50 || hr > 110 ? 'warning' : 'ok';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0',
                borderBottom: i < recentLog.length - 1 ? '1px solid #F1F5F9' : 'none'
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: status === 'warning' ? '#EF4444' : '#10B981'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: 0 }}>
                      HR {rec.heartRate} · O₂ {rec.oxygen}%
                    </p>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>{ts}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0' }}>
                    BP {rec.bpSystolic}/{rec.bpDiastolic} mmHg  ·  {date}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Weekly bar mini chart */}
          {metricsHistory.length > 0 && (
            <div style={{ marginTop: 14, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', margin: '0 0 8px' }}>WEEKLY HR BARS</p>
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={weeklyBars} margin={{ top: 0, right: 0, left: -32, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <Bar dataKey="heartRate" radius={[3, 3, 0, 0]}>
                    {weeklyBars.map((entry, i) => (
                      <Cell key={i}
                        fill={i === weeklyBars.length - 1 ? '#2563EB' : '#BFDBFE'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Alert history  +  Upcoming tests  +  Stats summary ─────── */}
      <div className="dash-grid-4-row">

        {/* Alert history */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '20px 22px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Alert History</h4>
            <a href="/alerts" style={{
              fontSize: '11px', fontWeight: 600, color: '#2563EB', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 2
            }}>
              View All <ChevronRight size={12} />
            </a>
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              <CheckCircle2 size={22} color="#10B981" style={{ margin: '0 auto 8px' }} />
              No alerts triggered — all vitals are normal!
            </div>
          ) : alerts.slice(0, 3).map((a, i) => {
            const crit = a.type === 'critical';
            return (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 0',
                borderBottom: i < Math.min(alerts.length, 3) - 1 ? '1px solid #F1F5F9' : 'none'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: crit ? '#FEF2F2' : '#FFFBEB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertCircle size={14} color={crit ? '#EF4444' : '#F59E0B'} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: crit ? '#DC2626' : '#D97706', margin: 0, textTransform: 'capitalize' }}>
                    {a.type}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>
                    {a.message?.slice(0, 60)}{a.message?.length > 60 ? '…' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming tests */}
        <div style={{
          background: '#fff', borderRadius: '18px', padding: '20px 18px',
          border: '1px solid #E8EEFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: '0 0 14px' }}>Upcoming Tests</h4>
          {[
            { name: 'ECG Test', icon: Heart, color: '#EF4444', bg: '#FEF2F2', date: '20 Apr' },
            { name: 'Blood Test', icon: Droplets, color: '#F59E0B', bg: '#FFFBEB', date: '20 Apr' },
            { name: 'X-Ray Scan', icon: Thermometer, color: '#3B82F6', bg: '#EFF6FF', date: '25 Apr' },
            { name: 'Full Check-up', icon: Stethoscope, color: '#8B5CF6', bg: '#F5F3FF', date: '01 May' },
          ].map((t, i, arr) => {
            const TI = t.icon;
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    background: t.bg, borderRadius: 8, width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <TI size={13} color={t.color} />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: 0 }}>{t.name}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{t.date}</span>
              </div>
            );
          })}
        </div>

        {/* Stethoscope import placeholder and stats summary */}
        <div style={{
          background: 'linear-gradient(135deg,#1E293B,#0F172A)', borderRadius: '18px',
          padding: '22px 20px', border: '1px solid #334155', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', margin: '0 0 6px' }}>TODAY'S SUMMARY</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
              {metricsHistory.length > 0 ? `${metricsHistory.length} readings logged` : 'No data yet'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Avg Heart Rate', val: metricsHistory.length ? Math.round(metricsHistory.reduce((s, r) => s + r.heartRate, 0) / metricsHistory.length) + ' bpm' : '--', color: '#3B82F6', icon: Heart },
              { label: 'Avg Oxygen', val: metricsHistory.length ? Math.round(metricsHistory.reduce((s, r) => s + r.oxygen, 0) / metricsHistory.length) + '%' : '--', color: '#10B981', icon: Wind },
              { label: 'Last Entry', val: metricsHistory.length && metricsHistory[metricsHistory.length - 1]?.timestamp ? new Date(metricsHistory[metricsHistory.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--', color: '#8B5CF6', icon: Clock },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: 'rgba(255,255,255,0.05)',
                borderRadius: 10, padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <s.icon size={13} color={s.color} />
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{s.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// needed for 'Stethoscope' which is not imported at top in this block
function Stethoscope({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}
