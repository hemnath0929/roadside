// LiveTracking.jsx — Shows live mechanic position on map via socket
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCurrentLocation from '../hooks/useCurrentLocation';
import useSocketTracking from '../hooks/useSocketTracking';
import { getRequestById } from '../services/requestService';
import LiveTrackingMap from '../maps/LiveTrackingMap';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const LiveTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lat, lng, loading: locLoading } = useCurrentLocation();
  const { mechanicLocation, statusUpdate } = useSocketTracking(id);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  // Demo mechanic position (for fallback when socket is not connected)
  const [demoMechLoc, setDemoMechLoc] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // Backend: GET /requests/:id
        const data = await getRequestById(id);
        setRequest(data);
      } catch {
        // Fallback dummy request
        setRequest({
          _id: id,
          vehicleType: 'car',
          issueType: 'flat_tyre',
          status: 'accepted',
          mechanic: { name: 'Rajesh Kumar', phone: '+91-9876543210' },
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  // Simulate moving mechanic for demo when no socket
  useEffect(() => {
    if (!lat || mechanicLocation) return;
    setDemoMechLoc({ lat: lat + 0.01, lng: lng + 0.01 });
    const interval = setInterval(() => {
      setDemoMechLoc((prev) => ({
        lat: prev.lat - 0.0005,
        lng: prev.lng - 0.0005,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [lat, lng, mechanicLocation]);

  const activeMechLoc = mechanicLocation || demoMechLoc;
  const currentStatus = statusUpdate || request?.status;

  if (loading || locLoading) return <Loader text="Loading live tracking..." />;

  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">📍 Live Tracking</h1>
          <p className="page-subtitle">Your mechanic is on the way!</p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Map */}
        <div>
          <LiveTrackingMap
            userLocation={{ lat, lng }}
            mechanicLocation={activeMechLoc}
            height={480}
          />
          {!mechanicLocation && (
            <div className="alert alert-info" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              📡 Demo mode — connect backend socket for live updates. Mechanic marker is simulated.
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mechanic Card */}
          <div className="card">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Mechanic</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6600, #cc5200)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 700, color: '#fff',
              }}>
                {request?.mechanic?.name?.[0] || 'M'}
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>{request?.mechanic?.name || 'Rajesh Kumar'}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>🔧 Certified Mechanic</p>
                {request?.mechanic?.phone && (
                  <a href={`tel:${request.mechanic.phone}`}
                    style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                    📞 {request.mechanic.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ETA Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Estimated Arrival</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)' }}>~12 min</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              ETA placeholder — integrate Google Directions API for real-time ETA
            </p>
          </div>

          {/* Request Details */}
          <div className="card">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Request Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Vehicle</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.9rem' }}>{request?.vehicleType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Issue</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.9rem' }}>{request?.issueType?.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</span>
                <StatusBadge status={currentStatus} />
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
