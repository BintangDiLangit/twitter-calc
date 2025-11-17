import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '450px', margin: '0 auto' }}
      >
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={30} color="white" />
            </motion.div>
            <h2>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Join our mathematical communication platform
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-error"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoFocus
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                3-30 characters, letters, numbers, underscores, and hyphens only
              </small>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                At least 6 characters
              </small>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

