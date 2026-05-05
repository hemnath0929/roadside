// mechanicService.js — Backend: GET /mechanics/nearby
import api from './api';

// Backend: GET /mechanics/nearby?lat=xx&lng=xx
export const getNearbyMechanics = async (lat, lng) => {
  const res = await api.get('/mechanics/nearby', { params: { lat, lng } });
  return res.data;
};
