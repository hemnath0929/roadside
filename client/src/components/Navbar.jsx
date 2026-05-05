// Navbar.jsx — Responsive top navigation bar
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/request/create', label: '🆘 New Request' },
    { to: '/mechanics/nearby', label: '🔧 Find Mechanics' },
  ];

  const mechanicLinks = [
    { to: '/mechanic/dashboard', label: '🏠 Dashboard' },
    { to: '/mechanic/accepted', label: '📋 Active Job' },
  ];

  const links = user?.role === 'mechanic' ? mechanicLinks : user ? userLinks : [];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 70,
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, margin: '0 auto' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #ff6600, #cc5200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 0 16px rgba(255,102,0,0.4)',
            }}>🚗</div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              Road<span style={{ color: '#ff6600' }}>Fix</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: isActive(link.to) ? '#ff6600' : '#94a3b8',
                  background: isActive(link.to) ? 'rgba(255,102,0,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6600, #cc5200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f1f5f9', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  {user.role === 'mechanic' && (
                    <span style={{
                      fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 4,
                      background: 'rgba(168,85,247,0.2)', color: '#c084fc', fontWeight: 600,
                    }}>PRO</span>
                  )}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none', // shown via media-query below
                background: 'none', border: 'none', color: '#f1f5f9',
                fontSize: '1.4rem', cursor: 'pointer', padding: '0.25rem',
              }}
              className="hamburger-btn"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 70, left: 0, right: 0, zIndex: 999,
          background: 'rgba(18,18,26,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              style={{ padding: '0.75rem', borderRadius: 8, color: '#f1f5f9', fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 70 }} />

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
