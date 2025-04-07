import React, { useEffect, useState } from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import Location from './pages/Location/Location';
import Gallery from './pages/Gallery/Gallery';
import Units from './pages/Units/Units';
import TourBooking from './pages/TourBooking/TourBooking';
import Login from './pages/Login/Login';
import AdminDashboard from './Admin/AdminDashboard';
import PendingApplications from './Admin/PendingApplications';
import UnitManagement from './Admin/UnitManagement';
import EventsBoard from './Admin/EventsBoard';
import ManageTenants from './Admin/ManageTenants';
import PaymentAdmin from './Admin/PaymentAdmin';
import MaintenanceRequests from './Admin/MaintenanceRequests';
import AdminTourBookings from './Admin/AdminTourBookings';
import GalleryAdmin from './Admin/GalleryAdmin';
import FeedbackAdmin from './Admin/FeedbackAdmin';
import TenantDashboard from './TenantDashboard/TenantDashboard';
import HomeTenant from './TenantDashboard/HomeTenant';
import RoomInfo from './TenantDashboard/RoomInfoTenant';
import Bills from './TenantDashboard/PaymentTenant';
import Maintenance from './TenantDashboard/MaintenanceTenant';
import Map from './TenantDashboard/MapTenant';
import Apply from './pages/Apply/Apply';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { GoogleOAuthProvider } from "@react-oauth/google";
import './App.css';
import LoginModal from "./pages/LoginModal/LoginModal";
import Feedback from 'react-bootstrap/esm/Feedback';
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';
import { getAuthToken } from "./utils/auth";

const clientId = "758551378674-8t930isecldottudrarf724h6jlgdcji.apps.googleusercontent.com";

const getStorageItem = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const App = () => {
  const getStorageItem = (key) => {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  };
  
  const [role, setRole] = useState(getStorageItem('role') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getStorageItem('token'));
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Function to handle adding a new unit
  const handleAddUnit = async (unit) => {
    try {
        const response = await fetch("https://seagold-laravel-production.up.railway.app/api/units", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(unit),
        });

        if (!response.ok) {
            throw new Error("Failed to add unit.");
        }

        const newUnit = await response.json();
        alert("Unit added successfully!");
    } catch (error) {
        console.error("Error adding unit:", error);
        alert("Failed to add unit. Please try again.");
    }
  };

  // Authentication check function
  const checkAuth = async () => {
    const token = getStorageItem("token");
    if (!token) {
      localStorage.clear();
      sessionStorage.clear();
      setRole(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch("https://seagold-laravel-production.up.railway.app/api/auth/validate-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Token invalid");

      const user = await response.json();
      console.log("Fetched User Data:", user); 

      if (user.role) {
        setRole(user.role); 
        localStorage.setItem('role', user.role); 
      } else {
        setRole("guest_user"); 
        localStorage.setItem('role', "guest_user");
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Token validation failed:", error.message);
      localStorage.clear();
      sessionStorage.clear();
      setRole(null);
      setIsLoggedIn(false);
    }
  };

  // Handle logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage data
    sessionStorage.clear();
    setRole(null);
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = (userRole) => {
    setIsLoggedIn(true);
    if (userRole) {
      setRole(userRole);
      localStorage.setItem('role', userRole);
    } else {
      setRole("general_user"); // Fallback for guest users
      localStorage.setItem('role', "general_user");
    }
    setShowLoginModal(false);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="app-content">
          {console.log("Current Role State:", role)}

          {(!isLoggedIn || (role !== 'admin' && role !== 'tenant')) && <Navbar onLogout={handleLogout} />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/units" element={<Units />} />
            <Route path="/book-tour" element={<TourBooking />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/login" element={<Login setRole={handleLoginSuccess} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin-only routes */}
            <Route
              path="/admin/dashboard/*"
              element={role === 'admin' ? <AdminDashboard onLogout={handleLogout} onAddUnit={handleAddUnit} /> : <Navigate to="/login" />}
            >
              <Route path="pending-applications" element={<PendingApplications />} />
              <Route path="unit-management" element={<UnitManagement onAddUnit={handleAddUnit} />} />
              <Route path="events-board" element={<EventsBoard />} />
              <Route path="manage-tenants" element={<ManageTenants />} />
              <Route path="payment-dashboard" element={<PaymentAdmin />} />
              <Route path="maintenance-requests" element={<MaintenanceRequests />} />
              <Route path="tour-bookings" element={<AdminTourBookings />} />
              <Route path="gallery-admin" element={<GalleryAdmin />} />
              <Route path="feedback-admin" element={<FeedbackAdmin />} />
            </Route>

            {/* Tenant-only routes */}
            <Route
              path="/tenant/dashboard/*"
              element={role === 'tenant' ? <TenantDashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
            >
              <Route path="home" element={<HomeTenant />} />
              <Route path="room-info" element={<RoomInfo />} />
              <Route path="bills" element={<Bills />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="map" element={<Map />} />
            </Route>

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
