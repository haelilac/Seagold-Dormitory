import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // Import the calendar
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import './HomeTenant.css'; // Your custom styles
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";


const Home = ({ userName, darkMode }) => {
    const [date, setDate] = useState(new Date()); // State for selected date
    const [events, setEvents] = useState([]); // Initialize events as an empty array
    const { getCachedData, updateCache } = useDataCache();
    const [loading, setLoading] = useState(true);
      
  useEffect(() => {
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);
    // Fetch events from the API
    useEffect(() => {
        const fetchEvents = async () => {
            const cachedEvents = getCachedData("events");
            if (cachedEvents) {
                setEvents(cachedEvents);
                setLoading(false);
                return;
            }
    
            try {
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/events', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Accept': 'application/json'
                    }
                });
    
                const data = await response.json();
                if (Array.isArray(data)) {
                    setEvents(data);
                    updateCache("events", data); // 💾 Save to cache
                } else {
                    console.error('Unexpected response format:', data);
                    setEvents([]);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
    
        fetchEvents();
    }, []);
    
  if (loading) return <div className="hometenant-spinner"></div>;
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
        </>
        
    );
};

export default Home;
