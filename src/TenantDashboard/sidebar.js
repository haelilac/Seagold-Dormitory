import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../TenantDashboard/TenantDashboard.module.css';
import { FaHome, FaMapMarkedAlt } from "react-icons/fa";
import { MdOutlineBedroomParent, MdOutlinePayment } from "react-icons/md";
import { GrHostMaintenance } from "react-icons/gr";
import logo from "../assets/seagold-logo.png";
import './sidebar.css';

const Sidebar = ({ sidebarOpen }) => {

  
const location = useLocation();

  return (
    <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : 'collapsed'}`}>
      <img 
        src={logo} 
        alt="Seagold Logo"  
        className={sidebarOpen ? "seagold-logo" : "seagold-logo small"} 
      />

      <nav>
        <ul>
          <li>
          <NavLink
  to="home"
  className={`nav-link ${location.pathname === '/tenant/home' ? 'active' : ''}`}
>
              <FaHome />
              {sidebarOpen && <span>Home</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="room-info"
              className={`nav-link ${location.pathname === '/tenant/room-info' ? 'active' : ''}`}
            >
              <MdOutlineBedroomParent />
              {sidebarOpen && <span>Room Information</span>}
            </NavLink>
          </li>
          <li>
          <NavLink
            to="bills"
            className={`nav-link ${location.pathname === '/tenant/bills' ? 'active' : ''}`}
          >
            <MdOutlinePayment />
            {sidebarOpen && <span>Bills & Payments</span>}
          </NavLink>
          </li>
          <li>
            <NavLink
              to="maintenance"
              className={`nav-link ${location.pathname === '/tenant/maintenance' ? 'active' : ''}`}
            >
              <GrHostMaintenance />
              {sidebarOpen && <span>Maintenance Request</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="map"
              className={`nav-link ${location.pathname === '/tenant/map' ? 'active' : ''}`}
            >
              <FaMapMarkedAlt />
              {sidebarOpen && <span>Map</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
