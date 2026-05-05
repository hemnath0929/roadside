// routes.jsx — Centralized route definitions with ProtectedRoute
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import UserDashboard   from './pages/UserDashboard';
import CreateRequest   from './pages/CreateRequest';
import NearbyMechanics from './pages/NearbyMechanics';
import LiveTracking    from './pages/LiveTracking';
import MechanicDashboard from './pages/MechanicDashboard';
import AcceptedRequest from './pages/AcceptedRequest';
import Review          from './pages/Review';
import Loader          from './components/Loader';

// Generic protected route: requires auth token
export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'mechanic' ? '/mechanic/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },

  // User routes
  {
    path: '/dashboard',
    element: <ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>,
  },
  {
    path: '/request/create',
    element: <ProtectedRoute allowedRole="user"><CreateRequest /></ProtectedRoute>,
  },
  {
    path: '/mechanics/nearby',
    element: <ProtectedRoute allowedRole="user"><NearbyMechanics /></ProtectedRoute>,
  },
  {
    path: '/tracking/:id',
    element: <ProtectedRoute allowedRole="user"><LiveTracking /></ProtectedRoute>,
  },
  {
    path: '/review/:id',
    element: <ProtectedRoute allowedRole="user"><Review /></ProtectedRoute>,
  },

  // Mechanic routes
  {
    path: '/mechanic/dashboard',
    element: <ProtectedRoute allowedRole="mechanic"><MechanicDashboard /></ProtectedRoute>,
  },
  {
    path: '/mechanic/accepted',
    element: <ProtectedRoute allowedRole="mechanic"><AcceptedRequest /></ProtectedRoute>,
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
];
