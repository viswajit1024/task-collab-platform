import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import './Auth.css';

const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.type === 'auth/login/fulfilled') {
      toast.success('Welcome back!');
    }
  };

  const fillDemo = () => {
    setFormData({ email: 'demo@example.com', password: 'password123' });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="form-group">
        <label className="label">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
      <button type="button" className="btn btn-secondary auth-btn" onClick={fillDemo}>
        Use Demo Account
      </button>
    </form>
  );
};

export default LoginForm;