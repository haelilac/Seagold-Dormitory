import React, { useState, useEffect } from 'react';
import {
  FaBell, FaBars, FaEllipsisV, FaMoon, FaSun, FaCheckCircle, FaTrash, FaCog
} from 'react-icons/fa';
import styles from './sidebar.module.css';
import './Topbar-tenant.module.css';
import logo from '../assets/seagoldlogo.png';
import ProfileUploader from '../components/ProfileUploader';
import { getAuthToken } from '../utils/auth';

const TopBar = ({
  sidebarOpen,
  toggleSidebar,
  userData,
  setUserData,
  filteredNotifications,
  showNotifications,
  setShowNotifications,
  showProfileDropdown,
  setShowProfileDropdown,
  handleMarkAllAsRead,
  handleDeleteNotification,
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

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  const handleSoundChange = (e) => {
    const selected = e.target.value;
    setNotificationSound(selected);
    const soundMap = {
      Default: "/sounds/mixkit-correct-answer-tone-2870.wav",
      Doorbell: "/sounds/mixkit-doorbell-tone-2864.wav",
      Beep: "/sounds/mixkit-gaming-lock-2848.wav",
      Brrt: "/sounds/mixkit-long-pop-2358.wav",
      Ring: "/sounds/mixkit-software-interface-start-2574.wav",
      Silent: null,
    };
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
    <div className={`${styles.topBar} ${isSidebarCollapsed ? styles.shifted : ""}`}>
      <div className={`${styles.branding} ${sidebarOpen ? styles.shifted : ""}`}>
        <h1>Seagold Dormitory</h1>
      </div>

      <div className={styles.topBarRight}>
        {/* 🔔 Notifications */}
        <div className={styles.notificationContainer} ref={dropdownRef} onClick={() => setShowNotifications((prev) => !prev)}>
          <div className={styles.bellWrapper}>
            <FaBell className={styles.notificationIcon} ref={bellRef} />
            {filteredNotifications.filter(n => !n.read).length > 0 && (
              <span className={styles.notificationBadge}>
                {filteredNotifications.filter(n => !n.read).length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className={styles.notificationDropdown} onClick={(e) => e.stopPropagation()}>
              <h4 className={styles.notificationHeader}>
                Notifications
                <button className={styles.settingsButton} onClick={(e) => { e.stopPropagation(); setShowSettingsDropdown(prev => !prev); }}>
                  <FaCog />
                </button>
              </h4>
              <ul className={styles.notificationList}>
                {filteredNotifications.length === 0 ? (
                  <li className={styles.noNotifications}>No Notifications</li>
                ) : (
                  filteredNotifications.map((note, i) => (
                    <li key={i} className={note.read ? styles.read : styles.unread}>
                      <div className={styles.notificationContent}>
                        <span>{note.message}</span>
                        <small>{note.created_at}</small>
                      </div>
                      <div className={styles.menuWrapper}>
                        <button className={styles.menuButton} onClick={(e) => toggleDropdown(e, i)}>
                          <FaEllipsisV />
                        </button>
                        {activeDropdown === i && (
                          <div className={styles.dropdownMenu}>
                            <button className={styles.dropdownItem} onClick={() => {
                              setNotifications(prev => prev.map((n, idx) =>
                                idx === i ? { ...n, read: !n.read } : n));
                            }}>
                              <FaCheckCircle /> {note.read ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                            <button className={styles.dropdownItem} onClick={() => handleDeleteNotification(i)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {showSettingsDropdown && (
                <div className={styles.settingsDropdownWrapper}>
                  <div className={styles.settingsDropdown}>
                    <div className={styles.settingCategory} onClick={() => setExpandSettings(expandSettings === 'notifications' ? null : 'notifications')}>
                      <span>Notifications</span>
                      <span className={styles.arrow}>{expandSettings === 'notifications' ? '▲' : '▼'}</span>
                    </div>
                    {expandSettings === 'notifications' && (
                      <label>
                        <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                        Enable Notifications
                      </label>
                    )}
                    <div className={styles.settingCategory} onClick={() => setExpandSettings(expandSettings === 'sound' ? null : 'sound')}>
                      <span>Notification Sound</span>
                      <span className={styles.arrow}>{expandSettings === 'sound' ? '▲' : '▼'}</span>
                    </div>
                    {expandSettings === 'sound' && (
                      <select value={notificationSound} onChange={handleSoundChange}>
                        <option>Default</option>
                        <option>Doorbell</option>
                        <option>Beep</option>
                        <option>Brrt</option>
                        <option>Ring</option>
                        <option>Silent</option>
                      </select>
                    )}
                    <div className={styles.settingCategory} onClick={() => setExpandSettings(expandSettings === 'mute' ? null : 'mute')}>
                      <span>Mute for</span>
                      <span className={styles.arrow}>{expandSettings === 'mute' ? '▲' : '▼'}</span>
                    </div>
                    {expandSettings === 'mute' && (
                      <select value={muteDuration} onChange={handleMuteDurationChange}>
                        <option value="">None</option>
                        <option>5 Minutes</option>
                        <option>15 Minutes</option>
                        <option>1 Hour</option>
                        <option>Until I Change It</option>
                      </select>
                    )}
                    <button className={styles.clearNotifBtn} onClick={() => setNotifications([])}>
                      <FaTrash /> Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div
          className={styles.topBarProfile}
          ref={profileDropdownRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileDropdown((prev) => !prev);
          }}
        >
          <img src={userData?.profile_picture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"} alt="User" className={styles.profilePicture} />
          <span>{userData?.name || 'User'}</span>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <ul>
                <li className={styles.userName}>{userData?.name}</li>
                <li className={styles.profileEmail}>{userData?.email}</li>
                <li><button onClick={handleLogout}>Logout</button></li>
                <li>
                  <button className={`${styles.darkModeToggle} ${darkMode ? styles.lightModeBtn : styles.darkModeBtn}`} onClick={toggleDarkMode}>
                    {darkMode ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowChangePassModal(true)}>Change Password</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 🔐 Change Password Modal */}
      {showChangePassModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowChangePassModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <input type="password" placeholder="Current Password" value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
            <input type="password" placeholder="New Password" value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
            <input type="password" placeholder="Confirm New Password" value={passwordForm.new_password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} />
            {passwordFeedback && <p className={styles.feedbackMsg}>{passwordFeedback}</p>}
            <button onClick={async () => {
              setPasswordFeedback('');
              if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
                setPasswordFeedback("Passwords do not match.");
                return;
              }
              try {
                const res = await fetch('https://seagold-laravel-production.up.railway.app/api/change-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                  },
                  body: JSON.stringify(passwordForm),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Password change failed.');
                setPasswordFeedback("Password changed successfully!");
              } catch (err) {
                setPasswordFeedback(err.message);
              }
            }}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;