// MapView.jsx — Single-location Leaflet map (user location or mechanic markers)
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  html: `<div style="
    width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#2563eb);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:16px;border:3px solid #fff;
    box-shadow:0 0 12px rgba(59,130,246,0.6)">
    👤
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const mechanicIcon = L.divIcon({
  html: `<div style="
    width:32px;height:32px;background:linear-gradient(135deg,#ff6600,#cc5200);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:16px;border:3px solid #fff;
    box-shadow:0 0 12px rgba(255,102,0,0.6)">
    🔧
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapView = ({ center, mechanics = [], height = 400 }) => {
  const mapRef   = useRef(null);
  const mapObj   = useRef(null);
  const userMark = useRef(null);

  useEffect(() => {
    if (!center?.lat || mapObj.current) return;

    mapObj.current = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapObj.current);

    // User marker
    userMark.current = L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapObj.current)
      .bindPopup('📍 Your Location');

    return () => {
      mapObj.current?.remove();
      mapObj.current = null;
    };
  }, [center?.lat, center?.lng]);

  // Add mechanic markers
  useEffect(() => {
    if (!mapObj.current || !mechanics.length) return;
    mechanics.forEach((m) => {
      if (m.location?.coordinates) {
        const [lng, lat] = m.location.coordinates;
        L.marker([lat, lng], { icon: mechanicIcon })
          .addTo(mapObj.current)
          .bindPopup(`🔧 ${m.name}`);
      }
    });
  }, [mechanics]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height, width: '100%' }} />
    </div>
  );
};

export default MapView;
