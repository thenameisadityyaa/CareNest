import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', error: false, link: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false, link: '' });
    
    const BACKEND = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ 
          loading: false, 
          message: data.message, 
          error: false,
          link: data.devPreviewUrl || '' // Specifically for easy testing in assignments
        });
      } else {
        setStatus({ loading: false, message: data.message || 'Error requesting reset', error: true, link: '' });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Server connection error', error: true, link: '' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F0F5', fontFamily: 'Lato, sans-serif' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
        <Heart size={32} color="#14BEF0" className="mr-2" />
        <span style={{ fontSize: '30px', fontWeight: 900, color: '#28328C', letterSpacing: '-0.5px' }}>care<span style={{ color: '#14BEF0' }}>nest</span></span>
      </div>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(40,50,140,0.08)', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#28328C', marginBottom: '8px' }}>Reset Password</h2>
        <p style={{ fontSize: '14px', color: '#787887', marginBottom: '24px' }}>Enter your email address to receive a password reset link.</p>

        {status.message && (
          <div style={{ padding: '12px', background: status.error ? '#FFF5F5' : '#F0FFF4', borderLeft: `4px solid ${status.error ? '#E53E3E' : '#38A169'}`, color: status.error ? '#C53030' : '#2F855A', fontSize: '13px', marginBottom: '20px', borderRadius: '4px' }}>
            {status.message}
            {!status.error && status.link && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#28328C' }}>Assignment Dev Mode:</strong><br/>
                <a href={status.link} target="_blank" rel="noopener noreferrer" style={{ color: '#14BEF0', textDecoration: 'underline' }}>
                  Click here to view Ethereal Test Email
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#414146', textTransform: 'uppercase', marginBottom: '8px' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', border: '1.5px solid #E0E0EA', borderRadius: '4px', fontSize: '15px' }}
            />
          </div>
          <button type="submit" disabled={status.loading || status.message && !status.error} className="btn-cyan" style={{ padding: '14px', marginTop: '8px', fontSize: '15px' }}>
            {status.loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#787887' }}>
          Remember your password? <Link to="/login" style={{ color: '#14BEF0', fontWeight: 700, textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
