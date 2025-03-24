import React, { useState } from "react";
import "./Gallery.css";

const heroSlides = [
  {
    image: "/images/2beds1.jpg",
    title: "Comfortable & Affordable",
    description: "Discover a cozy and budget-friendly living space tailored for students and professionals.",
  },
  {
    image: "/images/4beds1.jpg",
    title: "Your Home Away from Home",
    description: "Enjoy a safe and welcoming environment with all the amenities you need.",
  },
  {
    image: "/images/6beds1.jpg",
    title: "Experience Quality Living",
    description: "Spacious rooms, great facilities, and an excellent community await you.",
  },
];

const roomsData = {
  "Room (For 2 persons)": ["2beds1.jpg", "2beds2.jpg", "2beds3.jpg"],
  "Room (For 4 persons)": ["4beds1.jpg"],
  "Room (For 6 persons)": ["6beds1.jpg", "6beds2.jpg", "6beds3.jpg", "6beds4.jpg"],
  "Room (For 8 persons)": ["8beds1.jpg", "8beds2.jpg", "8beds3.jpg"],
  "Room (For 10 persons)": ["10beds.jpg", "10beds1.jpg"],
};

const facilitiesData = {
  Canteen: {
    description: "Our canteen offers a variety of delicious meals and snacks.",
    images: ["canteen1.jpg", "canteen2.jpg", "canteen3.jpg"],
  },
  "Men’s CR": {
    description: "Clean and well-maintained men's comfort room for residents.",
    images: ["menscr1.jpg", "menscr2.jpg", "menscr3.jpg", "menscr4.jpg"],
  },
  "Women’s CR": {
    description: "Hygienic and comfortable women's restroom facilities.",
    images: ["womenscr1.jpg", "womenscr2.jpg", "womenscr3.jpg", "womenscr4.jpg"],
  },
  Hallway: {
    description: "Spacious hallways connecting dormitory rooms and common areas.",
    images: ["hallway1.jpg", "hallway2.jpg", "hallway3.jpg"],
  },
};

const Gallery = () => {
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  const [isFacilityModalOpen, setFacilityModalOpen] = useState(false);

  // Separate state variables for Room and Facilities Modals
  const [roomCategory, setRoomCategory] = useState(Object.keys(roomsData)[0]);
  const [roomImages, setRoomImages] = useState(roomsData[roomCategory] || []);
  const [roomIndex, setRoomIndex] = useState(0);

  const [facilityCategory, setFacilityCategory] = useState("");
  const [facilityImages, setFacilityImages] = useState([]);
  const [facilityIndex, setFacilityIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // ✅ Open Room Modal and Close Facility Modal
  const openRoomModal = () => {
    setFacilityModalOpen(false);
    setRoomCategory(Object.keys(roomsData)[0]);
    setRoomImages(roomsData[Object.keys(roomsData)[0]]);
    setRoomIndex(0);
    setRoomModalOpen(true);
  };

  // ✅ Open Facility Modal and Close Room Modal
  const openFacilityModal = (category) => {
    setRoomModalOpen(false);
    setFacilityCategory(category);
    setFacilityImages(facilitiesData[category].images);
    setFacilityIndex(0);
    setFacilityModalOpen(true);
  };

  // Close Modals
  const closeRoomModal = () => setRoomModalOpen(false);
  const closeFacilityModal = () => setFacilityModalOpen(false);

  // ✅ Navigate between Room Categories
  const nextRoomCategory = () => {
    const categories = Object.keys(roomsData);
    const currentIndex = categories.indexOf(roomCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setRoomCategory(categories[nextIndex]);
    setRoomImages(roomsData[categories[nextIndex]] || []);
    setRoomIndex(0);
  };

  const prevRoomCategory = () => {
    const categories = Object.keys(roomsData);
    const currentIndex = categories.indexOf(roomCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    setRoomCategory(categories[prevIndex]);
    setRoomImages(roomsData[categories[prevIndex]] || []);
    setRoomIndex(0);
  };

  // ✅ Navigate Next/Previous images
  const nextRoomImage = () => setRoomIndex((prev) => (prev + 1) % roomImages.length);
  const prevRoomImage = () => setRoomIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));

  const nextFacilityImage = () => setFacilityIndex((prev) => (prev + 1) % facilityImages.length);
  const prevFacilityImage = () => setFacilityIndex((prev) => (prev === 0 ? facilityImages.length - 1 : prev - 1));

 // Hero Section Navigation
  const nextHeroSlide = () => {
    setHeroIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    setHeroIndex((prevIndex) =>
      prevIndex === 0 ? heroSlides.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="gallery-container">
    {/* Hero Carousel Section */}
    <div className="hero-carousel">
      <div
        className="hero-slide"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${heroSlides[heroIndex].image})` }}
      >
        <button className="carousel-arrow left-arrow" onClick={prevHeroSlide}>
          &#10094;
        </button>
        <div className="hero-content">
          <h1>{heroSlides[heroIndex].title}</h1>
          <p>{heroSlides[heroIndex].description}</p>
          <button className="explore-btn" onClick={openRoomModal}>Explore Now</button>
        </div>
        <button className="carousel-arrow right-arrow" onClick={nextHeroSlide}>
          &#10095;
        </button>
      </div>
      <div className="dots-container">
        {heroSlides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === heroIndex ? "active-dot" : ""}`}
            onClick={() => setHeroIndex(index)}
          ></span>
        ))}
      </div>
    </div>

      {/* Facilities Section */}
      <h3 className="facilities-title">Facilities</h3>
      <div className="facilities-container">
        {Object.keys(facilitiesData).map((facility, index) => (
          <div key={index} className="facility-card">
            <div className="facility-circle">
              <img src={`${process.env.PUBLIC_URL}/images/${facilitiesData[facility].images[0]}`} alt={facility} className="facility-image" />
            </div>
            <h4 className="facility-heading">{facility}</h4>
            <p className="facility-description">{facilitiesData[facility].description}</p>
            <button className="view-btn" onClick={() => openFacilityModal(facility)}>View</button>
          </div>
        ))}
      </div>

      {/* ✅ Room Modal */}
      {isRoomModalOpen && roomImages.length > 0 && (
        <div className="room-modal">
          <div className="room-modal-content">
            <span className="close-btn" onClick={closeRoomModal}>&times;</span>
            <h2>{roomCategory}</h2>
            <div className="modal-image-container">
              <button className="arrow-btn left-arrow" onClick={prevRoomImage}>&#9665;</button>
              <img src={`${process.env.PUBLIC_URL}/images/${roomImages[roomIndex]}`} alt="Room View" className="modal-image" />
              <button className="arrow-btn right-arrow" onClick={nextRoomImage}>&#9655;</button>
            </div>
            <div className="modal-controls">
              <button className="category-btn" onClick={prevRoomCategory}>Previous Room</button>
              <button className="category-btn" onClick={nextRoomCategory}>Next Room</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Facility Modal */}
      {isFacilityModalOpen && facilityImages.length > 0 && (
        <div className="facility-modal">
          <div className="facility-modal-content">
            <span className="close-btn" onClick={closeFacilityModal}>&times;</span>
            <h2>{facilityCategory}</h2>
            <div className="modal-image-container">
              <button className="arrow-btn left-arrow" onClick={prevFacilityImage}>&#9665;</button>
              <img src={`${process.env.PUBLIC_URL}/images/${facilityImages[facilityIndex]}`} alt="Facility View" className="modal-image" />
              <button className="arrow-btn right-arrow" onClick={nextFacilityImage}>&#9655;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
