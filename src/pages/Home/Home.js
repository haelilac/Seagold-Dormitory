import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import LoginModal from "../LoginModal/LoginModal";
import responsiveStaff from "../../assets/responsive-staff.png";
import communityVibes from "../../assets/community-vibes.png";
import affordableRates from "../../assets/affordable-rates.png";
import fbIcon from '../../assets/facebook-icon.png';
import gmailIcon from '../../assets/gmail-icon.png';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import restaurantDining from '../../assets/restaurant-dining.jpg';
import convenienceStore from '../../assets/convenience-store.jpg';
import laundryShop from '../../assets/laundry-shop.jpg';
import ustCampus from '../../assets/ust-campus.jpg';
import ueMnlCampus from '../../assets/ue-mnl-campus.jpg';
import feuTech from '../../assets/feu-tech.jpg';
import exactTrainingImage from "../../assets/exact-training-image.jpg";  // Replace with the actual image path for EXACT Training Center
import seamacTrainingImage from "../../assets/seamac-training-image.jpg"; 

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
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);

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
      const response = await fetch("http://seagold-laravel-production.up.railway.app/api/feedback", {
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

      {/* Facilities Section */}
      <section className="facilities-section">
        <div className="facilities-container">
          <h2 className="text-why">Why Choose Us?</h2>
          <div className="facility-grid">
            {/* Cards */}
            <div className="feature-card">
              <div className="image-container">
                <img src={responsiveStaff} alt="Responsive Staff" className="feature-image" loading="lazy"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
              </div>
              <div className="card-content">
                <h3>Responsive staff</h3>
                <p>Need help? Maintenance and admin are just one message away — ensuring everything runs smoothly for you.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="image-container">
                <img src={communityVibes} alt="Community Vibes" className="feature-image" loading="lazy"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
              </div>
              <div className="card-content">
                <h3>Community Vibes</h3>
                <p>Live with like-minded students and build lasting friendships. Events, common areas, and shared spaces make connecting easy.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="image-container">
                <img src={affordableRates} alt="Affordable Rates" className="feature-image" loading="lazy" />
              </div>
              <div className="card-content">
                <h3>Affordable Rates</h3>
                <p>Quality dorm living without breaking the bank. Flexible payment options and rates for daily, weekly, and monthly stays.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

   {/* 🎯 Nearby Training Centers Section */}
<section className="seagold-training-centers">
  <div className="training-centers-container">
    <h2 className="training-centers-title">Nearby Training Centers</h2>
    <p className="training-centers-subtext">
      Enhance your skills with access to top-rated training centers, just minutes from Seagold Dormitory.
    </p>

    <div className="training-centers-grid">
      {/* Training Center 1 - EXACT Training Center */}
      <div className="training-card">
        <div className="training-image">
          <img src={exactTrainingImage} alt="EXACT Training Center" loading="lazy" />
        </div>
        <div className="training-info">
          <h3 className="training-name">EXACT Training Center</h3>
          <p><strong>Address:</strong> Exact Building, 891 Galicia Street corner España Blvd., Sampaloc, Manila (Across UST).</p>
          <p><strong>Contact:</strong> <a href="tel:+63287324452">+63 2 8732 4452</a> | <a href="mailto:exactmarketing@exact-center.com">exactmarketing@exact-center.com</a></p>
          <p>
            Offering high-quality training for aspiring seafarers with MARINA & ISO certifications, including Fire Fighting, GMDSS, and First Aid.
          </p>
        </div>
      </div>

      {/* Training Center 2 - SEAMAC International Training Institute */}
      <div className="training-card">
        <div className="training-image">
          <img src={seamacTrainingImage} alt="SEAMAC International Training Institute" loading="lazy" />
        </div>
        <div className="training-info">
          <h3 className="training-name">SEAMAC International Training Institute, Inc.</h3>
          <p><strong>Address:</strong> Sealane Building, 867 G. Tolentino Street, Sampaloc, Manila.</p>
          <p><strong>Contact:</strong> <a href="tel:+63287367885">(02) 8736 7885</a></p>
          <p>
            SEAMAC offers industry-relevant programs like Shielded Metal Arc Welding (SMAW), Marine Diesel Mechanics, and more.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Nearby Universities Section - Enhanced */}
<section className="seagold-universities">
  <div className="universities-bg-overlay">
</div>
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
                    <div className="feu-tech-logo"></div>

                      <h3>FEU Institute of Technology</h3>
                    </div>
                    <p>Just a 10-minute walk from our dormitory.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src={feuTech} 
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
                    <div className="ue-mnl-logo"></div>
                      <h3>University Of The East</h3>
                    </div>
                    <p>Accessible by public transport within 15 minutes.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src={ueMnlCampus} 
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
                    <div className="ust-logo"></div>
                      <h3>The University of Santo Tomas</h3>
                    </div>
                    <p>Located just across the street for easy access.</p>
                    <div className="distance-badge">
                      <span></span>
                    </div>
                  </div>
                  <div className="seagold-university-image">
                    <img 
                      src={ustCampus} 
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
            <div className="essentials-bg-overlay">
</div>



  {/* 🔹 Main Content */}
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
          <Link to="/location#convenience-store" className="view-map-btn">View on Map →</Link>
        </div>
        <div className="seagold-essentials-image">
          <img src={convenienceStore} alt="Convenience Store" loading="lazy" className="essentials-photo" />
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
          <Link to="/location#laundry-shop" className="view-map-btn">View on Map →</Link>
        </div>
        <div className="seagold-essentials-image">
          <img src={laundryShop} alt="Laundry Shop" loading="lazy" className="essentials-photo" />
        </div>
      </div>

      {/* Restaurant */}
      <div className="seagold-essentials-item">
        <div className="seagold-essentials-text">
          <div className="essentials-header">
            <span className="essentials-icon"></span>
            <h3>Karinderyas</h3>
          </div>
          <p>Enjoy delicious affordable meals within walking distance of the dormitory.</p>
          <Link to="/location#restaurant" className="view-map-btn">View on Map →</Link>
        </div>
        <div className="seagold-essentials-image">
  <img src={restaurantDining} alt="Restaurant" loading="lazy" className="essentials-photo" />
</div>
      </div>
    </div>
  </div>
</section>
{/* Feedback Form */}
 {/* White Background Div */}
<section className="feedback-form">
<div className="feedbackhome-container">
  <div className="container">
    <h2 className="text-center">We Value Your Feedback</h2>
    <p className="text-center">How was your experience with Seagold Dormitory?</p>
  </div>

 
    {/* Emoji Rating */}
    <div className="emoji-container">
      {["in-love", "happy", "neutral", "sad", "angry"].map((emoji) => (
        <img
          key={emoji}
          src={`http://seagold-laravel-production.up.railway.app/storage/icons/${emoji}.gif`}
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
        <div class="footer-svg-overlay">
  <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="seagoldFooterGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00bf63" />
        <stop offset="50%" stop-color="#4a954e" />
        <stop offset="100%" stop-color="#f6c971" />
      </linearGradient>
    </defs>
    <path fill="url(#seagoldFooterGradient)" d="M0,120 C480,200 960,80 1440,160 L1440,320 L0,320 Z" />
  </svg>
</div>


<div className="container">
  <div className="footer-content">
    
    {/* 📍 Contact Us */}
    <div className="footer-section contact-section">
      <h4>Contact Us</h4>
      <address>
        <p>
          <FaMapMarkerAlt className="footer-icon" /> 3/F Fern Building, 827 P. Paredes St.,<br />
          Cor. S.H. Loyola St., Sampaloc, Manila 1008<br />
          [Beside FEU Tech New Building and Across Professional Regulation Commission (PRC)],<br />
          Manila, Philippines
        </p>
        <p>
          <FaPhoneAlt className="footer-icon" />
          <a href="tel:0922 592 7385">0922 592 7385</a>
        </p>
        <p>
          <FaEnvelope className="footer-icon" />
          <a href="mailto:seagold.service@gmail.com">seagold.service@gmail.com</a>
        </p>
      </address>
    </div>

    {/* 🔗 Quick Links */}
    <div className="footer-section links-section">
      <h4>Quick Links</h4>
      <ul className="footer-links">
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/gallery">Photo Gallery</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/faq">FAQ</Link></li>
      </ul>
    </div>

    {/* 🌐 Connect With Us */}
    <div className="footer-section connect-section">
      <h4>Connect With Us</h4>
      <div className="social-links">
        <a
          href="https://www.facebook.com/profile.php?id=61551676772866"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <img
            src={fbIcon}
            alt="Facebook"
            className="social-icon"
          />
        </a>
        <a
          href="mailto:seagold.service@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Gmail"
        >
          <img
            src={gmailIcon}
            alt="Gmail"
            className="social-icon"
          />
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