import React, { useEffect, useState } from "react";
import "./Gallery.css";
import { useDataCache } from "../../contexts/DataContext";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

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

const categoryMap = {
  "canteen": "canteen",
  "hallway": "hallway",
  "men's bathroom": "men’s cr",
  "women's bathroom": "women’s cr"
};

const facilityDescriptions = {
  "canteen": "Our canteen offers a variety of delicious meals and snacks.",
  "hallway": "Spacious hallways connecting dormitory rooms and common areas.",
  "men’s cr": "Clean and well-maintained men's comfort room for residents.",
  "women’s cr": "Hygienic and comfortable women's restroom facilities."
};

const Gallery = () => {
  const { getCachedData, updateCache } = useDataCache();
  const [facilityImagesByCategory, setFacilityImagesByCategory] = useState({});
  const [isFacilityModalOpen, setFacilityModalOpen] = useState(false);
  const [facilityCategory, setFacilityCategory] = useState("");
  const [facilityImages, setFacilityImages] = useState([]);
  const [facilityIndex, setFacilityIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!window.Echo) {
      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: 'fea5d607d4b38ea09320',
        cluster: 'ap1',
        forceTLS: true,
      });
    }
  
    const channel = window.Echo.channel("gallery");
    channel.listen("GalleryImageUploaded", (e) => {
      if (e.image) {
        const dbCategory = e.image.category.trim().toLowerCase();
        const mappedCategory = categoryMap[dbCategory];
        const path = e.image.image_url;
  
        if (mappedCategory && facilityDescriptions[mappedCategory]) {
          setFacilityImagesByCategory(prev => {
            const updated = { ...prev };
            if (!updated[mappedCategory]) updated[mappedCategory] = [];
            updated[mappedCategory] = [path, ...updated[mappedCategory]];
            updateCache("gallery-images", updated);
            return updated;
          });
        }
      }
    });
  
    return () => {
      window.Echo.leave("gallery");
    };
  }, []);
  
  useEffect(() => {
    const cached = getCachedData("gallery-images");

    if (cached) {
      setFacilityImagesByCategory(cached);
    } else {
      fetch("https://seagold-laravel-production.up.railway.app/api/gallery")
        .then((res) => res.json())
        .then((data) => {
          const grouped = {};
          data.images.forEach((img) => {
            const dbCategory = img.category.trim().toLowerCase();
            const mappedCategory = categoryMap[dbCategory];
            const path = img.image_url;

            if (mappedCategory && facilityDescriptions[mappedCategory]) {
              if (!grouped[mappedCategory]) grouped[mappedCategory] = [];
              grouped[mappedCategory].push(path);
            }
          });

          setFacilityImagesByCategory(grouped);
          updateCache("gallery-images", grouped); // ✅ Save to cache
        });
    }
  }, []);

  const openFacilityModal = (category) => {
    setFacilityCategory(category);
    setFacilityImages(facilityImagesByCategory[category.toLowerCase()] || []);
    setFacilityIndex(0);
    setFacilityModalOpen(true);
  };

  const closeFacilityModal = () => setFacilityModalOpen(false);
  const nextFacilityImage = () => setFacilityIndex((prev) => (prev + 1) % facilityImages.length);
  const prevFacilityImage = () => setFacilityIndex((prev) => (prev === 0 ? facilityImages.length - 1 : prev - 1));
  const nextHeroSlide = () => setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  const prevHeroSlide = () => setHeroIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  return (
    <div className="gallery-container">
      {/* Hero Carousel */}
      <div className="hero-carousel">
        <div
          className="hero-slide"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${heroSlides[heroIndex].image})` }}
        >
          <button className="carousel-arrow left-arrow" onClick={prevHeroSlide}>&#10094;</button>
          <div className="hero-content">
            <h1>{heroSlides[heroIndex].title}</h1>
            <p>{heroSlides[heroIndex].description}</p>
            <button className="explore-btn">Explore Now</button>
          </div>
          <button className="carousel-arrow right-arrow" onClick={nextHeroSlide}>&#10095;</button>
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
        {Object.keys(facilityDescriptions).map((category, index) => (
          <div key={index} className="facility-card">
            <div className="facility-circle">
              <img
                src={facilityImagesByCategory[category]?.[0] || `${process.env.PUBLIC_URL}/images/placeholder.png`}
                alt={category}
                className="facility-image"
              />
            </div>
            <h4 className="facility-heading">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <p className="facility-description">{facilityDescriptions[category]}</p>
            <button className="view-btn" onClick={() => openFacilityModal(category)}>View</button>
          </div>
        ))}
      </div>

      {/* Facility Modal */}
      {isFacilityModalOpen && facilityImages.length > 0 && (
        <div className="facility-modal">
          <div className="facility-modal-content">
            <span className="close-btn" onClick={closeFacilityModal}>&times;</span>
            <h2>{facilityCategory}</h2>
            <div className="modal-image-container">
              <button className="arrow-btn left-arrow" onClick={prevFacilityImage}>&#9665;</button>
              <img
                src={facilityImages[facilityIndex]}
                alt="Facility View"
                className="modal-image"
              />
              <button className="arrow-btn right-arrow" onClick={nextFacilityImage}>&#9655;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
