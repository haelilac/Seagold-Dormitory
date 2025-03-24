import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const logoUrl = 'http://127.0.0.1:8000/storage/icons/SeagoldLogo.svg'; // Update to your backend logo URL

  return (
    <div className="navbar-container">
      <div className="navbar">
        <div className="navbar-logo">
          <img src={logoUrl} alt="Seagold Dormitory Logo" />
          <span className="navbar-logo-text">Seagold Dormitory</span> {/* Added text beside the logo */}
        </div>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/location" className="navbar-link">Location</Link>
          <Link to="/gallery" className="navbar-link">Gallery</Link>
          <Link to="/units" className="navbar-link">Units</Link>
          <Link to="/apply" className="navbar-link">Apply Now!</Link>
        </div>
        <div className="navbar-login">
          <Link to="/login" className="navbar-login-button">
            <span>Account</span>
            <img src="/user.png" alt="User Icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
