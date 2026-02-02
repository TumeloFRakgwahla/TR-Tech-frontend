/**
 * Admin Login Page Component
 *
 * This page provides a login form for administrators to access the admin dashboard.
 * It includes form validation and navigation to the dashboard upon successful login.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // For demo purposes, accept any password
    // In a real app, this would authenticate with the backend
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Login</h1>
          <p className="text-muted-foreground">
            Enter your password to access the admin dashboard
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors"
          >
            Login
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Demo password: admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
