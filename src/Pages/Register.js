import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiAlertCircle, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import '../index.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role: 'user'
      });
      
      // Show success alert and redirect to login
      alert('Registration successful! Please login to continue.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-hero">
          <div className="hero-content">
            <div className="hero-logo">MISSING PERSON</div>
            <h1 className="hero-title">Join Our Mission To Help Find Missing People</h1>
            <p className="hero-text">
              Create an account to report missing persons, share alerts, and become part of a
              community dedicated to bringing families back together.
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
            <div className="welcome-back">Get Started</div>
            <h2 className="form-title">Create Your Account</h2>
            <p className="form-subtitle">Join our platform to help locate missing individuals</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <FiAlertCircle className="error-icon" size={18} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <div className="input-label">Full Name</div>
              <FiUser className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <div 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#a0aec0'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </div>
            </div>
            
            <div className="input-group">
              <div className="input-label">Confirm Password</div>
              <FiLock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-divider">
            <div className="divider-line"></div>
            <div className="divider-text">or register with</div>
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
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;