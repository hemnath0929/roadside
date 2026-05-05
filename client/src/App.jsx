// App.jsx — Root component with Router, AuthProvider, Navbar, and routes
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { routes } from './routes';

const AppRoutes = () => useRoutes(routes);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
