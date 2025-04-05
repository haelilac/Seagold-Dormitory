import React from 'react';
import {
  FaBell, FaBars, FaEllipsisV, FaMoon, FaSun,
} from 'react-icons/fa';
import styles from '../TenantDashboard/TenantDashboard.module.css';


const TopBar = ({
  sidebarOpen,
  toggleSidebar,
  userData,
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
  profileDropdownRef,
  setNotifications
}) => {
  return (
    <div className={`${styles.topBar} ${sidebarOpen ? styles.shifted : ''}`}>
<div className={`${styles.branding} ${sidebarOpen ? styles.shifted : ''}`}>
<button className={styles.hamburgerButton} onClick={toggleSidebar}>
  <FaBars className={styles.hamburgerIcon} />
</button>
  <h1>Seagold Dormitory</h1>
</div>

      <div className={styles.topBarRight}>
        <div className={styles.notificationContainer} ref={dropdownRef}>
          <FaBell
            ref={bellRef}
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
                  <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
                    {darkMode ? <><FaSun /> Light Mode</> : <><FaMoon /> Dark Mode</>}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
