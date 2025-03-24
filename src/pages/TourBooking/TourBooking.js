import React, { useState, useEffect } from "react";
import "./TourBooking.css";
import LoginModal from "../LoginModal/LoginModal";

const TourBooking = () => {
  const [calendarDates, setCalendarDates] = useState([]); // Calendar for the selected month
  const [availableSlots, setAvailableSlots] = useState([]); // Time slots for the selected date
  const [selectedDate, setSelectedDate] = useState(""); // Currently selected date
  const [selectedTime, setSelectedTime] = useState(""); // Currently selected time
  const [message, setMessage] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")); // Check login status
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn); // Force login if not logged in

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [numVisitors, setNumVisitors] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return; // Skip fetching if user is not logged in

    // Fetch calendar data for the selected month and year
    fetch(`http://localhost:8000/api/tour-calendar?month=${month}&year=${year}`)
      .then((response) => response.json())
      .then((data) => setCalendarDates(generateAlignedCalendar(data.calendar)))
      .catch((error) => console.error("Error fetching calendar:", error));
  }, [month, year, isLoggedIn]);

  // Fetch available slots for the selected date
  useEffect(() => {
    if (!isLoggedIn || !selectedDate) {
      setAvailableSlots([]); // Clear slots when no date is selected or user is not logged in
      return;
    }

    fetch(`http://localhost:8000/api/tour-slots?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => setAvailableSlots(data.slots))
      .catch((error) => console.error("Error fetching slots:", error));
  }, [selectedDate, isLoggedIn]);

  const generateAlignedCalendar = (calendarData) => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

    const alignedCalendar = [];

    // Fill in empty days before the first day of the month
    for (let i = 0; i < (firstWeekday === 0 ? 6 : firstWeekday - 1); i++) {
      alignedCalendar.push({ date: null, status: "empty" });
    }

    // Add the actual dates from the API data
    calendarData.forEach((day) => alignedCalendar.push(day));

    return alignedCalendar;
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !name || !phoneNumber || !numVisitors) {
      setMessage("Please fill out all fields and select a date and time.");
      return;
    }
  
    const bookingData = {
      date_booked: selectedDate,
      time_slot: selectedTime, // Directly use the 12-hour format
      name,
      phone_number: phoneNumber,
      num_visitors: numVisitors,
    };
  
    fetch("http://localhost:8000/api/book-tour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: isLoggedIn
          ? `Bearer ${localStorage.getItem("token")}`
          : null,
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => Promise.reject(err));
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setMessage("Your tour has been successfully booked!");
          setAvailableSlots((prev) =>
            prev.map((slot) =>
              slot.time === selectedTime ? { ...slot, status: "booked" } : slot
            )
          );
          setSelectedTime("");
          setName("");
          setPhoneNumber("");
          setNumVisitors("");
        } else {
          setMessage(data.error || "Failed to book the tour.");
        }
      })
      .catch((error) => {
        console.error("Error booking tour:", error);
        setMessage("An error occurred. Please try again.");
      });
  };
  
  
  const changeMonth = (direction) => {
    // Reset the selected date and available slots
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);

    if (direction === "next") {
      if (month === 12) {
        setMonth(1);
        setYear((prev) => prev + 1);
      } else {
        setMonth((prev) => prev + 1);
      }
    } else if (direction === "previous") {
      if (month === 1) {
        setMonth(12);
        setYear((prev) => prev - 1);
      } else {
        setMonth((prev) => prev - 1);
      }
    }
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="client-tour-booking">
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
          }}
          mandatory={true}
        />
      )}

      {!showLoginModal && (
        <>
          <h2>Book a Tour</h2>
          <p>Select a date and time for your dormitory tour:</p>

          {/* Calendar Section */}
          <div className="calendar">
            <h3>
              <button onClick={() => changeMonth("previous")}>Previous</button>{" "}
              {new Date(year, month - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {year}{" "}
              <button onClick={() => changeMonth("next")}>Next</button>
            </h3>
            <div className="days-of-week">
              {daysOfWeek.map((day) => (
                <div key={day} className="day-label">
                  {day}
                </div>
              ))}
            </div>
            <div className="date-grid">
              {calendarDates.map((day, index) => (
                <button
                  key={index}
                  className={`date-button ${day.status} ${selectedDate === day.date ? "selected" : ""}`}
                  disabled={day.status !== "available"}
                  onClick={() => day.date && setSelectedDate(day.date)}
                >
                  {day.date ? new Date(day.date).getDate() : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          {selectedDate && (
            <div className="time-slots-section">
              <h3>Select Time</h3>
              <div className="time-slot-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`time-slot ${slot.status} ${
                      selectedTime === slot.time ? "selected" : ""
                    }`}
                    disabled={slot.status !== "available"}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Booking Information */}
          <div className="booking-form">
            <h3>Provide Your Details</h3>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Your Phone Number"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="num-visitors">Number of Visitors</label>
              <input
                type="number"
                id="num-visitors"
                value={numVisitors}
                onChange={(e) => setNumVisitors(e.target.value)}
                placeholder="How Many People?"
                min="1"
                required
              />
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || !name || !phoneNumber || !numVisitors}
            className="book-button"
          >
            Book Tour
          </button>

          {message && <p className="message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default TourBooking;
