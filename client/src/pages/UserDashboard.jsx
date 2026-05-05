// UserDashboard.jsx — Lists user's requests with status and actions
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRequests } from '../services/requestService';
import RequestCard from '../components/RequestCard';
import Loader from '../components/Loader';

const DUMMY_REQUESTS = [
  { _id: 'demo1', vehicleType: 'car', issueType: 'flat_tyre', description: 'Front left tyre is completely flat.', status: 'completed', createdAt: new Date().toISOString(), reviewed: false },
  { _id: 'demo2', vehicleType: 'bike', issueType: 'battery', description: "Engine won't start, battery seems dead.", status: 'accepted', createdAt: new Date().toISOString() },
  { _id: 'demo3', vehicleType: 'truck', issueType: 'fuel', description: 'Ran out of fuel on highway.', status: 'pending', createdAt: new Date().toISOString() },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Backend: GET /requests/user
        const data = await getUserRequests();
        setRequests(data);
      } catch {
        setRequests(DUMMY_REQUESTS);
        setUsingDummy(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const statusCounts = {
    pending:   requests.filter((r) => r.status === 'pending').length,
    active:    requests.filter((r) => ['accepted','arrived'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  if (loading) return <Loader text="Loading your dashboard..." />;

  return (
    <div className="page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here are all your roadside assistance requests.</p>
        </div>
        <Link to="/request/create" className="btn btn-primary">+ New Request</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending', value: statusCounts.pending, color: '#eab308', icon: '⏳' },
          { label: 'Active',  value: statusCounts.active,  color: '#3b82f6', icon: '🚗' },
          { label: 'Done',    value: statusCounts.completed, color: '#22c55e', icon: '✅' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, marginTop: '0.3rem' }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {usingDummy && (
        <div className="alert alert-warning">⚠️ Backend offline — showing demo data.</div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛣️</div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No requests yet</p>
          <p style={{ margin: '0.5rem 0 1.5rem', color: 'var(--text-muted)' }}>Got a breakdown? We are here to help.</p>
          <Link to="/request/create" className="btn btn-primary">🆘 Create First Request</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="section-title">Your Requests ({requests.length})</h2>
          {requests.map((req) => <RequestCard key={req._id} request={req} />)}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
