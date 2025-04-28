import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import LoginModal from "../LoginModal/LoginModal";
import { getAuthToken } from "../../utils/auth";
import tourBg from "../../assets/Background.png";
import "./TourBooking.css";

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const TourBooking = () => {
  const [calendarDates, setCalendarDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [numVisitors, setNumVisitors] = useState("");

  // Set background on mount
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.backgroundImage = `url(${tourBg})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    return () => { document.body.style.backgroundImage = ""; };
  }, []);

  // Fetch Calendar Data
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`https://seagold-laravel-production.up.railway.app/api/tour-calendar?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => setCalendarDates(padCalendar(data.calendar)))
      .catch(err => console.error("Calendar Fetch Error:", err));
  }, [month, year, isLoggedIn]);

  // Fetch Available Slots
  useEffect(() => {
    if (!isLoggedIn || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    fetch(`https://seagold-laravel-production.up.railway.app/api/tour-slots?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => setAvailableSlots(data.slots))
      .catch(err => console.error("Slots Fetch Error:", err));
  }, [selectedDate, isLoggedIn]);

  // Pad Calendar Helper
  const padCalendar = (days) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lead = firstDay === 0 ? 6 : firstDay - 1;
    const result = Array(lead).fill({ date: null, status: "empty" });
    result.push(...days);
    const rem = result.length % 7;
    if (rem) result.push(...Array(7 - rem).fill({ date: null, status: "empty" }));
    return result;
  };

  // Month Navigation
  const changeMonth = (dir) => {
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    if (dir === "next") {
      if (month === 12) { setMonth(1); setYear(y => y + 1); }
      else { setMonth(m => m + 1); }
    } else {
      if (month === 1) { setMonth(12); setYear(y => y - 1); }
      else { setMonth(m => m - 1); }
    }
  };

  // Handle Booking
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !name || !phoneNumber || !numVisitors) {
      setMessage("Please fill out all fields and select a date and time.");
      return;
    }

    const headers = { "Content-Type": "application/json" };
    if (isLoggedIn) headers.Authorization = `Bearer ${getAuthToken()}`;

    try {
      const res = await fetch("https://seagold-laravel-production.up.railway.app/api/book-tour", {
        method: "POST",
        headers,
        body: JSON.stringify({
          date_booked: selectedDate,
          time_slot: selectedTime,
          name,
          phone_number: phoneNumber,
          num_visitors: numVisitors,
        }),
      });

      let data;
      const contentType = res.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server error ${res.status}`);
      }
      
      if (!res.ok) throw new Error(data.error || "Booking failed.");

      setMessage("Your tour has been successfully booked!");
      setAvailableSlots(slots => slots.map(s => s.time === selectedTime ? { ...s, status: "booked" } : s));
      setSelectedTime("");
      setName("");
      setPhoneNumber("");
      setNumVisitors("");
    } catch (err) {
      console.error("Booking Error:", err);
      setMessage(err.message);
    }
  };

  // Render
  return (
    <div className="client-tour-booking">
      {showLoginModal ? (
        <LoginModal
          mandatory
          onLogin={() => { setIsLoggedIn(true); setShowLoginModal(false); }}
          onClose={() => setShowLoginModal(false)}
        />
      ) : (
        <div className="booking-container">
          <div className="book-a-tour-title">
            <svg width="400" height="120" viewBox="0 0 400 120">
              <path id="arcPath" d="M20,90 Q200,10 380,90" fill="transparent" />
              <text fill="#036600" fontSize="50" fontWeight="900" fontFamily="Cooper Black, Georgia, serif">
                <textPath href="#arcPath" startOffset="50%" textAnchor="middle">Book a Tour</textPath>
              </text>
            </svg>
          </div>
          <p className="intro-tagline">Select a date and time for your dormitory tour:</p>

   {/* Calendar Navigation */}
<div className="calendar-nav">
  <button onClick={() => changeMonth("previous")} className="calendar-nav-button">
    &larr; {/* Left Arrow Symbol */}
  </button>
  <span>{MONTH_NAMES[month - 1]} {year}</span>
  <button onClick={() => changeMonth("next")} className="calendar-nav-button">
    &rarr; {/* Right Arrow Symbol */}
  </button>
</div>


          {/* Calendar Grid */}
          <div className="date-grid">
            {calendarDates.map((day, i) => (
              <button
                key={i}
                className={`date-button ${day.status} ${selectedDate === day.date ? "selected" : ""}`}
                disabled={day.status !== "available"}
                onClick={() => setSelectedDate(day.date)}
              >
                {day.date ? new Date(day.date).getDate() : ""}
              </button>
            ))}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="time-slot-grid">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  className={`time-slot ${slot.status} ${selectedTime === slot.time ? "selected" : ""}`}
                  disabled={slot.status !== "available"}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          {/* Booking Form */}
          <div className="booking-form">
            <h3>Provide Your Details</h3>
            <div className="input-group">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Full Name" />
            </div>
        <div className="input-group">
          <label>Phone Number (Philippines)</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 'bold' }}>+63</span>
            <input
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length <= 10) { // 10 digits (since +63 is already included)
                  setPhoneNumber(value);
                }
              }}
              placeholder="9123456789"
              type="tel"
              maxLength={10} // 10 digits (total 13 with +63)
              style={{ flex: 1 }}
            />
        </div>
</div>
            <div className="input-group">
              <label>Number of Visitors</label>
              <input type="number" min="1" value={numVisitors} onChange={e => setNumVisitors(e.target.value)} placeholder="How Many People?" />
            </div>
          </div>

          {/* Submit */}
          <button
            className="book-button"
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || !name || !phoneNumber || !numVisitors}
          >
            Book Tour
          </button>

          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default TourBooking;
