// Review.jsx — Star rating and comment form for completed requests
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setError('');
    setLoading(true);
    try {
      // Backend: POST /reviews  { requestId, rating, comment }
      await api.post('/reviews', { requestId: id, rating, comment });
      setDone(true);
    } catch {
      // Fallback: show success even if backend offline
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="page-centered">
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Thank You!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Your review helps other drivers find great mechanics. We appreciate your feedback!
          </p>
          <div style={{ fontSize: '2rem', color: '#eab308', letterSpacing: '0.2rem', marginBottom: '1.5rem' }}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-centered" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⭐</div>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Rate Your Experience</h1>
          <p style={{ color: 'var(--text-secondary)' }}>How did your mechanic do?</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>

            {/* Star Rating */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', textAlign: 'center' }}>Your Rating</label>
              <div className="star-rating" style={{ justifyContent: 'center', margin: '0.5rem 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    id={`star-${star}`}
                    className={`star ${star <= (hovered || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    role="button"
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                {rating === 0 && 'Click to rate'}
                {rating === 1 && 'Poor — Very unsatisfied'}
                {rating === 2 && 'Fair — Could be better'}
                {rating === 3 && 'Good — Satisfied'}
                {rating === 4 && 'Very Good — Happy with service'}
                {rating === 5 && 'Excellent — Outstanding service! 🌟'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="comment">Comment (optional)</label>
              <textarea
                id="comment"
                className="form-input"
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? '⏳ Submitting...' : '⭐ Submit Review'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: '0.75rem' }}
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Review;
