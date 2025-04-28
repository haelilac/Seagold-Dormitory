import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './sidebar.module.css';
import { FaHome, FaMapMarkedAlt } from "react-icons/fa";
import { MdOutlineBedroomParent, MdOutlinePayment } from "react-icons/md";
import { GrHostMaintenance } from "react-icons/gr";
import logo from "../assets/seagoldlogo.png";

const Sidebar = ({ sidebarOpen }) => {
  const location = useLocation(); // ✅ NOW correctly inside the component

  return (
    <>
      {/* Sidebar for desktop */}
      <div className={`${styles.sidebar} desktop-only`}>
      <img
          src={logo}
          alt="Seagold Logo"
          onClick={() => {
            if (window.innerWidth > 768);
          }}
          className={`${styles.clickableLogo} ${sidebarOpen ? styles.logoExpanded : styles.logoCollapsed}`}
        />
        <nav>
          <ul>
            <li>
              <NavLink to="home" className={`nav-link ${location.pathname === '/tenant/home' ? 'active' : ''}`}>
                <FaHome />
                {sidebarOpen && <span>Home</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="room-info" className={`nav-link ${location.pathname === '/tenant/room-info' ? 'active' : ''}`}>
                <MdOutlineBedroomParent />
                {sidebarOpen && <span>Room</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="bills" className={`nav-link ${location.pathname === '/tenant/bills' ? 'active' : ''}`}>
                <MdOutlinePayment />
                {sidebarOpen && <span>Bills</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="maintenance" className={`nav-link ${location.pathname === '/tenant/maintenance' ? 'active' : ''}`}>
                <GrHostMaintenance />
                {sidebarOpen && <span>Maintenance</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="map" className={`nav-link ${location.pathname === '/tenant/map' ? 'active' : ''}`}>
                <FaMapMarkedAlt />
                {sidebarOpen && <span>Map</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom nav for mobile */}
      <div className="bottom-nav mobile-only">
        <NavLink to="home" className={location.pathname === '/tenant/home' ? 'active' : ''}>
          <FaHome />
        </NavLink>
        <NavLink to="room-info" className={location.pathname === '/tenant/room-info' ? 'active' : ''}>
          <MdOutlineBedroomParent />
        </NavLink>
        <NavLink to="bills" className={location.pathname === '/tenant/bills' ? 'active' : ''}>
          <MdOutlinePayment />
        </NavLink>
        <NavLink to="maintenance" className={location.pathname === '/tenant/maintenance' ? 'active' : ''}>
          <GrHostMaintenance />
        </NavLink>
        <NavLink to="map" className={location.pathname === '/tenant/map' ? 'active' : ''}>
          <FaMapMarkedAlt />
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;