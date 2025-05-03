import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import ForgotPassBg from '../../assets/ForgotPass.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://seagold-laravel-production.up.railway.app/api/forgot-password', {
        email,
      });
      setMessage(res.data.message || 'Reset link sent to your email.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send reset link.');
    }
  };

  return (
    <div
      className="forgot-password-page"
      style={{
        backgroundImage: `url(${ForgotPassBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="forgot-password-form">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
