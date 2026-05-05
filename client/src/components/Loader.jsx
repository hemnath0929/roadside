// Loader.jsx — Full-screen animated spinner overlay
import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1.25rem',
    }}>
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid rgba(255,102,0,0.15)',
          borderTop: '3px solid #ff6600',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(255,102,0,0.08)',
          borderBottom: '2px solid rgba(255,102,0,0.6)',
          borderRadius: '50%',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{text}</p>
    </div>
  );
};

export default Loader;
