import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminTourBookings.css';

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
        fetch('http://localhost:8000/api/tour-bookings')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched Bookings:', data.bookings);
                setBookings(data.bookings || []);
            })
            .catch((error) => console.error('Error fetching bookings:', error));
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/tour-bookings', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
            const response = await fetch(`http://localhost:8000/api/bookings/confirm/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
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
            const response = await fetch(`http://localhost:8000/api/bookings/cancel/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            if (response.ok) {
                alert('Booking canceled successfully!');
                fetchBookings(); // Refresh bookings data
    
                // Refresh available slots for the selected date if applicable
                if (selectedDate) {
                    fetch(`http://localhost:8000/api/tour-slots?date=${selectedDate}`)
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
            <p>Manage tour bookings and set your availability:</p>

            {message && <p className="message">{message}</p>}

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
