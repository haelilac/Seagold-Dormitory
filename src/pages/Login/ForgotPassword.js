import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPass.css';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('https://seagold-laravel-production.up.railway.app/api/forgot-password', {
        email,
      });
      setMessage(res.data.message || 'Reset link sent to your email.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Send Reset Link</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default ForgotPassword;
