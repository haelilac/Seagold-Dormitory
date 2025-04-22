import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminTourBookings.css';
import { getAuthToken } from "../utils/auth";

const AdminTourBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState([]);
    const [message, setMessage] = useState('');
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
    useEffect(() => {
        fetch('https://seagold-laravel-production.up.railway.app/api/tour-bookings')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched Bookings:', data.bookings);
                setBookings(data.bookings || []);
            })
            .catch((error) => console.error('Error fetching bookings:', error));
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
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-bookings', {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const data = await response.json();
    
            console.log('Fetched Bookings:', data.bookings); // Debugging
            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };
    
    useEffect(() => {
        fetchBookings(); // Call fetchBookings to load bookings
    }, []);
    
    const handleConfirmBooking = async (id) => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/bookings/confirm/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
    
            if (response.ok) {
                alert('Booking confirmed successfully!');
                fetchBookings(); // Refresh bookings data
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
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
    
            if (response.ok) {
                alert('Booking canceled successfully!');
                fetchBookings(); // Refresh bookings data
    
                // Refresh available slots for the selected date if applicable
                if (selectedDate) {
                    fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${selectedDate}`)
                        .then((res) => res.json())
                        .then((data) => setAvailability(data.slots))
                        .catch((error) => console.error('Error fetching updated slots:', error));
                }
            } else {
                alert('Failed to cancel booking.');
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
        }
    };
    
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.name ? booking.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

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
<div className="bulk-buttons">
  <button onClick={() => handleBulkToggle("available")}>Mark All Available</button>
  <button onClick={() => handleBulkToggle("unavailable")}>Mark All Unavailable</button>
</div>
  {/* Render time slots with toggle buttons */}
  <div className="time-slots-container">
    {predefinedTimes.map((time) => {
      const slot = availability.find((s) => s.time === time);
      const currentStatus = slot ? slot.status : "unavailable";

      return (
        <div key={time} className="time-slot-item">
            <button
            className={`toggle-btn ${currentStatus === "available" ? "available" : "unavailable"}`}
            onClick={() =>
                handleToggleSlot(time, currentStatus === "available" ? "unavailable" : "available")
            }
            >
            {time}
            </button>
        </div>
      );
    })}
  </div>
</div>
            <h3>Existing Bookings</h3>
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by guest name"
            />
            <table className="bookings-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                                <td>{booking.id}</td>
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
    );
};

export default AdminTourBookings;
