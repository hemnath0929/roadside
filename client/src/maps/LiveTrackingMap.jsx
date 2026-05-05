// LiveTrackingMap.jsx — Dual-marker map: user (blue) + mechanic (red, live update)
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;border:3px solid #fff;box-shadow:0 0 16px rgba(59,130,246,0.7)">👤</div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
});

const mechanicIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#ff6600,#cc5200);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;border:3px solid #fff;box-shadow:0 0 16px rgba(255,102,0,0.7)">🔧</div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
});

const LiveTrackingMap = ({ userLocation, mechanicLocation, height = 450 }) => {
  const mapRef      = useRef(null);
  const mapObj      = useRef(null);
  const userMark    = useRef(null);
  const mechMark    = useRef(null);
  const routeLine   = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!userLocation?.lat || mapObj.current) return;

    mapObj.current = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapObj.current);

    // User marker
    userMark.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapObj.current)
      .bindPopup('📍 Your Location');

    return () => {
      mapObj.current?.remove();
      mapObj.current = null;
    };
  }, [userLocation?.lat, userLocation?.lng]);

  // Live update mechanic marker
  useEffect(() => {
    if (!mapObj.current || !mechanicLocation?.lat) return;

    const latLng = L.latLng(mechanicLocation.lat, mechanicLocation.lng);

    if (!mechMark.current) {
      // First placement
      mechMark.current = L.marker(latLng, { icon: mechanicIcon })
        .addTo(mapObj.current)
        .bindPopup('🔧 Mechanic is on the way!');
    } else {
      // Smooth update
      mechMark.current.setLatLng(latLng);
    }

    // Draw straight-line route (Google Directions API fallback)
    if (userLocation?.lat) {
      const userLatLng = L.latLng(userLocation.lat, userLocation.lng);
      if (routeLine.current) routeLine.current.setLatLngs([userLatLng, latLng]);
      else {
        routeLine.current = L.polyline([userLatLng, latLng], {
          color: '#ff6600', weight: 3, dashArray: '8,6', opacity: 0.7,
        }).addTo(mapObj.current);
      }
    }

    // Fit bounds to show both markers
    if (userLocation?.lat) {
      mapObj.current.fitBounds(
        L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [mechanicLocation.lat, mechanicLocation.lng],
        ]),
        { padding: [60, 60] }
      );
    }
  }, [mechanicLocation?.lat, mechanicLocation?.lng]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height, width: '100%' }} />
    </div>
  );
};

export default LiveTrackingMap;
