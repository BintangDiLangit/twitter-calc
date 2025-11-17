import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Calculator } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={28} />
              <span>Calculation Tree</span>
            </div>
          </Link>

          <div className="navbar-menu">
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <User size={18} />
                  <span>{user?.username}</span>
                </div>
                <button onClick={logout} className="btn btn-secondary btn-sm">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

