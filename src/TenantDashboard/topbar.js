import React, { useState, useEffect } from 'react';
import {
  FaBell, FaBars, FaEllipsisV, FaMoon, FaSun, FaCheckCircle, FaTrash, FaCog
} from 'react-icons/fa';
import styles from './sidebar.module.css';
import topbarStyles from './Topbar-tenant.module.css';
import logo from '../assets/seagoldlogo.png';
import ProfileUploader from '../components/ProfileUploader';
import { getAuthToken } from '../utils/auth';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const TopBar = ({

  handleViewDetails,
  clearAllNotifications,
  notifications,
  toggleNotifications,
  sidebarOpen,
  toggleSidebar,
  userData,
  setUserData,
  filteredNotifications,
  showNotifications,
  setShowNotifications,
  showProfileDropdown,
  setShowProfileDropdown,
  darkMode,
  toggleDarkMode,
  handleLogout,
  dropdownRef,
  bellRef,
  isSidebarCollapsed,
  profileDropdownRef,
  setNotifications,
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [expandSettings, setExpandSettings] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState("Default");
  const [muteDuration, setMuteDuration] = useState("");

  const soundMap = {
    Default: "/sounds/mixkit-correct-answer-tone-2870.wav",
    Doorbell: "/sounds/mixkit-doorbell-tone-2864.wav",
    Beep: "/sounds/mixkit-gaming-lock-2848.wav",
    Brrt: "/sounds/mixkit-long-pop-2358.wav",
    Ring: "/sounds/mixkit-software-interface-start-2574.wav",
    Silent: null,
  };

  // Echo Realtime Notifications
    useEffect(() => {
      if (!userData?.id) return;
    
      window.Pusher = Pusher;
      const echo = new Echo({
        broadcaster: 'pusher',
        key: '865f456f0873a587bc36',
        cluster: 'ap3',
        forceTLS: true,
        authEndpoint: 'https://seagold-laravel-production.up.railway.app/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      });
    
      // ✅ DEBUG: Confirm Pusher connection
      window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected!');
      });
    
      echo.private(`tenant.notifications.${userData.id}`)
      .listen('.tenant-notification', async (event) => {
        // Optional sound
        if (notificationsEnabled && soundMap[notificationSound]) {
          try {
            const audio = new Audio(soundMap[notificationSound]);
            await audio.play();
          } catch (err) {
            console.warn("Sound playback failed:", err);
          }
        }
    
        // Push new notification to top with extra fields
        const newNotification = {
          id: event.id,
          message: event.message,
          title: event.title,
          type: event.type,
          time: event.time, // optional if used
          read: false,
          relative_time: 'Just now',
          created_at: new Date().toLocaleString(),
        };
    
        setNotifications(prev => {
          const exists = prev.some(n => n.id === newNotification.id);
          return exists ? prev : [newNotification, ...prev];
        });

      });
      return () => echo.disconnect();
    }, [userData, notificationsEnabled, notificationSound]);

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const markAsRead = async (id) => {
    await fetch(`https://seagold-laravel-production.up.railway.app/api/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
  
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const deleteNotification = async (id) => {
    await fetch(`https://seagold-laravel-production.up.railway.app/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
  
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSoundChange = (e) => {
    const selected = e.target.value;
    setNotificationSound(selected);
    if (soundMap[selected]) {
      new Audio(soundMap[selected]).play();
    }
  };

  const handleMuteDurationChange = (e) => {
    const value = e.target.value;
    setMuteDuration(value);
    if (value === "Until I Change It") {
      setNotificationsEnabled(false);
      return;
    }
    const map = {
      "5 Minutes": 5 * 60 * 1000,
      "15 Minutes": 15 * 60 * 1000,
      "1 Hour": 60 * 60 * 1000,
    };
    if (map[value]) {
      setNotificationsEnabled(false);
      setTimeout(() => setNotificationsEnabled(true), map[value]);
    }
  };

  return (
    <div className={`${topbarStyles.topBar} ${isSidebarCollapsed ? topbarStyles.shifted : ""}`}>
      <div className={`${topbarStyles.branding} ${sidebarOpen ? topbarStyles.shifted : ""}`}>
        <h1>Welcome, {userData?.name?.split(' ')[0] || 'User'}</h1>
      </div>


          <div className={topbarStyles.topBarRight}>
        <div
          className={topbarStyles.notificationContainer}
          ref={bellRef}
          onClick={toggleNotifications}
        >
          <div className={topbarStyles.bellWrapper}>
            <FaBell className={topbarStyles.notificationIcon} />
            {notifications.length > 0 && (
              <span className={topbarStyles.notificationBadge}>{notifications.length}</span>
            )}
          </div>

          {showNotifications && (
              <div
                ref={dropdownRef}
                className={topbarStyles.notificationDropdown} onClick={(e) => e.stopPropagation()}>
              <h4 className={topbarStyles.notificationHeader}>
                Notifications
                <button
                  className={topbarStyles.settingsButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsDropdown((prev) => !prev);
                  }}
                >
                  <FaCog className={topbarStyles.settingsIcon}/>
                </button>
              </h4>
              <ul className={topbarStyles.notificationList}>
                {notifications.length === 0 ? (
                  <li className={topbarStyles.noNotifications}>No Notifications</li>
                ) : (
                  notifications.map((note, index) => (
                  <li
                    key={index}
                    className={`${topbarStyles.notificationItem} ${note.read !== undefined ? (note.read ? topbarStyles.read : topbarStyles.unread) : ""}`}
                    onClick={() => handleViewDetails(note)}
                  >
                      <div className={topbarStyles.notificationContent}>
                        <span>{note.message}</span>
                        <small>{note.created_at} ({note.relative_time})</small>
                      </div>
                      <div className={topbarStyles.menuWrapper}>
                        <div className={topbarStyles.menuContainer}>
                          <button
                            className={topbarStyles.menuButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(e, index);
                            }}
                          >
                            <FaEllipsisV className={topbarStyles.menuIcon}/>
                          </button>
                          {activeDropdown === index && (
                            <div className={topbarStyles.dropdownMenu}>
                              <button
                                className={`${topbarStyles.dropdownItem} ${topbarStyles.markAsRead}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Mark as Read clicked for id:", note.id); // 🐛 Debug line
                                  markAsRead(note.id);
                                }}
                              >
                                <FaCheckCircle /> {note.read ? "Mark as Unread" : "Mark as Read"}
                              </button>
                              <button className={`${topbarStyles.dropdownItem} ${topbarStyles.deleteNotification}`} onClick={() => deleteNotification(note.id)}>
                                <FaTrash /> Delete Notification
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {showSettingsDropdown && (
                <div className={topbarStyles.settingsDropdownWrapper}>
                  <div className={topbarStyles.settingsDropdown}>
                    <div
                      className={topbarStyles.settingCategory}
                      onClick={() => setExpandSettings((prev) => (prev === "notifications" ? null : "notifications"))}
                    >
                      <span>Notifications</span>
                      <span className={topbarStyles.arrow}>{expandSettings === "notifications" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "notifications" && (
                      <div className={topbarStyles.settingOptions}>
                        <label className={topbarStyles.enableNotificationsWrapper}>
                          <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                          <span className={topbarStyles.labelText}>Enable Notifications</span>
                        </label>
                      </div>
                    )}

                    <div className={topbarStyles.settingCategory} onClick={() => setExpandSettings((prev) => (prev === "sound" ? null : "sound"))}>
                      <span>Notification Sound</span>
                      <span className={`${topbarStyles.arrow} ${expandSettings === "sound" ? topbarStyles.rotated : ""}`}>{expandSettings === "sound" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "sound" && (
                      <div className={topbarStyles.settingOptions}>
                        <div className={topbarStyles.selectInputWrapper}>
                          <select className={topbarStyles.selectInput} value={notificationSound} onChange={handleSoundChange}>
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

                    <div className={topbarStyles.settingCategory} onClick={() => setExpandSettings((prev) => (prev === "mute" ? null : "mute"))}>
                      <span>Mute for</span>
                      <span className={topbarStyles.arrow}>{expandSettings === "mute" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "mute" && (
                      <div className={topbarStyles.settingOptions}>
                        <select value={muteDuration} onChange={handleMuteDurationChange}>
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
                          <option value="Until I Change It">Until I Change It</option>
                        </select>
                      </div>
                    )}

                    <button className={topbarStyles.clearNotifBtn} onClick={clearAllNotifications}>
                      <FaTrash className={topbarStyles.icon} /> Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div
          className={topbarStyles.topBarProfile}
          ref={profileDropdownRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileDropdown((prev) => !prev);
          }}
        >
          <img src={userData?.profile_picture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"} alt="User" className={topbarStyles.profilePicture} />
          <span>{userData?.name || 'User'}</span>

          {showProfileDropdown && (
            <div className={topbarStyles.profileDropdown}>
              <ul>
                <li>
                  <img
                    src={userData?.profile_picture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"}
                    alt="User"
                    className={topbarStyles.dropdownProfilePicture}
                    onClick={() => setShowPreviewModal(true)}
                  />
                </li>
                <li className={topbarStyles.userName} style={{ cursor: "pointer", color: "#4a954e" }}>
                  {userData?.name}
                </li>
                <li className={topbarStyles.profileEmail} style={{ fontSize: "0.85rem", color: "#00bf63" }}>
                  {userData?.email}
                </li>
                <li>
                  <button className={topbarStyles.changePasswordBtn} onClick={() => setShowChangePassModal(true)}>
                    Change Password
                  </button>
                </li>
                <li>
                  <button className={topbarStyles.logoutButton} onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* 🔍 Preview Modal */}
          {showPreviewModal && (
            <div className={topbarStyles.modalBackdrop} onClick={() => setShowPreviewModal(false)}>
              <div className={topbarStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>Current Profile Picture</h3>
                <img
                  src={userData?.profile_picture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"}
                  alt="Preview"
                  className={topbarStyles.previewImage}
                />
                <button
                  className={topbarStyles.uploadTriggerBtn}
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowUploadModal(true);
                  }}
                >
                  Change Picture
                </button>
              </div>
            </div>
          )}

          {/* 📤 Upload Modal */}
          {showUploadModal && (
            <div className={topbarStyles.modalBackdrop} onClick={() => setShowUploadModal(false)}>
              <div className={topbarStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>Upload New Profile Picture</h3>
                <ProfileUploader
                  onUploadSuccess={(newUrl) => {
                    setUserData((prev) => ({ ...prev, profile_picture: newUrl }));
                    setShowUploadModal(false);
                  }}
                />
              </div>
            </div>
          )}
          {/* 🔐 Change Password Modal */}
          {showChangePassModal && (
  <div className={topbarStyles.modalBackdrop} onClick={() => setShowChangePassModal(false)}>
    <div className={topbarStyles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Change Password</h3>

      <input
        type="password"
        placeholder="Current Password"
        value={passwordForm.current_password}
        onChange={(e) =>
          setPasswordForm({ ...passwordForm, current_password: e.target.value })
        }
        className={topbarStyles.inputField}
      />
      <input
        type="password"
        placeholder="New Password"
        value={passwordForm.new_password}
        onChange={(e) =>
          setPasswordForm({ ...passwordForm, new_password: e.target.value })
        }
        className={topbarStyles.inputField}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordForm.new_password_confirmation}
        onChange={(e) =>
          setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })
        }
        className={topbarStyles.inputField}
      />

      {passwordFeedback && <p className={topbarStyles.feedbackMsg}>{passwordFeedback}</p>}

      <button
        className={topbarStyles.confirmBtn}
        onClick={async () => {
          setPasswordFeedback("");
          if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordFeedback("New passwords do not match.");
            return;
          }

          try {
            const res = await fetch(
              "https://seagold-laravel-production.up.railway.app/api/change-password",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify(passwordForm),
              }
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Password change failed.");

            setPasswordFeedback("Password changed successfully!");
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });

          } catch (err) {
            setPasswordFeedback(err.message);
          }
        }}
      >
        Confirm Change
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    );
  };
  
          export default TopBar;