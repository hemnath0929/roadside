// socketService.js — Singleton Socket.IO client
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connect = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });
  socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
  socket.on('disconnect', () => console.log('[Socket] Disconnected'));
  socket.on('connect_error', (err) => console.warn('[Socket] Error:', err.message));
  return socket;
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// User/Mechanic: join a request room to receive updates
// Socket event: join-request-room  { requestId }
export const joinRequestRoom = (requestId) => {
  if (socket) socket.emit('join-request-room', { requestId });
};

// Mechanic: emit current GPS location every 3 seconds
// Socket event: mechanic-location-update  { requestId, lat, lng }
export const emitMechanicLocation = (requestId, lat, lng) => {
  if (socket) socket.emit('mechanic-location-update', { requestId, lat, lng });
};

// User: subscribe to mechanic's live location updates
// Socket event received: mechanic-location-live  { lat, lng }
export const onMechanicLocationLive = (callback) => {
  if (socket) socket.on('mechanic-location-live', callback);
};

export const offMechanicLocationLive = () => {
  if (socket) socket.off('mechanic-location-live');
};

// Both: subscribe to request status updates
// Socket event received: request-status-update  { status }
export const onRequestStatusUpdate = (callback) => {
  if (socket) socket.on('request-status-update', callback);
};

export const offRequestStatusUpdate = () => {
  if (socket) socket.off('request-status-update');
};
