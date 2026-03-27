import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io as socketIO } from 'socket.io-client';
import { useAuth } from './AuthContext';

const HealthDataContext = createContext();
export const useHealthData = () => useContext(HealthDataContext);

const BACKEND = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const HealthDataProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [metricsHistory, setMetricsHistory] = useState([]);
  const [alerts,         setAlerts]         = useState([]);
  const [lastUpdated,    setLastUpdated]     = useState(new Date());
  const [activePatientId, setActivePatientId] = useState(null);
  const [patientInfo,     setPatientInfo]     = useState(null);  // full patient doc including patientCode
  const [connected,      setConnected]      = useState(false);

  const socketRef    = useRef(null);
  const patientIdRef = useRef(null);  // stable ref so socket handlers don't capture stale closure

  // Derived: latest reading (last entry in chronological array)
  const fallbackMetrics = { heartRate: 0, oxygen: 0, bpSystolic: 0, bpDiastolic: 0 };
  const latestMetrics   = metricsHistory.length > 0
    ? metricsHistory[metricsHistory.length - 1]
    : fallbackMetrics;

  // ── HTTP helpers ────────────────────────────────────────────────────────────
  const authHeader = () => ({ 'Authorization': `Bearer ${token}` });

  /** Resolve which Patient doc belongs to this user */
  const resolvePatientId = async () => {
    if (!token) return null;
    try {
      const res  = await fetch(`${BACKEND}/api/patients/me`, { headers: authHeader() });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.length > 0) {
        const patient = data[0];
        const pid = patient._id;
        setActivePatientId(pid);
        setPatientInfo(patient);          // store full doc so patientCode is available
        patientIdRef.current = pid;
        return pid;
      }
      return null;
    } catch (e) {
      console.error('[HealthDataContext] resolvePatientId:', e);
      return null;
    }
  };

  /** Fetch full history for a patient, oldest → newest (for chart order) */
  const fetchHealthData = async (pid) => {
    if (!pid || !token) return;
    try {
      const res  = await fetch(`${BACKEND}/api/patient/${pid}`, { headers: authHeader() });
      if (!res.ok) return;
      const data = await res.json();
      setMetricsHistory(data.reverse());   // API returns newest-first; chart needs oldest-first
      setLastUpdated(new Date());
    } catch (e) {
      console.error('[HealthDataContext] fetchHealthData:', e);
    }
  };

  /** Fetch all alerts for a patient */
  const fetchAlerts = async (pid) => {
    if (!pid || !token) return;
    try {
      const res  = await fetch(`${BACKEND}/api/alerts/${pid}`, { headers: authHeader() });
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(data);
    } catch (e) {
      console.error('[HealthDataContext] fetchAlerts:', e);
    }
  };

  // ── Socket.io real-time setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    // Create the socket connection once
    const socket = socketIO(BACKEND, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] connected:', socket.id);
      setConnected(true);

      // Join the patient room as soon as we connect (or after resolve)
      if (patientIdRef.current) {
        socket.emit('join_patient_room', patientIdRef.current);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] disconnected');
      setConnected(false);
    });

    // Real-time event: server emits this after every DB write
    socket.on('health_update', ({ record, alert: newAlert }) => {
      console.log('[Socket.io] health_update received for patient', patientIdRef.current);

      // Append new record to the END of the array (chart expects oldest → newest)
      setMetricsHistory(prev => {
        const updated = [...prev, record];
        // Keep only the last 50 readings to avoid unbounded memory growth
        return updated.slice(-50);
      });

      if (newAlert) {
        setAlerts(prev => [newAlert, ...prev]);
      }

      setLastUpdated(new Date());
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ── Initial data load + join room after patient ID resolves ─────────────────
  // Care Managers skip auto-resolve — they must use the PatientLookup gate first.
  // Parents and Children auto-resolve their own linked patient on login.
  useEffect(() => {
    if (!token) return;
    if (user?.role === 'caremanager') return;   // gate enforces lookup for this role

    const init = async () => {
      const pid = await resolvePatientId();
      if (!pid) return;

      await Promise.all([fetchHealthData(pid), fetchAlerts(pid)]);

      if (socketRef.current?.connected) {
        socketRef.current.emit('join_patient_room', pid);
      }
    };

    init();
  }, [token, user?.id]);

  // ── Add health data (POST) ──────────────────────────────────────────────────
  // The backend will emit health_update via socket, so we don't need to re-fetch here.
  const addHealthData = async (newData) => {
    const pid = activePatientId;
    if (!pid) {
      console.warn('[HealthDataContext] addHealthData called with no activePatientId');
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/api/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ patientId: pid, ...newData }),
      });
      // Socket.io broadcast handles the state update — no need to manually re-fetch
      if (!res.ok) {
        console.error('[HealthDataContext] addHealthData failed:', await res.text());
      }
    } catch (e) {
      console.error('[HealthDataContext] addHealthData:', e);
    }
  };

  // ── Emergency panic (local state, would ideally hit a backend endpoint) ──────
  const triggerEmergency = () => {
    const newAlert = {
      _id:       Date.now().toString(),
      type:      'critical',
      message:   'EMERGENCY: Panic button triggered by patient.',
      timestamp: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    setLastUpdated(new Date());
  };

  // ── Switch to a different patient (Care Manager lookup) ─────────────────────
  // Pass a full patient object to switch — or null to clear and re-show the gate.
  const switchPatient = (patient) => {
    // Leave current socket room
    if (socketRef.current?.connected && patientIdRef.current) {
      socketRef.current.emit('leave_patient_room', patientIdRef.current);
    }

    // null → clear state, CareManagerGate re-renders PatientLookup
    if (!patient) {
      setMetricsHistory([]);
      setAlerts([]);
      setActivePatientId(null);
      setPatientInfo(null);
      patientIdRef.current = null;
      return;
    }

    const newPid = patient._id;
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_patient_room', newPid);
    }

    setMetricsHistory([]);
    setAlerts([]);
    setActivePatientId(newPid);
    setPatientInfo(patient);
    patientIdRef.current = newPid;

    fetchHealthData(newPid);
    fetchAlerts(newPid);
  };

  return (
    <HealthDataContext.Provider value={{
      metricsHistory,
      latestMetrics,
      alerts,
      lastUpdated,
      connected,
      activePatientId,
      patientInfo,        // full patient doc — includes patientCode (e.g. "CN-0001")
      addHealthData,
      triggerEmergency,
      switchPatient,
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};
