import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminTourBookings.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";

const AdminTourBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [allAvailable, setAllAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const { getCachedData, updateCache } = useDataCache();

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

        const cached = getCachedData("admin-tour-bookings");
        if (cached) {
            setBookings(cached);
            setLoading(false);
        } else {
            fetchBookings();
        }
        setIsInitialized(true);   // ✅ Mark as initialized after checking cache
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-bookings', {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const data = await response.json();
            setBookings(data.bookings || []);
            updateCache("admin-tour-bookings", data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }

    const handleDateChange = (date) => {
        setSelectedDate(date);
    
        const formattedDate = date.toISOString().split("T")[0];
        const cachedAvailability = getCachedData(`availability-${formattedDate}`);
    
        if (cachedAvailability) {
            setAvailability(cachedAvailability);
            const allAreAvailable = predefinedTimes.every(time => {
                const slot = cachedAvailability.find(s => s.time === time);
                return slot && slot.status === "available";
            });
            setAllAvailable(allAreAvailable);
        } else {
            fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${formattedDate}`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailability(data.slots);
                    updateCache(`availability-${formattedDate}`, data.slots);
                    const allAreAvailable = predefinedTimes.every(time => {
                        const slot = data.slots.find(s => s.time === time);
                        return slot && slot.status === "available";
                    });
                    setAllAvailable(allAreAvailable);
                })
                .catch((err) => {
                    console.error("Error fetching availability:", err);
                    setAvailability([]);
                    setAllAvailable(false);
                });
        }
    };

    const handleToggleSlot = async (time, status) => {
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tour-availability/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ date: formattedDate, time, status }),
            });

            if (response.ok) {
                setMessage(`Slot ${time} marked as ${status}`);
                setAvailability((prev) => {
                    const updated = [...prev];
                    const index = updated.findIndex((slot) => slot.time === time);
                    if (index !== -1) {
                        updated[index] = { ...updated[index], status };
                    } else {
                        updated.push({ time, status });
                    }
                    updateCache(`availability-${formattedDate}`, updated);
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
                    body: JSON.stringify({ date: formattedDate, time, status }),
                });
            }

            setMessage(`All slots marked as ${status}`);
            fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${formattedDate}`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailability(data.slots);
                    updateCache(`availability-${formattedDate}`, data.slots);
                })
                .catch((err) => {
                    console.error("Error fetching updated availability:", err);
                    setAvailability([]);
                });
        } catch (err) {
            console.error("Bulk update error:", err);
            setMessage("Failed to update all slots.");
        }
    };

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

    const getDateStatus = (dateObj) => {
        if (!(dateObj instanceof Date)) return "";
      
        const formatted = dateObj.toISOString().split("T")[0];
      
        const hasBooking = bookings.some(b => b.date === formatted);
        const slotsForDay = availability.filter(a => a.date === formatted);
      
        if (hasBooking) return "has-booking";        // 🟡
        if (slotsForDay.length === 0) return "";     // default
        const anyAvailable = slotsForDay.some(s => s.status === "available");
        return anyAvailable ? "available-date" : "unavailable-date"; // ✅ 🟢 or 🔴
      };

      if (!isInitialized) return null;
      if (loading) return <div className="spinner"></div>;
  
    return (
        <div className="admin-tour-bookings">
            <h2>Tour Bookings</h2>
            
        <div className="calendar-availability-section">
            <h3>Set Availability</h3>
            <p>Choose a date and toggle available time slots:</p>

            {/* 🗓️ Digital Date Display */}
            <h4>
                {selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                })}
            </h4>

            {/* 📅 Inline Calendar */}
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                inline
                dayClassName={getDateStatus}
            />

            {/* 🚀 Toggle All Available Switch */}
            <div className="bulk-toggle-switch">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={allAvailable}
                        onChange={(e) => {
                            const newStatus = e.target.checked ? "available" : "unavailable";
                            handleBulkToggle(newStatus);
                            setAllAvailable(e.target.checked);
                        }}
                    />
                    <span className="slider"></span>
                </label>
                <span style={{ marginLeft: '10px' }}>Toggle All Available</span>
            </div>

            {/* 🕒 Time Slot Buttons */}
            <div className="time-slots-container">
                {predefinedTimes.map((time) => {
                    const slot = availability.find((s) => s.time === time);
                    const currentStatus = slot ? slot.status : "unavailable";

                    return (
                        <button
                            key={time}
                            className={`toggle-btn ${currentStatus === "available" ? "available" : "unavailable"}`}
                            onClick={() =>
                                handleToggleSlot(
                                    time,
                                    currentStatus === "available" ? "unavailable" : "available"
                                )
                            }
                        >
                            {time}
                        </button>
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
}
export default AdminTourBookings;
