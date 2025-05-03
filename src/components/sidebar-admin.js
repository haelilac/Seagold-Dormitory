import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './sidebar-admin.module.css';
import { 
  FaUsers, FaClipboardList, FaBuilding, FaCalendarCheck, 
  FaMoneyBillWave, FaTools, FaCamera, FaCommentDots, 
  FaMapMarkedAlt, FaConciergeBell 
} from "react-icons/fa";
import logo from "../assets/seagoldlogo.png";

const Sidebar = ({ sidebarOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Sidebar for desktop */}
      <div className={`${styles.sidebar} desktop-only`}>
        <img
          src={logo}
          alt="Seagold Logo"
          className={`${styles.clickableLogo} ${sidebarOpen ? styles.logoExpanded : styles.logoCollapsed}`}
        />
        <nav>
          <ul>
            <li>
              <NavLink
                to="tour-bookings"
                className={`nav-link ${location.pathname === '/admin/tour-bookings' ? 'active' : ''}`}
              >
                <FaMapMarkedAlt />
                {sidebarOpen && <span>Bookings</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="pending-applications"
                className={`nav-link ${location.pathname === '/admin/pending-applications' ? 'active' : ''}`}
              >
                <FaClipboardList />
                {sidebarOpen && <span>Applications</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="unit-management"
                className={`nav-link ${location.pathname === '/admin/unit-management' ? 'active' : ''}`}
              >
                <FaBuilding />
                {sidebarOpen && <span>Unit</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="manage-tenants"
                className={`nav-link ${location.pathname === '/admin/manage-tenants' ? 'active' : ''}`}
              >
                <FaUsers />
                {sidebarOpen && <span>Tenants</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="events-board"
                className={`nav-link ${location.pathname === '/admin/events-board' ? 'active' : ''}`}
              >
                <FaCalendarCheck />
                {sidebarOpen && <span>Events</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="payment-dashboard"
                className={`nav-link ${location.pathname === '/admin/payment-dashboard' ? 'active' : ''}`}
              >
                <FaMoneyBillWave />
                {sidebarOpen && <span>Payments</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="maintenance-requests"
                className={`nav-link ${location.pathname === '/admin/maintenance-requests' ? 'active' : ''}`}
              >
                <FaTools />
                {sidebarOpen && <span>Maintenance</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="gallery-admin"
                className={`nav-link ${location.pathname === '/admin/gallery-admin' ? 'active' : ''}`}
              >
                <FaCamera />
                {sidebarOpen && <span>Gallery</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="feedback-admin"
                className={`nav-link ${location.pathname === '/admin/feedback-admin' ? 'active' : ''}`}
              >
                <FaCommentDots />
                {sidebarOpen && <span>Feedback</span>}
              </NavLink>
            </li>

            {/* ⭐ New Amenity Requests Link */}
            <li>
              <NavLink
                to="amenity-requests"
                className={`nav-link ${location.pathname === '/admin/amenity-requests' ? 'active' : ''}`}
              >
                <FaConciergeBell />
                {sidebarOpen && <span>Amenity Requests</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom nav for mobile */}
      <div className="bottom-nav mobile-only">
        <NavLink to="tour-bookings" className={location.pathname === '/admin/tour-bookings' ? 'active' : ''}>
          <FaMapMarkedAlt />
        </NavLink>
        <NavLink to="pending-applications" className={location.pathname === '/admin/pending-applications' ? 'active' : ''}>
          <FaClipboardList />
        </NavLink>
        <NavLink to="unit-management" className={location.pathname === '/admin/unit-management' ? 'active' : ''}>
          <FaBuilding />
        </NavLink>
        <NavLink to="manage-tenants" className={location.pathname === '/admin/manage-tenants' ? 'active' : ''}>
          <FaUsers />
        </NavLink>
        <NavLink to="events-board" className={location.pathname === '/admin/events-board' ? 'active' : ''}>
          <FaCalendarCheck />
        </NavLink>
        <NavLink to="payment-dashboard" className={location.pathname === '/admin/payment-dashboard' ? 'active' : ''}>
          <FaMoneyBillWave />
        </NavLink>
        <NavLink to="maintenance-requests" className={location.pathname === '/admin/maintenance-requests' ? 'active' : ''}>
          <FaTools />
        </NavLink>
        <NavLink to="gallery-admin" className={location.pathname === '/admin/gallery-admin' ? 'active' : ''}>
          <FaCamera />
        </NavLink>
        <NavLink to="feedback-admin" className={location.pathname === '/admin/feedback-admin' ? 'active' : ''}>
          <FaCommentDots />
        </NavLink>
        <NavLink to="amenity-requests" className={location.pathname === '/admin/amenity-requests' ? 'active' : ''}>
          <FaConciergeBell />
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;
