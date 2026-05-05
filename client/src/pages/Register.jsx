// Register.jsx — Registration form for users and mechanics
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'user',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // Backend: POST /auth/register  { name, email, password, role }
      const { name, email, password, role } = form;
      const user = await register({ name, email, password, role });
      if (user.role === 'mechanic') navigate('/mechanic/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-centered" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #ff6600, #cc5200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', margin: '0 auto 1.25rem',
            boxShadow: '0 0 32px rgba(255,102,0,0.3)',
          }}>🚗</div>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Join RoadFix — free forever</p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)',
          borderRadius: 12, padding: 4, marginBottom: '1.5rem',
          border: '1px solid var(--border)',
        }}>
          {['user', 'mechanic'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              style={{
                flex: 1, padding: '0.65rem',
                borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                transition: 'all 0.2s',
                background: form.role === r
                  ? 'linear-gradient(135deg, #ff6600, #cc5200)'
                  : 'transparent',
                color: form.role === r ? '#fff' : 'var(--text-muted)',
                boxShadow: form.role === r ? '0 4px 12px rgba(255,102,0,0.3)' : 'none',
              }}
            >
              {r === 'user' ? '🚗 I need help' : '🔧 I\'m a mechanic'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" className="form-input"
                placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="form-input"
                placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? '⏳ Creating account...' : `Create ${form.role === 'mechanic' ? 'Mechanic' : 'User'} Account →`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
