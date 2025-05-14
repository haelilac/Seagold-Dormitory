  import React, { useState, useEffect } from 'react';
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';
  import './AdminTourBookings.css';
  import { getAuthToken } from "../utils/auth";
  import { useDataCache } from '../contexts/DataContext';

  const AdminTourBookings = () => {
      const [bookings, setBookings] = useState([]);
      const [loading, setLoading] = useState(true);
      const [availability, setAvailability] = useState([]);
      const [selectedDate, setSelectedDate] = useState(new Date());
      const [timeSlots, setTimeSlots] = useState([]);
      const [message, setMessage] = useState('');
      const { getCachedData, updateCache } = useDataCache();
      const [searchQuery, setSearchQuery] = useState('');

      const predefinedTimes = [
          '09:00 AM',
          '10:00 AM',
          '11:00 AM',
          '12:00 PM',
          '01:00 PM',
          '02:00 PM',
          '03:00 PM',
          '04:00 PM',
      ];
    useEffect(() => {
      document.body.style.overflow = "auto"; // force scroll back on
    }, []);

      const handleToggleSlot = async (time, status) => {
        try {
          const formattedDate = selectedDate.toISOString().split('T')[0];
          const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-availability/toggle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({
              date: formattedDate,
              time,
              status,
            }),
          });
      
          if (response.ok) {
            setMessage(`Slot ${time} marked as ${status}`);
      
            // ✅ Manually update availability state
            setAvailability((prev) => {
              const updated = [...prev];
              const index = updated.findIndex((slot) => slot.time === time);
      
              if (index !== -1) {
                updated[index] = { ...updated[index], status };
              } else {
                updated.push({ time, status }); // if not found, add it
              }
      
              return updated;
            });
          } else {
            throw new Error("Failed to update slot");
          }
        } catch (err) {
          console.error("Error updating slot:", err);
          setMessage("Error updating slot");
        }
      };

        const handleBulkToggle = async (status) => {
          try {
            const formattedDate = selectedDate.toISOString().split("T")[0];
        
            for (const time of predefinedTimes) {
              await fetch("https://seagold-laravel-production.up.railway.app/api/tour-availability/toggle", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({
                  date: formattedDate,
                  time,
                  status,
                }),
              });
            }
        
            setMessage(`All slots marked as ${status}`);
            
            // Refresh the availability UI
            fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${formattedDate}`)
              .then((res) => res.json())
              .then((data) => setAvailability(data.slots))
              .catch((err) => {
                console.error("Error fetching updated availability:", err);
                setAvailability([]);
              });
          } catch (err) {
            console.error("Bulk update error:", err);
            setMessage("Failed to update all slots.");
          }
        };

        const fetchBookings = async () => {
          const cachedBookings = getCachedData('tour_bookings');
          if (cachedBookings) {
              setBookings(cachedBookings);
              setLoading(false); // ✅ Add this
              return;
          }
      
          try {
              const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-bookings', {
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
              });
              const data = await response.json();
      
              console.log('Fetched Bookings:', data.bookings);
              setBookings(data.bookings || []);
              updateCache('tour_bookings', data.bookings || []);
          } catch (error) {
              console.error('Error fetching bookings:', error);
          } finally {
              setLoading(false); // ✅ Always stop loading regardless of success or error
          }
      };
      useEffect(() => {
        fetchBookings();
    }, []);

      const handleConfirmBooking = async (id) => {
          try {
              const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/bookings/confirm/${id}`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
              });

              if (response.ok) {
                  alert('Booking confirmed successfully!');
                  await refreshBookingsCache();
              } else {
                  alert('Failed to confirm booking.');
              }
          } catch (error) {
              console.error('Error confirming booking:', error);
          }
      };

      const handleCancelBooking = async (id) => {
          try {
              const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/bookings/cancel/${id}`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
              });

              if (response.ok) {
                  alert('Booking canceled successfully!');
                  await refreshBookingsCache();
              } else {
                  alert('Failed to cancel booking.');
              }
          } catch (error) {
              console.error('Error canceling booking:', error);
          }
      };

      // Helper function to refresh cache
      const refreshBookingsCache = async () => {
          try {
              const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-bookings', {
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
              });
              const data = await response.json();
              setBookings(data.bookings || []);
              updateCache('tour_bookings', data.bookings || []);  // Update cache
          } catch (err) {
              console.error('Error refreshing bookings cache:', err);
          }
      };

      
      const handleSearch = (e) => {
          setSearchQuery(e.target.value);
      };

      const filteredBookings = bookings.filter((booking) =>
          booking.name ? booking.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );

      if (loading) return <div className="booking-spinner"></div>;
      return (
          <div className="admin-tour-bookings">
              <h2>Tour Bookings</h2>
      <div className="calendar-availability-section">
        <h3>Set Availability</h3>
        <p>Choose a date and toggle available time slots:</p>

        {/* Simple date input (or replace with a fancier calendar later) */}
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => {
            const date = new Date(e.target.value);
            setSelectedDate(date);
            fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${e.target.value}`)
              .then((res) => res.json())
              .then((data) => setAvailability(data.slots))
              .catch((err) => {
                console.error("Error fetching availability:", err);
                setAvailability([]);
              });
          }}
        />
      <div className="bulk-actions-container">
        <div className="bulk-buttons">
          <button 
            onClick={() => handleBulkToggle("available")}
            className="bulk-available-btn"
          >
            <span className="color-dot available"></span>

          </button>
          <button 
            className="mark-unavailable-btn" 
            onClick={() => handleBulkToggle("unavailable")}
          >
            <span className="color-dot unavailable"></span>
          </button>
        </div>
        <div className="compact-legend">
          <span className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </span>
          <span className="legend-item">
            <span className="legend-dot unavailable"></span>
            <span>Unavailable</span>
          </span>
        </div>
      </div>
        {/* Render time slots with toggle buttons */}
        <div className="time-slots-container">
          {predefinedTimes.map((time) => {
            const slot = availability.find((s) => s.time === time);
            const currentStatus = slot ? slot.status : "unavailable";

            if (loading) return <div className="booking-spinner"></div>;
            return (
              <div key={time} className="time-slot-item">
                <span>{time}</span>
                <button
                  className={`toggle-btn ${currentStatus === "available" ? "available" : "unavailable"}`}
                  onClick={() =>
                    handleToggleSlot(time, currentStatus === "available" ? "unavailable" : "available")
                  }
                >
                  {currentStatus === "available" ? "" : ""}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="calendar-availability-section">
                  <h3>Existing Bookings </h3>
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search by guest name"
                  />
                  <table className="bookings-table">
                      <thead>
                          <tr>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Name</th>
                              <th>Status</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredBookings.length > 0 ? (
                              filteredBookings.map((booking) => (
                                  <tr key={booking.id}>
                                      <td>{booking.date || 'N/A'}</td>
                                      <td>{booking.time || 'N/A'}</td>
                                      <td>{booking.name || 'Unknown'}</td>
                                      <td>{booking.status || 'Pending'}</td>
                                      <td>
                                          <button onClick={() => handleConfirmBooking(booking.id)}>Confirm</button>
                                          <button onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                                      </td>

                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan="6">No bookings found</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
              </div>
          );
      };

      export default AdminTourBookings;
