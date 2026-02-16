import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { disconnectSocket } from '../../socket/socketClient';
import Avatar from './Avatar';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand">
          <span className="navbar-logo">📋</span>
          <span className="navbar-title">TaskCollab</span>
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="navbar-link">
            Boards
          </Link>
        )}
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="navbar-user">
            <Avatar name={user?.name} size={32} />
            <span className="navbar-username">{user?.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;