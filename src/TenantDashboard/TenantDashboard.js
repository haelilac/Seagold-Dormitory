import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import styles from './TenantDashboard.module.css';
import { FaBell, FaBars, FaTimes, FaEllipsisV, FaMoon, FaSun } from 'react-icons/fa';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from '../contexts/DataContext';
import Sidebar from './sidebar';
import './sidebar.css';
import TopBar from './topbar';

const TenantDashboard = ({ onLogout }) => {
    const { updateCache, getCachedData } = useDataCache();
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);
    const bellRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            navigate('/login');
            return;
        }

        const preloadCache = async () => {
            try {
                const res = await axios.get('https://seagold-laravel-production.up.railway.app/api/auth/user', {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: 'application/json',
                    },
                });
                setUserData(res.data);
                updateCache('userData', res.data);

                const paymentRes = await axios.get(`https://seagold-laravel-production.up.railway.app/api/tenant-payments/${res.data.id}`, {
                    headers: { Authorization: `Bearer ${getAuthToken()}` },
                });
                updateCache(`payments-${res.data.id}`, paymentRes.data);

                const maintenanceRes = await axios.get(`https://seagold-laravel-production.up.railway.app/api/tenant/maintenance-requests`, {
                    headers: { Authorization: `Bearer ${getAuthToken()}` },
                });
                updateCache(`tenant-maintenance`, maintenanceRes.data);

                const eventsRes = await axios.get(`https://seagold-laravel-production.up.railway.app/api/events`, {
                    headers: { Authorization: `Bearer ${getAuthToken()}` },
                });
                updateCache(`tenant-events`, eventsRes.data);
            } catch (err) {
                console.error('Error preloading tenant data:', err);
            }
        };

        preloadCache();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get('https://seagold-laravel-production.up.railway.app/api/auth/user', {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: "application/json",
                    },
                });
                setUserData(userRes.data);

                const notifRes = await axios.get('https://seagold-laravel-production.up.railway.app/api/notifications', {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: "application/json",
                    },
                });
                setNotifications(notifRes.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.clear();
                    sessionStorage.clear();
                    navigate('/login');
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // every 30 seconds

        return () => clearInterval(interval); // cleanup
    }, [navigate]);

    useEffect(() => {
        const filterNotifications = () => {
            if (userData) {
                const role = userData.role;
                const currentUserId = userData.id;
                const filtered = notifications.filter((notification) => {
                    if (role === 'admin') {
                        return notification.user_id === null;
                    }
                    return notification.user_id === currentUserId;
                });
                setFilteredNotifications(filtered);
            }
        };
        filterNotifications();
    }, [notifications, userData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                bellRef.current &&
                !bellRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));
    };

    const handleDeleteNotification = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <TopBar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                userData={userData}
                filteredNotifications={filteredNotifications}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                showProfileDropdown={showProfileDropdown}
                setShowProfileDropdown={setShowProfileDropdown}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleDeleteNotification={handleDeleteNotification}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                handleLogout={handleLogout}
                dropdownRef={dropdownRef}
                bellRef={bellRef}
                profileDropdownRef={profileDropdownRef}
                setNotifications={setNotifications}
            />
            <div className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}>
                <Outlet context={{ sidebarOpen }} />
            </div>
        </div>
    );
};

export default TenantDashboard;
