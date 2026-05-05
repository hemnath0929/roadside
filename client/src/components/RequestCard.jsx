// RequestCard.jsx — Shows a user request summary card
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ISSUE_ICONS = {
  flat_tyre: '🔧',
  battery:   '🔋',
  fuel:      '⛽',
  engine:    '⚙️',
  accident:  '🚨',
  towing:    '🚛',
  other:     '🛠️',
};

const RequestCard = ({ request }) => {
  const navigate = useNavigate();
  const icon = ISSUE_ICONS[request.issueType] || '🛠️';

  const handleTrack = () => {
    if (request.status === 'accepted' || request.status === 'arrived') {
      navigate(`/tracking/${request._id}`);
    }
  };

  const handleReview = () => {
    navigate(`/review/${request._id}`);
  };

  return (
    <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '1.8rem',
            width: 48, height: 48,
            background: 'rgba(255,102,0,0.12)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
              {(request.issueType || 'Unknown').replace('_', ' ')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {request.vehicleType || 'Vehicle'}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Description */}
      {request.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {request.description}
        </p>
      )}

      <hr className="divider" />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          🕐 {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Just now'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(request.status === 'accepted' || request.status === 'arrived') && (
            <button className="btn btn-blue btn-sm" onClick={handleTrack}>
              📍 Track
            </button>
          )}
          {request.status === 'completed' && !request.reviewed && (
            <button className="btn btn-primary btn-sm" onClick={handleReview}>
              ⭐ Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
