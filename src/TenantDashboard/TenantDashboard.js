import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import styles from './TenantDashboard.module.css';
import { FaBell, FaBars, FaTimes, FaEllipsisV, FaMoon, FaSun } from 'react-icons/fa';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from '../contexts/DataContext';

const TenantDashboard = ({ onLogout }) => {
    const { updateCache } = useDataCache();
  
    useEffect(() => {
        const fetchInitialData = async () => {
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
    
            const maintenanceRes = await axios.get(`https://seagold-laravel-production.up.railway.app/api/maintenance/${res.data.id}`, {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            updateCache(`maintenance-${res.data.id}`, maintenanceRes.data);
    
            // Add more API preloads as needed
          } catch (err) {
            console.error('Error preloading tenant data:', err);
          }
        };
    
        fetchInitialData();
      }, []);
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
        const { updateCache } = useDataCache();


        
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
            <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : 'closed'}`}>
                {sidebarOpen && (
                    <button
                        className={styles.closeButton}
                        onClick={toggleSidebar}
                    >
                        <FaTimes size={24} />
                    </button>
                )}
                <h2>Menu</h2>
                <nav>
                    <ul>
                        <li><Link to="home">Home</Link></li>
                        <li><Link to="room-info">Room Information</Link></li>
                        <li><Link to="bills">Bills and Payments</Link></li>
                        <li><Link to="maintenance">Maintenance Request</Link></li>
                        <li><Link to="map">Map</Link></li>
                    </ul>
                </nav>
            </div>

            <div className={`${styles.topBar} ${sidebarOpen ? styles.shifted : ''}`}>
                <div className={styles.topBarLeft}>
                    {!sidebarOpen && (
                        <button
                            className={styles.hamburgerButton}
                            onClick={toggleSidebar}
                        >
                            <FaBars size={24} />
                        </button>
                    )}
                </div>
                <div className={styles.topBarRight}>
                <div className={styles.notificationContainer} ref={dropdownRef}>
                        <FaBell
                            className={styles.notificationIcon}
                            onClick={() => setShowNotifications((prev) => !prev)}
                        />
                        {filteredNotifications.filter((n) => !n.read).length > 0 && (
                            <span className={styles.notificationBadge}>
                                {filteredNotifications.filter((n) => !n.read).length}
                            </span>
                        )}
                        {showNotifications && (
                            <div
                                ref={dropdownRef}
                                className={styles.notificationDropdown}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.notificationHeader}>
                                    <h4>Notifications</h4>
                                </div>
                                <ul className={styles.notificationList}>
                                    {filteredNotifications.length > 0 ? (
                                        filteredNotifications.map((note, index) => (
                                            <li key={index} className={note.read ? styles.read : ''}>
                                                <div className={styles.notificationContent}>
                                                    <span>
                                                        {note.title || 'Notification'}: {note.message}
                                                    </span>
                                                    <FaEllipsisV
                                                        className={styles.threeDots}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setNotifications((prev) =>
                                                                prev.map((n, i) =>
                                                                    i === index
                                                                        ? { ...n, showMenu: !n.showMenu }
                                                                        : { ...n, showMenu: false }
                                                                )
                                                            );
                                                        }}
                                                    />
                                                    {note.showMenu && (
                                                        <div
                                                            className={styles.notificationOptions}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNotification(index);
                                                            }}
                                                        >
                                                            Delete
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <p className={styles.noNotifications}>No new notifications</p>
                                    )}
                                </ul>
                                <div className={styles.notificationActions}>
                                    <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className={styles.topBarProfile}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfileDropdown((prev) => !prev);
                        }}
                        ref={profileDropdownRef}
                    >
                        {/* Profile Picture */}
                        <img 
                            src="https://seagold-laravel-production.up.railway.app/storage/profile/admin.png" 
                            alt="User Profile" 
                            className={styles.profilePicture} 
                        />
                        <span>{userData?.name || 'User Name'}</span>
                        {showProfileDropdown && (
                            <div
                                className={`${styles.profileDropdown} ${showProfileDropdown ? styles.show : ''}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ul>
                                <li>
                                    {/* Profile Picture in Dropdown */}
                                        <img 
                                            src="https://seagold-laravel-production.up.railway.app/storage/profile/admin.png" 
                                            alt="User Profile" 
                                            className={styles.dropdownProfilePicture} 
                                        />
                                    </li>
                                    <li className={styles.userName}>{userData?.name}</li> 
                                    <li className={styles.profileEmail}>{userData?.email}</li> 
                                    <li><button onClick={handleLogout}>Logout</button></li>
                                    <li>
                                        <button
                                            className={styles.darkModeToggle}
                                            onClick={toggleDarkMode}
                                        >
                                            {darkMode ? (
                                                <><FaSun /> Light Mode</>
                                            ) : (
                                                <><FaMoon /> Dark Mode</>
                                            )}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}>
                <Outlet context={{ sidebarOpen }} />
            </div>
        </div>
    );
};

export default TenantDashboard;


