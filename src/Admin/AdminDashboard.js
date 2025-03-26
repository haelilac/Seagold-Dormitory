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

const AdminDashboard = () => {
    const navigate = useNavigate(); // ✅ Initialize useNavigate
    const [admin, setAdmin] = useState({ name: "", email: "", profilePicture: "" });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null); // 🔹 Three-Dot Menu State
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSound, setNotificationSound] = useState("Default");
    const [muteDuration, setMuteDuration] = useState(""); // Options: "1 Hour", "24 Hours", etc.
  
    const clearAllNotifications = () => setNotifications([]);
    const markAllAsUnread = () => setNotifications((prev) => prev.map(n => ({ ...n, read: false })));
    const markAllAsRead = () => setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    const toggleSidebar = () => {setIsSidebarCollapsed((prev) => !prev); };

    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    {console.log("Dropdown State Inside Component:", showNotifications)}  
    // Fetch Admin Profile
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetch("https://seagold-laravel-production.up.railway.app/api/auth/user", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const user = await response.json();
                setAdmin({
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profile_picture
                        ? `https://seagold-laravel-production.up.railway.app/storage/profile/${user.profile_picture}`
                        : "https://seagold-laravel-production.up.railway.app/storage/profile/default-profile.png",
                });
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };
        fetchAdminData();
        //
    }, []);
    
    useEffect(() => {
        // Initialize Pusher for real-time updates
        const pusher = new Pusher("fea5d607d4b38ea09320", {
            cluster: "ap1",
            encrypted: true
        });
    
        // Subscribe to the 'notifications' channel
        const channel = pusher.subscribe("notifications");
    
        // Listen for 'new-notification' events and update state
        channel.bind("new-notification", function (data) {
            if (!notificationsEnabled) return;
            console.log("Received new notification: ", data); // Log the received data
            setNotifications((prev) => [
                { message: data.message, time: data.time, read: false },
                ...prev
            ]);
        });
    
        // Cleanup: Unsubscribe from Pusher when component unmounts
        return () => {
            pusher.unsubscribe("notifications");
        };
    }, [notificationsEnabled]);


       // Function to toggle dropdown for a specific notification
       const toggleDropdown = (event, index) => {
           event.stopPropagation(); // Prevents dropdown from closing immediately
           setActiveDropdown(activeDropdown === index ? null : index);
       };

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch("https://seagold-laravel-production.up.railway.app/apinotifications", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await response.json();
                setNotifications(data || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotifications();
    }, []);
  // Function to mark a single notification as read/unread
  const markAsRead = (index) => {
    setNotifications((prev) => 
        prev.map((notif, i) => 
            i === index ? { ...notif, read: !notif.read } : notif
        )
    );
    setActiveDropdown(null); // Close dropdown after clicking
};

// Function to delete a notification
const deleteNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
    setActiveDropdown(null); // Close dropdown after clicking
};

const [expandSettings, setExpandSettings] = useState(null);

const handleViewDetails = (notification) => {
    console.log("Notification clicked:", notification); // Debugging to see the notification object
 
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

    if (!targetRoute) {
        console.error("No route found for notification type:", notification.type);
        return;
    }

    console.log("Navigating to:", targetRoute); // ✅ Debugging

    navigate(targetRoute);

    console.log("Notification Data:", notification);

};
// ✅ Other functions go here (toggleNotifications, deleteNotification, etc.)
useEffect(() => {
    const handleClickOutside = (event) => {
        const notificationDropdown = document.querySelector(`.${styles.notificationDropdown}`);
        const settingsDropdown = document.querySelector(`.${styles.settingsDropdown}`);
        const threeDotsMenu = document.querySelector(`.${styles.dropdownMenu}`);
        const muteDropdown = document.querySelector(`.${styles.muteDropdown}`);
        
        // ✅ Detect if click is inside settingsDropdown or dropdown elements
        const isClickInsideSettings = settingsDropdown && settingsDropdown.contains(event.target);
        const isClickInsideNotification = notificationDropdown && notificationDropdown.contains(event.target);
        const isClickInsideMenu = threeDotsMenu && threeDotsMenu.contains(event.target);
        const isClickInsideMuteDropdown = muteDropdown && muteDropdown.contains(event.target);
        const isClickOnSelect = event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION' || event.target.closest('select');

        // Debug Logs - to check if it's detecting correctly
        console.log({
            isClickInsideSettings,
            isClickInsideNotification,
            isClickInsideMenu,
            isClickInsideMuteDropdown,
            isClickOnSelect
        });

        // ❌ Don't close if clicking inside any valid dropdown or select elements
        if (isClickInsideSettings || isClickInsideNotification || isClickInsideMenu || isClickInsideMuteDropdown || isClickOnSelect) {
            return; 
        }

        // ✅ Close if clicking outside all valid areas
        setShowNotifications(false);
        setShowSettingsDropdown(false);
        setActiveDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);

const getNotificationIcon = (type) => {
    // Define iconStyle inside the function
    const iconStyle = {
        color: "#FFD700", /* Vibrant Gold */
        marginRight: "10px",
        filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))", /* Adds glowing effect */
    };

    switch (type) {
        case "maintenance_request":
            return <FaTools style={iconStyle} />;
        case "payment_alert":
            return <FaMoneyBillWave style={iconStyle} />;
        case "event_notification":
            return <FaCalendarCheck style={iconStyle} />;
        case "tenant_update":
            return <FaUsers style={iconStyle} />;
        case "feedback_received":
            return <FaCommentDots style={iconStyle} />;
        default:
            return <FaBell style={iconStyle} />;
    }
};

    // Logout Function
    const handleLogout = (e) => {
        e.stopPropagation();
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/login";
        
    };   
    const handleSoundChange = (e) => {
        const selectedSound = e.target.value;
        setNotificationSound(selectedSound);
    
        // Define sound file paths (WAV format)
        const soundMap = {
            Default: "/sounds/mixkit-correct-answer-tone-2870.wav",
            Doorbell: "/sounds/mixkit-doorbell-tone-2864.wav",
            Beep: "/sounds/mixkit-gaming-lock-2848.wav",
            Brrt: "/sounds/mixkit-long-pop-2358.wav",
            Ring: "/sounds/mixkit-software-interface-start-2574.wav",
            Silent: null, // Silent means no sound to be played
        };
    
        if (soundMap[selectedSound]) {
            const audio = new Audio(soundMap[selectedSound]);
            audio.play();
        }
    };

    const toggleNotifications = (event) => {
        event.stopPropagation(); // ✅ Prevents event bubbling issues
        setShowNotifications((prev) => !prev); // ✅ Toggle notification dropdown
    
        // ✅ Ensure other dropdowns close when this opens
        setShowSettingsDropdown(false);
        setShowProfileDropdown(false);
    };
    const muteTimeoutRef = useRef(null);
    const handleMuteDurationChange = (e) => {
        const duration = e.target.value;
        setMuteDuration(duration);  // ✅ Update state with selected mute duration
      
    // Clear previous timeout if it exists
    if (muteTimeoutRef.current) {
        clearTimeout(muteTimeoutRef.current);
    }

        if (duration === "Until I Change It") {
            setNotificationsEnabled(false); // ✅ Disable notifications permanently
            return;  // Exit function to prevent auto re-enabling
        }
    
        if (duration) {
            setNotificationsEnabled(false); // ✅ Disable notifications
    
            // Convert duration into milliseconds
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
    
            // Set a timeout to re-enable notifications after the mute duration ends
              muteTimeoutRef.current = setTimeout(() => {
                setNotificationsEnabled(true);
                setMuteDuration(""); // Reset mute duration
            }, durationMap[duration]);

        } else {
            setNotificationsEnabled(true); // ✅ Enable notifications if "None" is selected
        }
    };  // ✅ Close function properly
    
    // ✅ Move this function OUTSIDE of handleMuteDurationChange
    const handleNotificationClick = (index) => {
        setNotifications((prev) =>
            prev.map((notif, i) =>
                i === index ? { ...notif, read: true } : notif
            )
        );
    };    

   return (
    <div className={styles.adminDashboard}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ""}`}>
                <div className={styles.sidebarHeader}>
                    <img
                        src="/SEAGOLD_LOGO.svg"
                        alt="Logo"
                        className={styles.sidebarLogo}
                        onClick={toggleSidebar}
                        style={{ cursor: 'pointer' }}
                    />
                    {!isSidebarCollapsed && (
                        <span className={styles.sidebarTitle}>Seagold Dormitory</span>
                    )}
                </div>

            {/* Line Separator */}
            <div className={styles.sidebarDivider}></div>
                <nav>
                    <ul>
                        <li><Link to="pending-applications"><FaClipboardList /> <span>Pending Applications</span></Link></li>
                        <li><Link to="unit-management"><FaBuilding /> <span>Unit Management</span></Link></li>
                        <li><Link to="manage-tenants"><FaUsers /> <span>Manage Tenants</span></Link></li>
                        <li><Link to="events-board"><FaCalendarCheck /> <span>Events Board</span></Link></li>
                        <li><Link to="payment-dashboard"><FaMoneyBillWave /> <span>Payment Dashboard</span></Link></li>
                        <li><Link to="maintenance-requests"><FaTools /> <span>Maintenance Requests</span></Link></li>
                        <li><Link to="gallery-admin"><FaCamera /> <span>Gallery Management</span></Link></li>
                        <li><Link to="feedback-admin"><FaCommentDots /> <span>Feedback</span></Link></li>
                    </ul>
                </nav>
            </aside>
            {/* Top Navigation */}
            <div className={`${styles.topBar} ${isSidebarCollapsed ? styles.shifted : ""}`}>
                <div className={styles.topRight}>

                    {/* 🔔 Notifications */}
                    <div className={styles.notificationContainer} ref={dropdownRef} onClick={toggleNotifications}>
                        <div className={styles.bellWrapper}>
                            <FaBell className={styles.notificationIcon} />
                            {notifications.length > 0 && (
                                <span className={styles.notificationBadge}>
                                    {notifications.length}
                                </span>
                            )}
                        </div>
                        
                         {/* Dropdown Menu */}
                         {showNotifications && (
                            <div className={styles.notificationDropdown}>
                                <h4 className={styles.notificationHeader}>Notifications
                                <button 
                     className={styles.settingsButton} 
                    onClick={(e) => {
                    e.stopPropagation(); // ✅ Prevents notification dropdown from closing
                setShowSettingsDropdown((prev) => !prev);
                }}
            >
    <FaCog />
</button>
 </h4>
 <ul className={styles.notificationList}>
    {notifications.length === 0 ? (
        <li className={styles.noNotifications}>No Notifications</li>
    ) : notifications.map((note, index) => (
        <li 
            key={index} 
            className={`${styles.notificationItem} ${note.read ? styles.read : styles.unread}`}
            onClick={() => handleViewDetails(note)} // ✅ Correctly placed click event
        >
            <div className={styles.notificationContent}>
                <span>{note.message}</span>
                <small>{note.time}</small>
            </div>

            {/* Three Dots Menu (⋮) */}
    <div className={styles.menuContainer}>
        <button 
    className={styles.menuButton} 
    onClick={(e) => {
        e.stopPropagation(); // ✅ Prevents dropdown from closing
        toggleDropdown(e, index);
        }}
        >
         <FaEllipsisV />
        </button>

        {activeDropdown === index && (
                    <div className={styles.dropdownMenu}>
                        <button 
                            className={`${styles.dropdownItem} ${styles.markAsRead}`} 
                            onClick={() => markAsRead(index)}
                        >
                            <FaCheckCircle /> {note.read ? "Mark as Unread" : "Mark as Read"}
                        </button>

                        <button 
                            className={`${styles.dropdownItem} ${styles.deleteNotification}`} 
                            onClick={() => deleteNotification(index)}
                        >
                            <FaTrash /> Delete Notification
                        </button>

                        <button
                            className={`${styles.dropdownItem} ${styles.viewDetails}`} 
                            onClick={() => handleViewDetails(note)}
                        >
                            <FaInfoCircle /> View Details
                        </button>
                    </div>
                )}
            </div>
        </li>
    ))}
</ul>  

{showSettingsDropdown && (
    <div className={styles.settingsDropdown}>
        {/* 🔹 Enable/Disable Notifications Section */}
        <div 
            className={styles.settingCategory} 
            onClick={() => setExpandSettings(prev => prev === 'notifications' ? null : 'notifications')}
        >
            <span>Notifications</span>
            <span className={styles.arrow}>{expandSettings === 'notifications' ? '▲' : '▼'}</span>
        </div>

        {expandSettings === 'notifications' && (
            <div className={styles.settingOptions}>
                <label className={styles.enableNotificationsWrapper}>
                    <input 
                        type="checkbox" 
                        checked={notificationsEnabled} 
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                    />
                    <span className={styles.labelText}>Enable Notifications</span>
                </label>
            </div>
        )}

{/* 🔹 Notification Sound */}
<div 
    className={styles.settingCategory} 
    onClick={() => setExpandSettings(prev => prev === 'sound' ? null : 'sound')}
>
    <span>Notification Sound</span>
    <span className={`${styles.arrow} ${expandSettings === 'sound' ? styles.rotated : ''}`}></span>
</div>

{expandSettings === 'sound' && (
    <div className={styles.settingOptions}>
        <div className={styles.selectInputWrapper}>
        <select 
           className={styles.selectInput} 
           value={notificationSound} 
           onChange={handleSoundChange}
                >

                <option value="Default">Default</option>
                <option value="Doorbell">Chime</option>
                <option value="Beep">Beep</option>
                <option value="Silent">Silent</option>
                <option value="Brrt">Brrt</option>
                <option value="Ring">Ring</option>
            </select>
        </div>
    </div>
)}


  {/* Mute Notifications */}
<div className={styles.settingCategory} onClick={() => setExpandSettings(prev => prev === 'mute' ? null : 'mute')}>
    <span>Mute for</span>
    <span className={styles.arrow}>{expandSettings === 'mute' ? '▲' : '▼'}</span>
</div>

{expandSettings === 'mute' && (
    <div className={styles.settingOptions}>
     
        <select 
            value={muteDuration} 
            onChange={(e) => handleMuteDurationChange(e)}
        >
            <option value="">None</option>
            <option value="5 Minutes">5 Minutes</option>
            <option value="15 Minutes">15 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="1 Hour">1 Hour</option>
            <option value="3 Hours">3 Hours</option>
            <option value="6 Hours">6 Hours</option>
            <option value="12 Hours">12 Hours</option>
            <option value="24 Hours">24 Hours</option>
            <option value="3 Days">3 Days</option>
            <option value="7 Days">7 Days</option>
            <option value="14 Days">14 Days</option>
            <option value="1 Month">1 Month</option>
            <option value="Until I Change It">Until I Change It</option>  {/* Added Option */}
        </select>
    </div>
)}

        {/* Clear All Button */}
        <button className={styles.clearNotifBtn} onClick={clearAllNotifications}>
            <FaTrash className={styles.icon} /> Clear All
        </button>
    </div>

                        )}

                    </div>
                        )}
                    </div>
                    {/* Profile */}
                    <div className={styles.profileContainer} ref={profileRef} onClick={() => setShowProfileDropdown((prev) => !prev)}>
                        <img src="https://seagold-laravel-production.up.railway.app/storage/profile/admin.png" alt="Admin Profile" className={styles.profilePicture} />
                        <span>{admin.name || "Admin"}</span>

                        {showProfileDropdown && (
                            <div className={styles.profileDropdown}>
                                <ul>
                                    <li>
                                        <img src="https://seagold-laravel-production.up.railway.app/storage/profile/admin.png" alt="Admin Profile" className={styles.dropdownProfilePicture} />
                                    </li>
                                    <span>{admin.name || "Admin"}</span>
                                    <span className={styles.profileEmail}>{admin.email}</span>
                                    <li>
                                        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
      {/* Main Content */}
      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.shifted : ""}`}>
                <Outlet />
            </main>
      </div>
  );
};

export default AdminDashboard;