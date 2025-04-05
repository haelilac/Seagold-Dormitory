import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SeagoldNavbarCSS.css';

const SeagoldNavbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  // Set active link based on route
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Scroll effect for desktop
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/location', label: 'Location' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/units', label: 'Units' },
    { path: '/apply', label: 'Apply' },
    { path: '/login', label: 'Account' }
  ];

  return (
    <>
      {/* Desktop Navbar (stays at top) */}
      <div className={`seagold-navbar-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="seagold-navbar">
          {/* Logo */}
          <div className="seagold-navbar-logo">
            <Link to="/">
              <img 
                src="/static/media/seagoldlogo.ed8d6b9d01f0e350f87c.jpg"
                alt="Seagold Dormitory Logo"
                loading="lazy"
              />
            </Link>
            <span className="seagold-navbar-logo-text"></span>
          </div>

          {/* Desktop Navigation */}
          <div className="seagold-navbar-links">
            {navItems.filter(item => item.path !== '/login').map(item => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={activeLink === item.path ? 'active' : ''}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Login Section */}
          <div className="seagold-navbar-login">
            <Link 
              to="/login" 
              className="seagold-navbar-login-button"
            >
              <span>Account</span>
              <img 
                src="/user.png" 
                alt="User Icon" 
                loading="lazy"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${activeLink === item.path ? 'active' : ''}`}
          >
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

// Reusable NavLink component
const NavLink = ({ to, className, children }) => (
  <Link 
    to={to} 
    className={`seagold-navbar-link ${className}`}
  >
    {children}
  </Link>
);

export default SeagoldNavbar;