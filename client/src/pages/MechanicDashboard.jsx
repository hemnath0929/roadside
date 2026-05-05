// MechanicDashboard.jsx — Shows available requests; mechanic accepts & broadcasts GPS
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMechanicAvailableRequests, acceptRequest } from '../services/requestService';
import * as socketService from '../services/socketService';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const DUMMY_REQUESTS = [
  { _id: 'r1', vehicleType: 'car', issueType: 'flat_tyre', description: 'Front left tyre burst on NH-48.', status: 'pending', user: { name: 'Priya Sharma' }, location: { lat: 28.614, lng: 77.209 }, createdAt: new Date().toISOString() },
  { _id: 'r2', vehicleType: 'bike', issueType: 'battery', description: 'Bike not starting.', status: 'pending', user: { name: 'Arjun Mehta' }, location: { lat: 28.620, lng: 77.215 }, createdAt: new Date().toISOString() },
  { _id: 'r3', vehicleType: 'truck', issueType: 'engine', description: 'Overheating and smoke from engine.', status: 'pending', user: { name: 'Vikram Das' }, location: { lat: 28.608, lng: 77.218 }, createdAt: new Date().toISOString() },
];

const ISSUE_ICONS = { flat_tyre: '🔧', battery: '🔋', fuel: '⛽', engine: '⚙️', accident: '🚨', towing: '🚛', other: '🛠️' };

const MechanicDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [accepting, setAccepting]   = useState(null);
  const [usingDummy, setUsingDummy] = useState(false);
  const [tracking, setTracking]     = useState(false);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Backend: GET /requests/mechanic/available
        const data = await getMechanicAvailableRequests();
        setRequests(data);
      } catch {
        setRequests(DUMMY_REQUESTS);
        setUsingDummy(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => stopTracking();
  }, []);

  const startGPSBroadcast = (requestId) => {
    if (!navigator.geolocation) return;
    setTracking(true);
    // Emit location every 3 seconds via socket
    // Socket event: mechanic-location-update  { requestId, lat, lng }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socketService.emitMechanicLocation(requestId, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.warn('[GPS]', err.message),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setTracking(false);
    }
  };

  const handleAccept = async (req) => {
    setAccepting(req._id);
    try {
      // Backend: PATCH /requests/:id/accept
      await acceptRequest(req._id);
      startGPSBroadcast(req._id);
      navigate('/mechanic/accepted');
    } catch {
      // Demo fallback
      startGPSBroadcast(req._id);
      navigate('/mechanic/accepted');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return <Loader text="Loading available requests..." />;

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">🔧 Mechanic Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Pick up a job.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tracking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 999 }}>
              <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>GPS Broadcasting</span>
            </div>
          )}
        </div>
      </div>

      {usingDummy && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          ⚠️ Backend offline — showing demo requests.
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No available requests right now</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Check back shortly — new requests appear in real time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="section-title">Available Requests ({requests.length})</h2>
          {requests.map((req) => (
            <div key={req._id} className="card animate-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(255,102,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  }}>
                    {ISSUE_ICONS[req.issueType] || '🛠️'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{req.issueType?.replace('_', ' ')}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textTransform: 'capitalize' }}>
                      {req.vehicleType} — {req.user?.name || 'User'}
                    </p>
                    {req.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', lineHeight: 1.5 }}>
                        {req.description}
                      </p>
                    )}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      🕐 {req.createdAt ? new Date(req.createdAt).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAccept(req)}
                  disabled={accepting === req._id}
                  style={{ flexShrink: 0 }}
                >
                  {accepting === req._id ? '⏳ Accepting...' : '✅ Accept Job'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;
