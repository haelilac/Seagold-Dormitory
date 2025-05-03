import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaCog,
  FaEllipsisV,
  FaCheckCircle,
  FaTrash,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import styles from "./topbar-admin.module.css";
import ProfileUploader from './ProfileUploader';

const TopBarAdmin = ({
  admin,
  setAdmin,
  profileRef,
  dropdownRef,
  bellRef,
  notifications,
  showNotifications,
  showSettingsDropdown,
  setShowSettingsDropdown,
  showProfileDropdown,
  setShowProfileDropdown,
  toggleNotifications,
  activeDropdown,
  toggleDropdown,
  markAsRead,
  deleteNotification,
  handleViewDetails,
  clearAllNotifications,
  expandSettings,
  setExpandSettings,
  notificationsEnabled,
  setNotificationsEnabled,
  notificationSound,
  handleSoundChange,
  muteDuration,
  handleMuteDurationChange,
  isSidebarCollapsed,
  handleLogout,
  toggleSidebar,
  darkMode,
  toggleDarkMode,
}) => {

  const [showUpload, setShowUpload] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={`${styles.topBar} ${isSidebarCollapsed ? styles.shifted : ""}`}>
      <div className={`${styles.branding} ${isSidebarCollapsed ? styles.shifted : ""}`}>
        <h1>Seagold Dormitory Management System</h1>
      </div>

      <div className={styles.topBarRight}>
        <div
          className={styles.notificationContainer}
          ref={bellRef}
          onClick={toggleNotifications}
        >
          <div className={styles.bellWrapper}>
            <FaBell className={styles.notificationIcon} />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>{notifications.length}</span>
            )}
          </div>

          {showNotifications && (
              <div
                ref={dropdownRef}
                className={styles.notificationDropdown} onClick={(e) => e.stopPropagation()}>
              <h4 className={styles.notificationHeader}>
                Notifications
                <button
                  className={styles.settingsButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsDropdown((prev) => !prev);
                  }}
                >
                  <FaCog className={styles.settingsIcon}/>
                </button>
              </h4>
              <ul className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <li className={styles.noNotifications}>No Notifications</li>
                ) : (
                  notifications.map((note, index) => (
                  <li
                    key={index}
                    className={`${styles.notificationItem} ${note.read !== undefined ? (note.read ? styles.read : styles.unread) : ""}`}
                    onClick={() => handleViewDetails(note)}
                  >
                      <div className={styles.notificationContent}>
                        <span>{note.message}</span>
                        <small>{note.created_at} ({note.relative_time})</small>
                      </div>
                      <div className={styles.menuWrapper}>
                        <div className={styles.menuContainer}>
                          <button
                            className={styles.menuButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(e, index);
                            }}
                          >
                            <FaEllipsisV className={styles.menuIcon}/>
                          </button>
                          {activeDropdown === index && (
                            <div className={styles.dropdownMenu}>
                              <button
                                className={`${styles.dropdownItem} ${styles.markAsRead}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Mark as Read clicked for id:", note.id); // 🐛 Debug line
                                  markAsRead(note.id);
                                }}
                              >
                                <FaCheckCircle /> {note.read ? "Mark as Unread" : "Mark as Read"}
                              </button>
                              <button className={`${styles.dropdownItem} ${styles.deleteNotification}`} onClick={() => deleteNotification(note.id)}>
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
                <div className={styles.settingsDropdownWrapper}>
                  <div className={styles.settingsDropdown}>
                    <div
                      className={styles.settingCategory}
                      onClick={() => setExpandSettings((prev) => (prev === "notifications" ? null : "notifications"))}
                    >
                      <span>Notifications</span>
                      <span className={styles.arrow}>{expandSettings === "notifications" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "notifications" && (
                      <div className={styles.settingOptions}>
                        <label className={styles.enableNotificationsWrapper}>
                          <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                          <span className={styles.labelText}>Enable Notifications</span>
                        </label>
                      </div>
                    )}

                    <div className={styles.settingCategory} onClick={() => setExpandSettings((prev) => (prev === "sound" ? null : "sound"))}>
                      <span>Notification Sound</span>
                      <span className={`${styles.arrow} ${expandSettings === "sound" ? styles.rotated : ""}`}>{expandSettings === "sound" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "sound" && (
                      <div className={styles.settingOptions}>
                        <div className={styles.selectInputWrapper}>
                          <select className={styles.selectInput} value={notificationSound} onChange={handleSoundChange}>
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

                    <div className={styles.settingCategory} onClick={() => setExpandSettings((prev) => (prev === "mute" ? null : "mute"))}>
                      <span>Mute for</span>
                      <span className={styles.arrow}>{expandSettings === "mute" ? "▲" : "▼"}</span>
                    </div>
                    {expandSettings === "mute" && (
                      <div className={styles.settingOptions}>
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

                    <button className={styles.clearNotifBtn} onClick={clearAllNotifications}>
                      <FaTrash className={styles.icon} /> Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div
            className={styles.profileContainer}
            ref={profileRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileDropdown((prev) => !prev);
            }}
          >
          <img
            src={admin.profilePicture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"}
            alt="Admin Profile"
            className={styles.topBarProfilePicture}
            onClick={(e) => {
              e.stopPropagation();           // 🛑 prevent closing the dropdown
              setShowPreviewModal(true);     // ✅ open the preview modal
            }}
            style={{ cursor: "pointer" }}
          />
          <span className={styles.hideOnMobile}>{admin.name || "Admin"}</span>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
            <ul>
              <li>
                <img
                  src={admin.profilePicture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"}
                  alt="Admin Profile"
                  className={styles.dropdownProfilePicture}
                  onClick={() => setShowPreviewModal(true)}
                  style={{ cursor: "pointer" }}
                />
              </li>
              <li className={styles.userName} style={{ cursor: "pointer", color: "#4a954e" }}>
                {admin.name}
              </li>
              <li className={styles.profileEmail} style={{ fontSize: "0.85rem", color: "#00bf63" }}>
                {admin.email}
              </li>
              <li>
                  <button
                    className={styles.changePasswordBtn}
                    onClick={() => {
                      setShowChangePassModal(true);
                      setShowProfileDropdown(false);
                    }}
                  >
                    Change Password
                  </button>
                </li>
              <li>
                <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
              </li>
            </ul>
            {showChangePassModal && (
  <div className={styles.modalBackdrop} onClick={() => setShowChangePassModal(false)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Change Password</h3>

      <input
        type="password"
        placeholder="Current Password"
        value={passwordForm.current_password}
        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
        className={styles.inputField}
      />
      <input
        type="password"
        placeholder="New Password"
        value={passwordForm.new_password}
        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
        className={styles.inputField}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordForm.new_password_confirmation}
        onChange={(e) =>
          setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })
        }
      />

      {passwordFeedback && <p className={styles.feedbackMsg}>{passwordFeedback}</p>}

      <button
        className={styles.confirmBtn}
        onClick={async () => {
          setPasswordFeedback('');
          if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordFeedback("New passwords do not match.");
            return;
          }

          try {
            const res = await fetch('https://seagold-laravel-production.up.railway.app/api/change-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
              }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Password change failed.');

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
            {showPreviewModal && (
  <div className={styles.modalBackdrop} onClick={() => setShowPreviewModal(false)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Current Profile Picture</h3>
      <img
        src={admin.profilePicture || "https://res.cloudinary.com/seagold/image/upload/v1/profile/default.png"}
        alt="Preview"
        className={styles.previewImage}
      />
      <button
        className={styles.uploadTriggerBtn}
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
{showUploadModal && (
  <div className={styles.modalBackdrop} onClick={() => setShowUploadModal(false)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Upload New Profile Picture</h3>
      <ProfileUploader
        onUploadSuccess={(newUrl) => {
          setAdmin((prev) => ({ ...prev, profilePicture: newUrl }));
          setShowUploadModal(false);
        }}
      />
    </div>
  </div>
)}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBarAdmin;