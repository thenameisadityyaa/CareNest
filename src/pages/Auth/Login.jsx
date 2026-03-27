import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message || 'Login failed');
      setLoading(false);
    }
    // Navigate is handled completely by App.jsx conditional rendering to avoid blank screen bugs
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F0F5', fontFamily: 'Lato, sans-serif' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
        <Heart size={32} color="#14BEF0" className="mr-2" />
        <span style={{ fontSize: '30px', fontWeight: 900, color: '#28328C', letterSpacing: '-0.5px' }}>care<span style={{ color: '#14BEF0' }}>nest</span></span>
      </div>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(40,50,140,0.08)', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#28328C', marginBottom: '8px' }}>Login</h2>
        <p style={{ fontSize: '14px', color: '#787887', marginBottom: '24px' }}>Access your elder health monitoring dashboard</p>

        {error && <div style={{ padding: '12px', background: '#FFF5F5', borderLeft: '4px solid #E53E3E', color: '#C53030', fontSize: '13px', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#14BEF0', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-cyan" style={{ padding: '14px', marginTop: '8px', fontSize: '15px' }}>
            {loading ? 'Logging in...' : 'Login securely'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#787887' }}>
          Don't have an account? <Link to="/register" style={{ color: '#14BEF0', fontWeight: 700, textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
