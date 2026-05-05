// authService.js — Backend: POST /auth/register, POST /auth/login
import api from './api';

export const registerUser = async (data) => {
  // Backend: POST /auth/register  { name, email, password, role }
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  // Backend: POST /auth/login  { email, password }
  const res = await api.post('/auth/login', data);
  return res.data;
};
