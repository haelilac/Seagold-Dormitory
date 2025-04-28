import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";
import {
    FaBars,
    FaBell,
    FaTimes,
    FaUsers,
    FaClipboardList,
    FaBuilding,
    FaCalendarCheck,
    FaMoneyBillWave,
    FaTools,
    FaCamera,
    FaCommentDots,
    FaCheckCircle,
    FaTimesCircle, 
    FaTrash,
    FaEllipsisV,
    FaInfoCircle,
    FaCog
} from "react-icons/fa";
import Pusher from "pusher-js";
import { getAuthToken } from "../utils/auth";
import TopBarAdmin from "../components/topbar-admin";
import Sidebar from "../components/sidebar-admin";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState({ name: "", email: "", profilePicture: "" });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSound, setNotificationSound] = useState("Default");
    const [muteDuration, setMuteDuration] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const clearAllNotifications = () => setNotifications([]);
    const markAllAsUnread = () => setNotifications((prev) => prev.map(n => ({ ...n, read: false })));
    const markAllAsRead = () => setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    const toggleSidebar = () => { setIsSidebarCollapsed((prev) => !prev); };
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
              const response = await fetch("https://seagold-laravel-production.up.railway.app/api/auth/user", {
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`,
                  Accept: "application/json",
                },
              });
              const user = await response.json();
              setAdmin({
                name: user.name,
                email: user.email,
                profilePicture: user.profile_picture,
              });
            } catch (error) {
              console.error("Error fetching admin data:", error);
            }
          };
        fetchAdminData();
    }, []);

    useEffect(() => {
      const pusher = new Pusher("fea5d607d4b38ea09320", {
        cluster: "ap1",
        encrypted: true,
      });
    
      const channel = pusher.subscribe("admin.notifications");
    
      channel.bind("admin.notification", (data) => {
        console.log("📩 New Admin Notification:", data);
    
        const newNotif = {
          message: data.message,
          time: data.time,
          type: data.type,
          read: false
        };
    
        setNotifications(prev => [newNotif, ...prev]);
      });
    
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }, []);

    const toggleDropdown = (event, index) => {
        event.stopPropagation();
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
              const response = await fetch("https://seagold-laravel-production.up.railway.app/api/notifications", {
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`,
                  Accept: "application/json",
                },
              });
              const data = await response.json();
              const normalized = data.map((notif) => ({
                ...notif,
                read: notif.read ?? false // make sure it's always a boolean
              }));
              setNotifications(normalized);
            } catch (error) {
              console.error("Error fetching notifications:", error);
            }
          };
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
      try {
        // Update in backend
        await fetch(`https://seagold-laravel-production.up.railway.app/api/notifications/${id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: "application/json",
          },
        });
    
        // Update in frontend
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    
      setActiveDropdown(null);
    };

    const deleteNotification = async (id) => {
      try {
        const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/notifications/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }
    
        // Remove from local state
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        setActiveDropdown(null);
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    };

    const [expandSettings, setExpandSettings] = useState(null);

    const handleViewDetails = (notification) => {
        const routes = {
            "pending_application": "/admin/dashboard/pending-applications",
            "unit_management": "/admin/dashboard/unit-management",
            "tenant_update": "/admin/dashboard/manage-tenants",
            "event_notification": "/admin/dashboard/events-board",
            "payment_alert": "/admin/dashboard/payment-dashboard",
            "maintenance_request": "/admin/dashboard/maintenance-requests",
            "gallery_update": "/admin/dashboard/gallery-admin",
            "feedback_received": "/admin/dashboard/feedback-admin",
        };

        const targetRoute = routes[notification.type];
        if (!targetRoute) return;
        navigate(targetRoute);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          bellRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !bellRef.current.contains(event.target)
        ) {
          setShowNotifications(false);
          setShowSettingsDropdown(false);
          setActiveDropdown(null);
        }
    
        if (
          profileRef.current &&
          !profileRef.current.contains(event.target)
        ) {
          setShowProfileDropdown(false);
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const getNotificationIcon = (type) => {
        const iconStyle = {
            color: "#FFD700",
            marginRight: "10px",
            filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))",
        };

        switch (type) {
            case "maintenance_request": return <FaTools style={iconStyle} />;
            case "payment_alert": return <FaMoneyBillWave style={iconStyle} />;
            case "event_notification": return <FaCalendarCheck style={iconStyle} />;
            case "tenant_update": return <FaUsers style={iconStyle} />;
            case "feedback_received": return <FaCommentDots style={iconStyle} />;
            default: return <FaBell style={iconStyle} />;
        }
    };

    const handleLogout = (e) => {
        e.stopPropagation();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    const handleSoundChange = (e) => {
        const selectedSound = e.target.value;
        setNotificationSound(selectedSound);

        const soundMap = {
            Default: "/sounds/mixkit-correct-answer-tone-2870.wav",
            Doorbell: "/sounds/mixkit-doorbell-tone-2864.wav",
            Beep: "/sounds/mixkit-gaming-lock-2848.wav",
            Brrt: "/sounds/mixkit-long-pop-2358.wav",
            Ring: "/sounds/mixkit-software-interface-start-2574.wav",
            Silent: null,
        };

        if (soundMap[selectedSound]) {
            const audio = new Audio(soundMap[selectedSound]);
            audio.play();
        }
    };

    const toggleNotifications = (event) => {
        event.stopPropagation();
        setShowNotifications((prev) => !prev);
        setShowSettingsDropdown(false);
        setShowProfileDropdown(false);
    };

    const muteTimeoutRef = useRef(null);
    const handleMuteDurationChange = (e) => {
        const duration = e.target.value;
        setMuteDuration(duration);

        if (muteTimeoutRef.current) clearTimeout(muteTimeoutRef.current);

        if (duration === "Until I Change It") {
            setNotificationsEnabled(false);
            return;
        }

        const durationMap = {
            "5 Minutes": 5 * 60 * 1000,
            "15 Minutes": 15 * 60 * 1000,
            "30 Minutes": 30 * 60 * 1000,
            "1 Hour": 60 * 60 * 1000,
            "3 Hours": 3 * 60 * 60 * 1000,
            "6 Hours": 6 * 60 * 60 * 1000,
            "12 Hours": 12 * 60 * 60 * 1000,
            "24 Hours": 24 * 60 * 60 * 1000,
            "3 Days": 3 * 24 * 60 * 60 * 1000,
            "7 Days": 7 * 24 * 60 * 60 * 1000,
            "14 Days": 14 * 24 * 60 * 60 * 1000,
            "1 Month": 30 * 24 * 60 * 60 * 1000,
        };

        if (durationMap[duration]) {
            setNotificationsEnabled(false);
            muteTimeoutRef.current = setTimeout(() => {
                setNotificationsEnabled(true);
                setMuteDuration("");
            }, durationMap[duration]);
        } else {
            setNotificationsEnabled(true);
        }
    };

    const handleNotificationClick = (index) => {
        setNotifications((prev) =>
            prev.map((notif, i) =>
                i === index ? { ...notif, read: true } : notif
            )
        );
    };
    
    const toggleDarkMode = () => {
        setDarkMode((prev) => {
          const newMode = !prev;
          document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
          localStorage.setItem('theme', newMode ? 'dark' : 'light');
          return newMode;
        });
      };
      return (
      <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar sidebarOpen={!isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <TopBarAdmin
        admin={admin}
        setAdmin={setAdmin} 
        profileRef={profileRef}
        dropdownRef={dropdownRef}
        bellRef={bellRef}
        notifications={notifications}
        showNotifications={showNotifications}
        showSettingsDropdown={showSettingsDropdown}
        setShowSettingsDropdown={setShowSettingsDropdown}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        toggleNotifications={toggleNotifications}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        markAsRead={markAsRead}
        deleteNotification={deleteNotification}
        handleViewDetails={handleViewDetails}
        clearAllNotifications={clearAllNotifications}
        expandSettings={expandSettings}
        setExpandSettings={setExpandSettings}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        notificationSound={notificationSound}
        handleSoundChange={handleSoundChange}
        muteDuration={muteDuration}
        handleMuteDurationChange={handleMuteDurationChange}
        isSidebarCollapsed={isSidebarCollapsed}
        handleLogout={handleLogout}
        toggleSidebar={toggleSidebar}
      />
      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.shifted : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;