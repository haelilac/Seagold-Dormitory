import React, { useState, useEffect, useRef } from "react";
import "./EventsBoard.css";

// Helper functions to convert between formats
const convertDateToISO = (mmddyyyy) => {
  const [month, day, year] = mmddyyyy.split("-");
  return `${year}-${month}-${day}`;
};

const convertDateToMMDDYYYY = (isoDate) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${month}-${day}-${year}`;
};

const EventsBoard = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ date: "", title: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calendar popup control
  const [showCalendar, setShowCalendar] = useState(false);

  // Filter states (active filters)
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  // Filter states (selected but not yet applied)
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  /**
   * Fetch events on mount if token is present
   */
  useEffect(() => {
    if (!token) {
      console.error("No token found. Redirecting to login.");
      window.location.href = "/login";
      return;
    }
    fetchEvents();
  }, [token]);

  /**
   * Fetch events and convert their date formats for display
   */
  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        console.error("Unauthorized. Redirecting to login.");
        window.location.href = "/login";
        return;
      }
      const data = await response.json();
      // Convert dates from ISO (YYYY-MM-DD) to MM-DD-YYYY
      const formattedData = data.map((event) => ({
        ...event,
        date: convertDateToMMDDYYYY(event.date),
      }));
      setEvents(formattedData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Add / Update submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `http://localhost:8000/api/events/${editingEventId}`
      : "http://localhost:8000/api/events";

    // Convert the date to ISO before sending
    const bodyData = { ...formData, date: convertDateToISO(formData.date) };
    console.log("[handleSubmit] method:", method, "url:", url, "bodyData:", bodyData);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      console.error("Failed to add/update event:", await response.text());
      return;
    }

    // Reset form & mode
    setFormData({ date: "", title: "", description: "" });
    setEditMode(false);
    setEditingEventId(null);

    // Re-fetch events to update list
    fetchEvents();
  };

  /**
   * Handle Delete
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    console.log("[handleDelete] Deleting event id:", id);

    await fetch(`http://localhost:8000/api/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  /**
   * Handle Edit
   */
  const handleEdit = (event) => {
    console.log("[handleEdit] Editing event:", event);
    setFormData({
      date: event.date,
      title: event.title,
      description: event.description,
    });
    setEditMode(true);
    setEditingEventId(event.id);
  };

  /**
   * Apply the selected filters when the user clicks the Filter button
   */
  const applyFilters = () => {
    setFilterMonth(selectedMonth);
    setFilterYear(selectedYear);
  };

  /**
   * Filtered events: based on active filter states AND search term
   */
  const filteredEvents = events.filter((event) => {
    // 1. Title search
    if (searchTerm.trim() !== "") {
      // Case-insensitive match of the event title
      if (!event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // 2. Month/Year filters
    const [month, , year] = event.date.split("-");
    if (filterMonth !== "All" && month !== filterMonth) return false;
    if (filterYear !== "All" && year !== filterYear) return false;
    return true;
  });

  /**
   * Separate the filtered events into "Ongoing", "Upcoming" and "Past"
   * based on today's date.
   */
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ongoingEvents = [];
  const upcomingEvents = [];
  const pastEvents = [];

  filteredEvents.forEach((event) => {
    const [month, day, year] = event.date.split("-");
    const eventDate = new Date(+year, +month - 1, +day);
    // Normalize event date to remove time components
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDay.getTime() === today.getTime()) {
      ongoingEvents.push(event);
    } else if (eventDay < today) {
      pastEvents.push(event);
    } else {
      upcomingEvents.push(event);
    }
  });

  /**
   * Generate unique year options from events
   */
  const uniqueYears = Array.from(new Set(events.map((e) => e.date.split("-")[2]))).sort();

  return (
    <div className="events-page">
      {/* Header Bar */}
      <header className="header-bar">
        <h1>Events Board</h1>
      </header>

      <div className="content-row">
        {/* Left Column: Add/Edit Event Form */}
        <div className="form-card">
          <h2>{editMode ? "Edit Event" : "Add Event"}</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="date">Date</label>
            <CustomDatePicker
              selectedDate={formData.date}
              setFormData={setFormData}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
            />

            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <button type="submit">
              {editMode ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* Right Column: Search & Filter + Ongoing, Upcoming & Past Events */}
        <div className="events-lists">
          {/* Controls Row: Search and Filter */}
          <div className="controls-row">
            {/* Search Container (Left) */}
            <div className="search-container">
              <label>
                Search by Title:
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>

            {/* Filter Wrapper (Right) */}
            <div className="filter-wrapper">
              <h3>Filter Events</h3>
              <div className="filter-container">
                {/* Month Filter */}
                <label>
                  Month:
                  <select
                    className="filter-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </label>

                {/* Year Filter */}
                <label>
                  Year:
                  <select
                    className="filter-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="All">All</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Filter Button */}
                <button
                  type="button"
                  className="filter-btn"
                  onClick={applyFilters}
                >
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Ongoing Events Container */}
          <div className="ongoing-events-container">
            <h2>Ongoing Events</h2>
            {loading && <p>Loading events...</p>}
            {!loading && ongoingEvents.length === 0 && <p>No ongoing events available.</p>}
            <div className="events-list">
              {ongoingEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-date">{event.date}</p>
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <div className="event-actions">
                    <button className="edit-btn" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events Container */}
          <div className="upcoming-events-container">
            <h2>Upcoming Events</h2>
            {loading && <p>Loading events...</p>}
            {!loading && upcomingEvents.length === 0 && <p>No upcoming events available.</p>}
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-date">{event.date}</p>
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <div className="event-actions">
                    <button className="edit-btn" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Events Container */}
          <div className="past-events-container">
            <h2>Past Events</h2>
            {loading && <p>Loading events...</p>}
            {!loading && pastEvents.length === 0 && <p>No past events available.</p>}
            <div className="events-list">
              {pastEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-date">{event.date}</p>
                    {event.description && <p>{event.description}</p>}
                  </div>
                  <div className="event-actions">
                    <button className="edit-btn" onClick={() => handleEdit(event)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CustomDatePicker Component
 * - Expects and displays dates in MM-DD-YYYY format.
 * - Auto-formats user input by automatically inserting dashes.
 */
const CustomDatePicker = ({ selectedDate, setFormData, showCalendar, setShowCalendar }) => {
  const [typedDate, setTypedDate] = useState(selectedDate || "");
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(2023);
  const calendarRef = useRef(null);

  // Sync typedDate and internal month/year with external selectedDate
  useEffect(() => {
    setTypedDate(selectedDate || "");
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const parsed = new Date(+year, +month - 1, +day);
        if (!isNaN(parsed.getTime())) {
          setCurrentMonth(parsed.getMonth());
          setCurrentYear(parsed.getFullYear());
        }
      }
    }
  }, [selectedDate]);

  // Close the calendar if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar, setShowCalendar]);

  /**
   * When user types a date manually in MM-DD-YYYY format,
   * auto-insert dashes and validate once we have 10 chars.
   */
  const handleInputChange = (e) => {
    let value = e.target.value;
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, "");
    let formattedValue = "";
    if (digits.length > 0) {
      formattedValue = digits.substring(0, 2);
      if (digits.length >= 3) {
        formattedValue += "-" + digits.substring(2, 4);
        if (digits.length >= 5) {
          formattedValue += "-" + digits.substring(4, 8);
        }
      }
    }
    setTypedDate(formattedValue);

    if (formattedValue.length === 10) {
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/; // MM-DD-YYYY
      if (dateRegex.test(formattedValue)) {
        const [month, day, year] = formattedValue.split("-");
        const newDate = new Date(+year, +month - 1, +day);
        if (!isNaN(newDate.getTime())) {
          setFormData((prev) => ({ ...prev, date: formattedValue }));
          setCurrentMonth(newDate.getMonth());
          setCurrentYear(newDate.getFullYear());
        }
      }
    }
  };

  // Build month/year dropdown arrays
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const minYear = 1900;
  const maxYear = 2100;
  const yearOptions = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearOptions.push(y);
  }

  // Build the calendar
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = [];

  // Empty slots before day 1
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group into weeks of 7
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Check if a day is currently selected
  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    const [selMonth, selDay, selYear] = selectedDate.split("-");
    const selDate = new Date(+selYear, +selMonth - 1, +selDay);
    return (
      selDate.getFullYear() === currentYear &&
      selDate.getMonth() === currentMonth &&
      selDate.getDate() === day
    );
  };

  // Handle clicking a day in the calendar
  const handleDayClick = (day) => {
    if (!day) return;
    const newDate = new Date(currentYear, currentMonth, day);
    if (!isNaN(newDate.getTime())) {
      const formattedDate =
        String(newDate.getMonth() + 1).padStart(2, "0") + "-" +
        String(newDate.getDate()).padStart(2, "0") + "-" +
        newDate.getFullYear();
      setTypedDate(formattedDate);
      setFormData((prev) => ({ ...prev, date: formattedDate }));
      setShowCalendar(false);
    }
  };

  return (
    <div className="datepicker">
      <div className="input-container">
        <input
          type="text"
          value={typedDate}
          placeholder="MM-DD-YYYY"
          onChange={handleInputChange}
          className="calendar-input"
        />
        <span
          className="calendar-icon"
          onClick={() => {
            setShowCalendar(!showCalendar);
          }}
        >
          📅
        </span>
      </div>

      {showCalendar && (
        <div className="datepicker-popup" ref={calendarRef}>
          <div className="calendar-header">
            <select
              className="month-select"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(+e.target.value)}
            >
              {monthOptions.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="year-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(+e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayLabel) => (
                <div key={dayLabel} className="weekday">
                  {dayLabel}
                </div>
              ))}
            </div>

            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="calendar-week">
                {week.map((day, dIndex) => {
                  if (!day) {
                    return <span key={dIndex} className="empty-day" />;
                  }
                  const selected = isSelected(day);
                  const isSunday = dIndex === 0;
                  const isSaturday = dIndex === 6;

                  return (
                    <div key={dIndex} className="calendar-day">
                      <button
                        onClick={() => handleDayClick(day)}
                        className={`day-button
                          ${selected ? "selected-day" : ""}
                          ${isSunday ? "sunday" : ""}
                          ${isSaturday ? "saturday" : ""}
                        `}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsBoard;
