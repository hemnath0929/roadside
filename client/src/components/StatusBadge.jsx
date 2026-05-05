// StatusBadge.jsx — Colored pill badge for request statuses
import React from 'react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',   icon: '⏳' },
  accepted:  { label: 'Accepted',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '✅' },
  arrived:   { label: 'Arrived',   color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  icon: '📍' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: '🎉' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '❌' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        letterSpacing: '0.03em',
      }}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
