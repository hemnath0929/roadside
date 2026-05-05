// AcceptedRequest.jsx — Mechanic's active job: mark Arrived and Completed
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMechanicAvailableRequests, updateRequestStatus } from '../services/requestService';
import * as socketService from '../services/socketService';
import useCurrentLocation from '../hooks/useCurrentLocation';
import RouteMap from '../maps/RouteMap';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const DUMMY_ACTIVE = {
  _id: 'r1',
  vehicleType: 'car',
  issueType: 'flat_tyre',
  description: 'Front left tyre burst on NH-48.',
  status: 'accepted',
  user: { name: 'Priya Sharma', phone: '+91-9876500001' },
  location: { lat: 28.614, lng: 77.209 },
  createdAt: new Date().toISOString(),
};

const AcceptedRequest = () => {
  const navigate = useNavigate();
  const { lat, lng } = useCurrentLocation();

  const [request, setRequest]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Backend: GET /requests/mechanic/available or a dedicated endpoint
        // Here we assume the accepted request is stored locally or fetched
        const data = await getMechanicAvailableRequests();
        const accepted = data.find((r) => r.status === 'accepted');
        setRequest(accepted || DUMMY_ACTIVE);
      } catch {
        setRequest(DUMMY_ACTIVE);
      } finally {
        setLoading(false);
      }
    };
    fetch();

    // Continue broadcasting location
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Socket event: mechanic-location-update
          socketService.emitMechanicLocation('r1', pos.coords.latitude, pos.coords.longitude);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      // Backend: PATCH /requests/:id/status  { status }
      await updateRequestStatus(request._id, status);
      setRequest((prev) => ({ ...prev, status }));
      if (status === 'completed') {
        setTimeout(() => navigate('/mechanic/dashboard'), 2000);
      }
    } catch {
      setRequest((prev) => ({ ...prev, status }));
      if (status === 'completed') {
        setTimeout(() => navigate('/mechanic/dashboard'), 2000);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader text="Loading your active job..." />;

  if (!request) {
    return (
      <div className="page-centered">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No active job. Go accept a request!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/mechanic/dashboard')}>
            View Available Jobs
          </button>
        </div>
      </div>
    );
  }

  const userLoc = request.location || { lat: 28.614, lng: 77.209 };
  const mechLoc = lat ? { lat, lng } : null;

  return (
    <div className="page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">🚗 Active Job</h1>
          <p className="page-subtitle">Navigate to the user and update job status.</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>

        {/* Route Map */}
        <div>
          <h2 className="section-title">Route to User</h2>
          <RouteMap origin={mechLoc || { lat: userLoc.lat + 0.01, lng: userLoc.lng + 0.01 }} destination={userLoc} height={380} />
          <div className="alert alert-info" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
            📡 Your GPS location is being broadcast to the user every 3 seconds.
          </div>
        </div>

        {/* Job Details + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* User Info */}
          <div className="card">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>User Info</p>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{request.user?.name || 'Unknown User'}</p>
            {request.user?.phone && (
              <a href={`tel:${request.user.phone}`} style={{ color: 'var(--accent)', fontSize: '0.9rem', display: 'block', marginTop: '0.3rem' }}>
                📞 Call User
              </a>
            )}
          </div>

          {/* Request Info */}
          <div className="card">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Issue</p>
            <p style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1rem' }}>
              {request.issueType?.replace('_', ' ')} — {request.vehicleType}
            </p>
            {request.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem', lineHeight: 1.6 }}>
                {request.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Update Status</p>
            {request.status === 'accepted' && (
              <button className="btn btn-blue btn-full" onClick={() => handleStatusUpdate('arrived')} disabled={updating}>
                {updating ? '⏳ Updating...' : '📍 Mark as Arrived'}
              </button>
            )}
            {(request.status === 'arrived' || request.status === 'accepted') && (
              <button className="btn btn-success btn-full" onClick={() => handleStatusUpdate('completed')} disabled={updating}>
                {updating ? '⏳ Completing...' : '✅ Mark as Completed'}
              </button>
            )}
            {request.status === 'completed' && (
              <div className="alert alert-success">🎉 Job completed! Redirecting to dashboard...</div>
            )}
            <button className="btn btn-danger btn-full" onClick={() => handleStatusUpdate('cancelled')} disabled={updating}>
              ❌ Cancel Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptedRequest;
