// useSocketTracking.js — Subscribe to mechanic's live GPS via socket
import { useState, useEffect } from 'react';
import * as socketService from '../services/socketService';

const useSocketTracking = (requestId) => {
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [statusUpdate, setStatusUpdate]         = useState(null);

  useEffect(() => {
    if (!requestId) return;

    // Join the request-specific room
    socketService.joinRequestRoom(requestId);

    // Listen for mechanic-location-live  { lat, lng }
    socketService.onMechanicLocationLive((data) => {
      setMechanicLocation({ lat: data.lat, lng: data.lng });
    });

    // Listen for request-status-update  { status }
    socketService.onRequestStatusUpdate((data) => {
      setStatusUpdate(data.status);
    });

    return () => {
      socketService.offMechanicLocationLive();
      socketService.offRequestStatusUpdate();
    };
  }, [requestId]);

  return { mechanicLocation, statusUpdate };
};

export default useSocketTracking;
