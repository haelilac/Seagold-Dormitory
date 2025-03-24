import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import LoginModal from "../LoginModal/LoginModal";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmoji) {
      alert("Please select an emoji.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: localStorage.getItem("user_email") || null, // If user is logged in
          emoji_rating: selectedEmoji,
          comment: feedbackComment, // Use the correct variable here
        }),
      });
  
      if (!response.ok) throw new Error("Failed to submit feedback.");
  
      const data = await response.json();
      console.log("Feedback submitted:", data);
      alert("Thank you for your feedback!");
      setSelectedEmoji(null); // Reset the form
      setFeedbackComment(""); // Reset the comment box
      setFeedbackSubmitted(true); // Disable the button
    } catch (error) {
      console.error(error.message);
      alert("Something went wrong. Please try again.");
    }
  };
  
  return (
    <div className="home-page">
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            checkAuth();
          }}
          mandatory={!isLoggedIn}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="hero-overlay">
          <h1>Welcome to Seagold Dormitory</h1>
          <p className="lead">Comfort away from Home.</p>
          <div className="button-group">
            <Link to="/gallery" className="btn btn-primary">
              Explore Rooms
            </Link>
            <Link to="/book-tour" className="btn btn-outline-light">
              Book a Tour
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities-section container py-5">
        <h2 className="text-center mb-5">Why Choose Us?</h2>
        <div className="row">
          <div className="col-md-4 text-center feature-card">
            <img
              src="/sample1.jpg"
              alt="Modern facilities"
              className="img-fluid mb-3"
              loading="lazy"
            />
            <h3>Modern Facilities</h3>
            <p>Experience state-of-the-art amenities and top-notch services.</p>
          </div>
          <div className="col-md-4 text-center feature-card">
            <img
              src="/feature2.jpeg"
              alt="Smart technology"
              className="img-fluid mb-3"
              loading="lazy"
            />
            <h3>Smart Technology</h3>
            <p>Smart room controls, high-speed internet, and more.</p>
          </div>
          <div className="col-md-4 text-center feature-card">
            <img
              src="/feature3.jpeg"
              alt="Prime location"
              className="img-fluid mb-3"
              loading="lazy"
            />
            <h3>Prime Location</h3>
            <p>Located near top universities and public transportation.</p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="feedback-form container py-5">
        <h2 className="text-center mb-4">We Value Your Feedback</h2>
        <p className="text-center mb-4">
          How was your experience with Seagold Dormitory?
        </p>
        <div className="emoji-container text-center mb-4">
            <img
              src="http://localhost:8000/storage/icons/in-love.gif"
              alt="Happy"
              className={`emoji ${selectedEmoji === "in-love" ? "selected" : ""}`}
              onClick={() => setSelectedEmoji("in-love")}
            />
            <img
              src="http://localhost:8000/storage/icons/happy.gif"
              alt="Happy"
              className={`emoji ${selectedEmoji === "happy" ? "selected" : ""}`}
              onClick={() => setSelectedEmoji("happy")}
            />
            <img
              src="http://localhost:8000/storage/icons/neutral.gif"
              alt="Neutral"
              className={`emoji ${selectedEmoji === "neutral" ? "selected" : ""}`}
              onClick={() => setSelectedEmoji("neutral")}
            />
            <img
              src="http://localhost:8000/storage/icons/sad.gif"
              alt="Sad"
              className={`emoji ${selectedEmoji === "sad" ? "selected" : ""}`}
              onClick={() => setSelectedEmoji("sad")}
            />
            <img
              src="http://localhost:8000/storage/icons/angry.gif"
              alt="Angry"
              className={`emoji ${selectedEmoji === "angry" ? "selected" : ""}`}
              onClick={() => setSelectedEmoji("angry")}
            />
          </div>

        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="Leave a comment..."
          value={feedbackComment}
          onChange={(e) => setFeedbackComment(e.target.value)}
        ></textarea>
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={handleFeedbackSubmit}
            disabled={feedbackSubmitted}
          >
            {feedbackSubmitted ? "Thank You!" : "Submit Feedback"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-light py-4">
        <div className="container">
          <div className="text-center mt-3">
            <p>&copy; 2024 Seagold Dormitory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
