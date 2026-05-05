// NearbyMechanics.jsx — Shows nearby mechanics on map + list
import React, { useEffect, useState } from 'react';
import useCurrentLocation from '../hooks/useCurrentLocation';
import { getNearbyMechanics } from '../services/mechanicService';
import MechanicCard from '../components/MechanicCard';
import MapView from '../maps/MapView';
import Loader from '../components/Loader';

const DUMMY_MECHANICS = [
  { _id: 'm1', name: 'Rajesh Kumar', specialization: 'Tyre & Battery', rating: 4.8, distance: 1.2, completedJobs: 134, location: { coordinates: [77.215, 28.619] } },
  { _id: 'm2', name: 'Suresh Patel', specialization: 'Engine & Towing', rating: 4.5, distance: 2.4, completedJobs: 98, location: { coordinates: [77.222, 28.612] } },
  { _id: 'm3', name: 'Amit Singh',   specialization: 'General Mechanic', rating: 4.6, distance: 3.1, completedJobs: 61, location: { coordinates: [77.207, 28.625] } },
];

const NearbyMechanics = () => {
  const { lat, lng, loading: locLoading } = useCurrentLocation();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    if (locLoading) return;
    const fetch = async () => {
      try {
        // Backend: GET /mechanics/nearby?lat=xx&lng=xx
        const data = await getNearbyMechanics(lat, lng);
        setMechanics(data);
      } catch {
        setMechanics(DUMMY_MECHANICS);
        setUsingDummy(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [lat, lng, locLoading]);

  if (locLoading || loading) return <Loader text="Finding mechanics near you..." />;

  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="page-title">🔧 Mechanics Near You</h1>
      <p className="page-subtitle">Verified professionals ready to help right now.</p>

      {usingDummy && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          ⚠️ Backend offline — showing demo mechanics near New Delhi.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>

        {/* Mechanic List */}
        <div>
          <h2 className="section-title">{mechanics.length} Mechanics Available</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {mechanics.map((m) => (
              <MechanicCard key={m._id} mechanic={m} onSelect={setSelected} />
            ))}
          </div>
        </div>

        {/* Map */}
        <div>
          <h2 className="section-title">Map View</h2>
          <MapView center={{ lat, lng }} mechanics={mechanics} height={480} />
          {selected && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <p style={{ fontWeight: 700 }}>Selected: {selected.name}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selected.specialization}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                📍 {selected.distance?.toFixed(1)} km away
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyMechanics;
