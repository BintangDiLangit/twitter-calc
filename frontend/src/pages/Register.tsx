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
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate username format
  const validateUsername = (value: string): string => {
    if (value.length === 0) {
      return '';
    }
    
    if (value.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (value.length > 30) {
      return 'Username must be 30 characters or less';
    }
    
    // Check for invalid characters (only allow letters, numbers, underscores, hyphens)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens (no spaces)';
    }
    
    return '';
  };

  // Validate password
  const validatePassword = (value: string): string => {
    if (value.length === 0) {
      return ''; // Don't show error for empty field
    }
    
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return '';
  };

  // Validate confirm password
  const validateConfirmPassword = (value: string, passwordValue: string): string => {
    if (value.length === 0) {
      return ''; // Don't show error for empty field
    }
    
    if (value !== passwordValue) {
      return 'Passwords do not match';
    }
    
    return '';
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(validateUsername(value));
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
    // Also validate confirm password if it has a value
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value));
    }
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(value, password));
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate username
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }

    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Validate confirm password
    const confirmPasswordValidationError = validateConfirmPassword(confirmPassword, password);
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
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
                onChange={handleUsernameChange}
                onBlur={() => {
                  // Validate on blur as well
                  setUsernameError(validateUsername(username));
                }}
                placeholder="Choose a username"
                required
                autoFocus
                style={{
                  borderColor: usernameError ? 'var(--error)' : undefined,
                  borderWidth: usernameError ? '2px' : undefined,
                }}
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              {usernameError ? (
                <small style={{ color: 'var(--error)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  {usernameError}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  3-30 characters, letters, numbers, underscores, and hyphens only
                </small>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  // Validate on blur as well
                  setPasswordError(validatePassword(password));
                }}
                placeholder="Create a password"
                required
                minLength={6}
                style={{
                  borderColor: passwordError ? 'var(--error)' : undefined,
                  borderWidth: passwordError ? '2px' : undefined,
                }}
              />
              {passwordError ? (
                <small style={{ color: 'var(--error)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  {passwordError}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  At least 6 characters
                </small>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => {
                  // Validate on blur as well
                  setConfirmPasswordError(validateConfirmPassword(confirmPassword, password));
                }}
                placeholder="Confirm your password"
                required
                minLength={6}
                style={{
                  borderColor: confirmPasswordError ? 'var(--error)' : undefined,
                  borderWidth: confirmPasswordError ? '2px' : undefined,
                }}
              />
              {confirmPasswordError ? (
                <small style={{ color: 'var(--error)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  {confirmPasswordError}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Re-enter your password
                </small>
              )}
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

