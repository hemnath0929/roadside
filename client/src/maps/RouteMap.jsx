// RouteMap.jsx — Shows a route between two points (straight line fallback)
// If VITE_GOOGLE_MAPS_API_KEY is set, it can be extended to use Directions API
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RouteMap = ({ origin, destination, height = 350 }) => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  useEffect(() => {
    if (!origin?.lat || !destination?.lat || mapObj.current) return;

    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;

    mapObj.current = L.map(mapRef.current, { center: [midLat, midLng], zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapObj.current);

    // Origin marker (user)
    L.circleMarker([origin.lat, origin.lng], {
      radius: 10, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9,
    }).addTo(mapObj.current).bindPopup('📍 Pickup Location');

    // Destination marker (mechanic)
    L.circleMarker([destination.lat, destination.lng], {
      radius: 10, color: '#ff6600', fillColor: '#ff6600', fillOpacity: 0.9,
    }).addTo(mapObj.current).bindPopup('🔧 Mechanic Location');

    // Straight-line route
    // NOTE: Replace with Google Directions API polyline if VITE_GOOGLE_MAPS_API_KEY is set
    L.polyline(
      [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      { color: '#ff6600', weight: 4, dashArray: '10,8', opacity: 0.8 }
    ).addTo(mapObj.current);

    mapObj.current.fitBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ], { padding: [40, 40] });

    return () => {
      mapObj.current?.remove();
      mapObj.current = null;
    };
  }, [origin?.lat, destination?.lat]);

  if (!origin?.lat || !destination?.lat) {
    return (
      <div style={{
        height, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: '0.9rem',
      }}>
        📍 Waiting for location data...
      </div>
    );
  }

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height, width: '100%' }} />
    </div>
  );
};

export default RouteMap;
