import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiAlertCircle, FiMail } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import '../index.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateStats, setAnimateStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger stats animation after a delay
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      
      // Show success animation before redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-hero">
          <div className="hero-content">
            <div className="hero-logo">MISSING PERSON</div>
            <h1 className="hero-title">Help Find Missing People Together</h1>
            <p className="hero-text">
              Join our community dedicated to reuniting families and finding missing individuals.
              Every report helps, every share matters.
            </p>
          </div>
          
          <div className={`hero-stats ${animateStats ? 'animate' : ''}`}>
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Cases Solved</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">20K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Positive Feedback</div>
            </div>
          </div>
        </div>
        
        <div className="auth-form-container">
          <div className="form-header">
            <div className="welcome-back">Welcome Back</div>
            <h2 className="form-title">Login to Your Account</h2>
            <p className="form-subtitle">Help us find missing people by logging in to your account</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <FiAlertCircle className="error-icon" size={18} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <div className="input-label">Email Address</div>
              <FiMail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <div className="input-label">Password</div>
              <FiLock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
            
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-divider">
            <div className="divider-line"></div>
            <div className="divider-text">or continue with</div>
            <div className="divider-line"></div>
          </div>
          
          <div className="social-login">
            <button className="social-btn">
              <FaGoogle size={18} color="#DB4437" />
            </button>
            <button className="social-btn">
              <FaFacebook size={18} color="#4267B2" />
            </button>
          </div>
          
          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;