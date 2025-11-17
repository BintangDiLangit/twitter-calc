import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
              <LogIn size={30} color="white" />
            </motion.div>
            <h2>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Login to continue your mathematical journey
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
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

