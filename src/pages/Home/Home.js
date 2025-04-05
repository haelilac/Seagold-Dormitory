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
    setIsLoggedIn(!!token);
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
      const response = await fetch("https://seagold-laravel-production.up.railway.app/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: localStorage.getItem("user_email") || null,
          emoji_rating: selectedEmoji,
          comment: feedbackComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback.");

      alert("Thank you for your feedback!");
      setSelectedEmoji(null);
      setFeedbackComment("");
      setFeedbackSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="home-page">
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={checkAuth}
          mandatory={!isLoggedIn}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Welcome to Seagold Dormitory</h1>
          <p>Comfort away from Home.</p>
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

                {/* Facilities Section - Enhanced */}
      <section className="facilities-section">
        <div className="facilities-container">
          <h2 className="text-why">Why Choose Us?</h2>
          <div className="facility-grid">
            {/* Card 1 - Modern Facilities */}
            <div className="feature-card">
              <div className="image-container">
                <img 
                  src="/sample1.jpg" 
                  alt="Modern facilities" 
                  className="feature-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                    e.target.alt = 'Modern facilities image';
                  }}
                />
              </div>
              <div className="card-content">
                <h3>Modern Facilities</h3>
                <p>State-of-the-art amenities and top-notch services.</p>
              </div>
            </div>

            {/* Card 2 - Smart Technology */}
            <div className="feature-card">
              <div className="image-container">
                <img 
                  src="/feature2.jpeg" 
                  alt="Smart technology" 
                  className="feature-image"
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <h3>Smart Technology</h3>
                <p>Smart room controls, high-speed internet, and more.</p>
              </div>
            </div>

            {/* Card 3 - Prime Location */}
            <div className="feature-card">
              <div className="image-container">
                <img 
                  src="/feature3.jpeg" 
                  alt="Prime location" 
                  className="feature-image"
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <h3>Prime Location</h3>
                <p>Located near top universities and public transport.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

              {/* Nearby Universities Section - Enhanced */}
          <section className="seagold-universities">
            <div className="seagold-container">
              <h2 className="seagold-title">Nearby Universities</h2>
              <p className="seagold-subtext">
                Our dormitory is located near top universities, making it the perfect choice for students.
              </p>

              <div className="seagold-university-list">
                {/* University 1 - FEU Tech */}
                <div className="seagold-university-item">
                  <div className="seagold-university-text">
                    <div className="university-header">
                      <img 
                        src="/images/feu-logo.png" 
                        alt="FEU Tech Logo" 
                        className="university-logo"
                        loading="lazy"
                      />
                      <h3>FEU Institute of Technology</h3>
                    </div>
                    <p>Just a 10-minute walk from our dormitory.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src="images/feutech.jpg" 
                      alt="FEU Tech Campus" 
                      loading="lazy"
                      className="campus-image"
                    />
                  </div>
                </div>

                {/* University 2 - UE Manila */}
                <div className="seagold-university-item seagold-reverse">
                  <div className="seagold-university-text">
                    <div className="university-header">
                      <img 
                        src="/images/ue-logo.png" 
                        alt="UE Logo" 
                        className="university-logo"
                        loading="lazy"
                      />
                      <h3>University Of The East</h3>
                    </div>
                    <p>Accessible by public transport within 15 minutes.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src="/images/UEmanila.jpg" 
                      alt="UE Manila Campus" 
                      loading="lazy"
                      className="campus-image"
                    />
                  </div>
                </div>

                {/* University 3 - UST */}
                <div className="seagold-university-item">
                  <div className="seagold-university-text">
                    <div className="university-header">
                      <img 
                        src="/images/ust-logo.png" 
                        alt="UST Logo" 
                        className="university-logo"
                        loading="lazy"
                      />
                      <h3>The University of Santo Tomas</h3>
                    </div>
                    <p>Located just across the street for easy access.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src="/images/UST-Zoom-Background.jpg" 
                      alt="UST Campus" 
                      loading="lazy"
                      className="campus-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

            {/* Nearby Essentials Section - Linked to Location Page */}
      <section className="seagold-essentials">
        <div className="seagold-container">
          <h2 className="seagold-essentials-title">Everything You Need Nearby!</h2>
          <p className="seagold-essentials-subtext">
            Everything you need within reach! From stores to laundry and restaurants.
          </p>

          <div className="seagold-essentials-list">
            {/* Convenience Store */}
            <div className="seagold-essentials-item">
              <div className="seagold-essentials-text">
                <div className="essentials-header">
                  <span className="essentials-icon"></span>
                  <h3>24/7 Convenience Store</h3>
                </div>
                <p>Just a 5-minute walk from the dormitory for all your daily needs.</p>
                <Link 
                  to="/location#convenience-store" 
                  className="view-map-btn"
                >
                  View on Map →
                </Link>
              </div>
              <div className="seagold-essentials-image">
                <img 
                  src="/images/storesample1.jpg" 
                  alt="Convenience Store" 
                  loading="lazy"
                  className="essentials-photo"
                />
              </div>
            </div>

            {/* Laundry Shop */}
            <div className="seagold-essentials-item seagold-essentials-reverse">
              <div className="seagold-essentials-text">
                <div className="essentials-header">
                  <span className="essentials-icon"></span>
                  <h3>Laundry Shop</h3>
                </div>
                <p>Affordable and efficient laundry services just around the corner.</p>
                <Link 
                  to="/location#laundry-shop" 
                  className="view-map-btn"
                >
                  View on Map →
                </Link>
              </div>
              <div className="seagold-essentials-image">
                <img 
                  src="/images/laundrysample.jpg" 
                  alt="Laundry Shop" 
                  loading="lazy"
                  className="essentials-photo"
                />
              </div>
            </div>

            {/* Restaurant */}
            <div className="seagold-essentials-item">
              <div className="seagold-essentials-text">
                <div className="essentials-header">
                  <span className="essentials-icon"></span>
                  <h3>Popular Restaurant</h3>
                </div>
                <p>Enjoy delicious meals within walking distance of the dormitory.</p>
                <Link 
                  to="/location#restaurant" 
                  className="view-map-btn"
                >
                  View on Map →
                </Link>
              </div>
              <div className="seagold-essentials-image">
                <img 
                  src="/images/fastfoodsample.jpg" 
                  alt="Restaurant" 
                  loading="lazy"
                  className="essentials-photo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="feedback-form">
        <div className="container">
          <h2 className="text-center">We Value Your Feedback</h2>
          <p className="text-center">How was your experience with Seagold Dormitory?</p>

          {/* Emoji Rating */}
          <div className="emoji-container">
            {["in-love", "happy", "neutral", "sad", "angry"].map((emoji) => (
              <img
                key={emoji}
                src={`https://seagold-laravel-production.up.railway.app/storage/icons/${emoji}.gif`}
                alt={emoji}
                className={`emoji ${selectedEmoji === emoji ? "selected" : ""}`}
                onClick={() => setSelectedEmoji(emoji)}
              />
            ))}
          </div>

          {/* Feedback Textbox */}
          <textarea
            className="form-control"
            rows="4"
            placeholder="Leave a comment..."
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          ></textarea>

          {/* Submit Button */}
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleFeedbackSubmit} disabled={feedbackSubmitted}>
              {feedbackSubmitted ? "Thank You!" : "Submit Feedback"}
            </button>
          </div>
        </div>
      </section>
  

                {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h4>Contact Us</h4>
                <address>
                  3/F Fern Building, Sampaloc, Manila<br />
                  <br />
                  <a href="tel:+1234567890">(123) 456-7890</a><br />
                  <a href="mailto:info@seagolddorm.com">info@seagolddorm.com</a>
                </address>
              </div>
              
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul className="footer-links">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/gallery">Photo Gallery</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>Connect With Us</h4>
                <div className="social-links">
                  <a href="https://facebook.com" aria-label="Facebook">
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a href="https://instagram.com" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://twitter.com" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 Seagold Dormitory. All rights reserved.</p>
              <p className="powered-by">Powered by <strong>DormVision</strong></p>
            </div>
          </div>
        </footer>
      </div>
    );
  };

export default Home;