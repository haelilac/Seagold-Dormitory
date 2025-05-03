import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';
import styles from './TenantDashboard.module.css';
import { FaBell } from 'react-icons/fa';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from '../contexts/DataContext';
import Sidebar from './sidebar';
import '../components/sidebar.css';
import TopBar from './topbar';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const TenantDashboard = ({ onLogout }) => {
    const { updateCache, getCachedData } = useDataCache();
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);  // Defined state
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);
    const bellRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://seagold-laravel-production.up.railway.app/api/auth/user', {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: 'application/json',
                    },
                });
                setUserData(res.data);
                updateCache('userData', res.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData) {
            window.Pusher = Pusher;
            const echo = new Echo({
                broadcaster: 'pusher',
                key: '865f456f0873a587bc36',
                cluster: 'ap3',
                forceTLS: true,
                authEndpoint: 'http://seagold-laravel-production.up.railway.app/api/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`
                    }
                }
            });
    
            const channel = echo.private(`tenant.notifications.${userData.id}`);
            
            channel.listen('.tenant-notification', (event) => {
                setNotifications((prev) => {
                  const alreadyExists = prev.some((n) =>
                    n.title === event.title &&
                    n.message === event.message &&
                    n.time === event.time
                  );
              
                  if (!alreadyExists) {
                    return [
                      ...prev,
                      {
                        id: event.id, // include this if your event carries an ID
                        title: event.title,
                        message: event.message,
                        time: event.time,
                        type: event.type || 'general',
                        read: false,
                        created_at: new Date().toISOString(),
                        relative_time: 'Just now'
                      }
                    ];
                  }
              
                  return prev;
                });
              });
    
            return () => {
                echo.leave(`tenant.notifications.${userData.id}`);
            };
        }
    }, [userData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const notifRes = await axios.get('http://seagold-laravel-production.up.railway.app/api/notifications', {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: 'application/json',
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

        if (userData) {
            fetchData();
        }

        const interval = setInterval(fetchData, 30000); // every 30 seconds

        return () => clearInterval(interval); // cleanup
    }, [userData, navigate]);

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

    const markAsRead = async (id) => {
        try {
          await fetch(`http://seagold-laravel-production.up.railway.app/api/notifications/${id}/read`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`
            }
          });
      
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              read: n.id === id ? true : (n.read ?? false),
            }))
          );
        } catch (err) {
          console.error("Failed to mark notification as read:", err);
        }
      };
      
      const deleteNotification = async (id) => {
        await fetch(`http://seagold-laravel-production.up.railway.app/api/notifications/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });
      
        setNotifications(prev => prev.filter(n => n.id !== id));
      };
      const toggleNotifications = () => {
        setShowNotifications(prev => !prev);
      };

      const handleViewDetails = (notification) => {
        const routes = {
          maintenance: '/tenant/maintenance',
          payment: '/tenant/payments',
          amenity: '/tenant/amenities',
        };
      
        const target = routes[notification?.type];
      
        if (!target) {
          console.warn('❌ Unrecognized or missing notification type:', notification?.type);
          return;
        }
      
        if (notification.id) {
          markAsRead(notification.id);
        }
      
        navigate(target);
      };

    const toggleDropdown = (event, index) => {
    event.stopPropagation();
    setActiveDropdown((prev) => (prev === index ? null : index));
    };
    return (
        <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <TopBar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                userData={userData}
                setUserData={setUserData}
                notifications={notifications}
                filteredNotifications={filteredNotifications}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                showProfileDropdown={showProfileDropdown}
                setShowProfileDropdown={setShowProfileDropdown}
                toggleNotifications={toggleNotifications} 
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                handleLogout={handleLogout}
                dropdownRef={dropdownRef}
                bellRef={bellRef}
                profileDropdownRef={profileDropdownRef}
                setNotifications={setNotifications}
                handleViewDetails={handleViewDetails}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
                clearAllNotifications={() => setNotifications([])}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                />
            <div className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}>
                <Outlet context={{ sidebarOpen }} />
            </div>
        </div>
    );
};

export default TenantDashboard;