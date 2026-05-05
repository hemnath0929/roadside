// requestService.js — All request-related API calls
import api from './api';

// Backend: POST /requests  { vehicleType, issueType, description, location }
export const createRequest = async (data) => {
  const res = await api.post('/requests', data);
  return res.data;
};

// Backend: GET /requests/user  → returns user's requests array
export const getUserRequests = async () => {
  const res = await api.get('/requests/user');
  return res.data;
};

// Backend: GET /requests/mechanic/available  → available requests list
export const getMechanicAvailableRequests = async () => {
  const res = await api.get('/requests/mechanic/available');
  return res.data;
};

// Backend: PATCH /requests/:id/accept
export const acceptRequest = async (id) => {
  const res = await api.patch(`/requests/${id}/accept`);
  return res.data;
};

// Backend: PATCH /requests/:id/status  { status: 'arrived'|'completed'|'cancelled' }
export const updateRequestStatus = async (id, status) => {
  const res = await api.patch(`/requests/${id}/status`, { status });
  return res.data;
};

// Backend: GET /requests/:id  → single request details
export const getRequestById = async (id) => {
  const res = await api.get(`/requests/${id}`);
  return res.data;
};
