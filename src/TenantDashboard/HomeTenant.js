import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // Import the calendar
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import './HomeTenant.css'; // Your custom styles

const Home = ({ userName, darkMode }) => {
    const [date, setDate] = useState(new Date()); // State for selected date
    const [events, setEvents] = useState([]); // Initialize events as an empty array
    const [transactions, setTransactions] = useState([
        { date: '2024-12-20', amount: 1500, description: 'Monthly Rent Payment' },
        { date: '2024-12-18', amount: 500, description: 'Maintenance Fee' },
        { date: '2024-12-15', amount: 1200, description: 'Electricity Bill' },
        { date: '2024-12-10', amount: 800, description: 'Water Bill' },
    ]);

    // Fetch events from the API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/events', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await response.json();

                // Ensure data is in array format
                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    console.error('Unexpected response format:', data);
                    setEvents([]); // Fallback to empty array
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]); // Fallback to empty array on error
            }
        };

        fetchEvents();
    }, []);

    // Filter events based on the selected date
    const filteredEvents = events
    .filter((event) => event && event.date) // Exclude null or undefined events
    .filter(
        (event) =>
            new Date(event.date).toLocaleDateString() === date.toLocaleDateString()
    );


    return (
        <>
            <section className="calendar-section">
                <h3 className="calendar-title">Calendar</h3>
                <Calendar
                    onChange={setDate}
                    value={date}
                    className="custom-calendar"
                />
                <p className="
selected-date">
                    Selected Date: {date.toLocaleDateString()}
                </p>
            </section>

            {/* Event Board Section */}
            <section className="event-board">
                <h3 className="event-board-title">Event Board</h3>
                {filteredEvents.length > 0 ? (
                    <ul className="event-list">
                        {filteredEvents.map((event, index) => (
                            <li key={index} className="event-item">
                                <h4>{event.title || 'No Title'}</h4>
                                <p>{event.description || 'No Description'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-events">No events for this date.</p>
                )}
            </section>


            {/* Transaction Box Section */}
            <section className="transaction-box">
                <h3 className="transaction-box-title">Transaction History</h3>
                {transactions.length > 0 ? (
                    <ul className="transaction-list">
                        {transactions.map((transaction, index) => (
                            <li key={index} className="transaction-item">
                                <div className="transaction-date">{transaction.date}</div>
                                <div className="transaction-details">
                                    <span className="transaction-description">
                                        {transaction.description}
                                    </span>
                                    <span className="transaction-amount">
                                        ₱{transaction.amount.toFixed(2)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-transactions">No transactions recorded.</p>
                )}
            </section>
        </>
    );
};

export default Home;
