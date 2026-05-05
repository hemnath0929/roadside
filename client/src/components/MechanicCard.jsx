// MechanicCard.jsx — Shows mechanic info card
import React from 'react';

const MechanicCard = ({ mechanic, onSelect }) => {
  const rating = mechanic.rating || 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div
      className="card animate-fade-up"
      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer' }}
      onClick={() => onSelect && onSelect(mechanic)}
    >
      {/* Avatar */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #ff6600, #cc5200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', fontWeight: 700, color: '#fff',
      }}>
        {(mechanic.name || 'M')[0].toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>{mechanic.name || 'Mechanic'}</p>
          <span style={{ color: '#eab308', fontSize: '0.85rem' }}>{stars}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          {mechanic.specialization || 'General Mechanic'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{
            fontSize: '0.8rem', color: 'var(--accent)',
            background: 'rgba(255,102,0,0.12)',
            padding: '0.2rem 0.6rem', borderRadius: '999px'
          }}>
            📍 {mechanic.distance ? `${mechanic.distance.toFixed(1)} km` : '< 2 km'}
          </span>
          <span style={{
            fontSize: '0.8rem', color: 'var(--green)',
            background: 'rgba(34,197,94,0.12)',
            padding: '0.2rem 0.6rem', borderRadius: '999px'
          }}>
            ✅ {mechanic.completedJobs || 0} jobs
          </span>
        </div>
      </div>
    </div>
  );
};

export default MechanicCard;
