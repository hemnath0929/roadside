// Home.jsx — Landing page with hero section and feature highlights
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🚨', title: 'Emergency SOS', desc: 'One tap to call for help when you need it most.' },
  { icon: '📍', title: 'Live Tracking', desc: 'Watch your mechanic arrive in real time on the map.' },
  { icon: '🔧', title: 'Verified Mechanics', desc: 'Trained & background-checked professionals only.' },
  { icon: '⚡', title: 'Fast Response', desc: 'Average arrival time under 20 minutes.' },
  { icon: '⭐', title: 'Rated Service', desc: 'Read reviews and rate your experience after each job.' },
  { icon: '🛡️', title: 'Safe & Secure', desc: 'Your data is encrypted and your ride is insured.' },
];

const steps = [
  { num: '01', title: 'Create a Request', desc: 'Describe your breakdown and share your GPS location.' },
  { num: '02', title: 'Mechanic Accepts', desc: 'A nearby certified mechanic picks up your request.' },
  { num: '03', title: 'Track Live', desc: 'Watch the mechanic travel to you on the live map.' },
  { num: '04', title: 'Job Done!', desc: 'Rate your experience and get back on the road.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── Hero Section ── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 1.5rem',
        position: 'relative',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,102,0,0.18) 0%, transparent 70%)',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: 999,
            background: 'rgba(255,102,0,0.12)',
            border: '1px solid rgba(255,102,0,0.3)',
            color: '#ff8533', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '1.75rem',
          }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Live — Help is available 24/7
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #f1f5f9 30%, #ff6600)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Roadside Help,<br />Instantly
          </h1>

          <p style={{
            fontSize: '1.2rem', color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Stuck on the road? Connect with verified mechanics near you and track them live — like Swiggy, but for car emergencies.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              user.role === 'mechanic' ? (
                <Link to="/mechanic/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
              ) : (
                <Link to="/request/create" className="btn btn-primary btn-lg">🆘 Request Help Now</Link>
              )
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '3rem',
            marginTop: '3.5rem', flexWrap: 'wrap',
          }}>
            {[['10K+', 'Happy Users'], ['500+', 'Mechanics'], ['< 20min', 'Avg Response'], ['4.8 ⭐', 'Rating']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff6600' }}>{val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="page-title" style={{ fontSize: '2.2rem' }}>Everything you need</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Built for drivers who refuse to wait on the side of the road.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                background: 'rgba(255,102,0,0.1)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
              }}>{f.icon}</div>
              <div>
                <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{f.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="page-title" style={{ fontSize: '2.2rem' }}>How it works</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Four simple steps to get back on the road.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg, #ff6600, #cc5200)'
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                  boxShadow: i % 2 === 0 ? '0 0 24px rgba(255,102,0,0.3)' : '0 0 24px rgba(59,130,246,0.3)',
                }}>{s.num}</div>
                <p style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>{s.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(255,102,0,0.12), rgba(255,102,0,0.04))',
          border: '1px solid rgba(255,102,0,0.2)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to hit the road safely?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join thousands of drivers who trust RoadFix every day.</p>
          <Link to={user ? '/request/create' : '/register'} className="btn btn-primary btn-lg">
            {user ? '🆘 Request Help Now' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
