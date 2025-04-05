import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import CreateAccountModal from '../CreateAccount/CreateAccount';
import axiosInstance from './axiosInstance';
import LoginBg from '../../assets/Loginbg.png';

const Login = () => {
  const [isCreateAccountOpen, setCreateAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (storedToken) {
      setRememberMe(true);
    }
  }, []);

useEffect(() => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");

  if (token && role) {
    if (role === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (role === "tenant") {
      window.location.href = "/tenant/dashboard/home";
    }
  }
}, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await axiosInstance.get('/sanctum/csrf-cookie');
      const response = await axiosInstance.post('/api/login-admin-tenant', {
        email,
        password,
      });

      const data = response.data;

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
      } else {
        sessionStorage.setItem("token", data.access_token);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("user_id", data.user_id);
      }

      axiosInstance.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;

      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (data.role === "tenant") {
        if (data.status === 'terminated') {
          setErrorMessage("Your account has been terminated. Please contact the administrator.");
        } else {
          window.location.href = "/tenant/dashboard/home";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.response?.data?.error || "Invalid credentials or CSRF issue");
    }
  };

  const scheduleTokenRefresh = (token) => {
    setTimeout(async () => {
      try {
        const response = await axiosInstance.post('/api/auth/refresh-token', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const newToken = response.data.access_token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          scheduleTokenRefresh(newToken);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    }, 1000 * 60 * 50);
  };

return (
  <div
    className="login-page"
    style={{
      backgroundImage: `url(${LoginBg})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }}
  >
    {/* Logo (mobile only) */}
        <img
        src={require("../../assets/seagoldlogo.jpg")}
        alt="Logo"
        className="mobile-logo"
      />
    {/* Form Box */}
    <div className="login-container">
      <h1 className="welcome-text"><span className="typing-text">Hello, welcome!</span></h1>


      {/* Error Message Display */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Login Form */}
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="name@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="********"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-options">
          <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          /> Remember me

          </label>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>
        <div className="button-group">
          <button type="submit" className="login-button">
            Login
          </button>
        </div>
      </form>

      {/* Modal for Account Creation */}
      <div className="create-account">
          <span>
            You don't have an account?{' '}
            <Link to="/apply" className="create-account-link">
              Apply Now
            </Link>
          </span>
        </div>
      </div>
    </div>
);

};

export default Login;