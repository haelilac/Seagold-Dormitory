import React, { useEffect, useState } from "react";
import "./Units.css";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [capacityInput, setCapacityInput] = useState("");
  const [carouselIndices, setCarouselIndices] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenImages, setFullscreenImages] = useState([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [animateContainer, setAnimateContainer] = useState(false);
  const [filters, setFilters] = useState({ availability: "" });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [modalUnit, setModalUnit] = useState(null);

  const openPriceModal = (unit) => {
    setModalUnit(unit);
    setShowPriceModal(true);
  };
  
  const closePriceModal = () => {
    setShowPriceModal(false);
    setModalUnit(null);
  };

  useEffect(() => {
    const fetchUnits = async () => {
      console.time('fetchUnits');
      try {
        const res = await fetch('https://seagold-laravel-production.up.railway.app/api/public-units');
        const data = await res.json();
        setUnits(data);
      } catch (err) {
        console.error("Error fetching units:", err.message);
      }
      console.timeEnd('fetchUnits');
    };
    fetchUnits();
  }, []);
  
  const handleFilterClick = (type, value) => {
    if (type === "availability") {
      const newFilters = { ...filters, availability: value };
      setFilters(newFilters);
    }
  };

  const filteredUnits = units.filter((unit) => {
    const availability = unit.capacity - (unit.users_count || 0);
  
    const matchesAvailability =
      filters.availability === "" ||
      parseInt(filters.availability) <= availability;
  
    return matchesAvailability;
  });

  
  useEffect(() => {
    setAnimateContainer(true);
    const timer = setTimeout(() => setAnimateContainer(false), 600);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleCarousel = (unitId, direction, totalImages) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[unitId] || 0;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % totalImages
          : (currentIndex - 1 + totalImages) % totalImages;
      return { ...prev, [unitId]: newIndex };
    });
  };
  

  const openFullscreen = (images, index) => {
    setFullscreenImages(images);
    setFullscreenIndex(index);
    setFullscreenImage(images[index]);
  };

  const nextFullscreen = (e) => {
    e.stopPropagation();
    const nextIndex = (fullscreenIndex + 1) % fullscreenImages.length;
    setFullscreenIndex(nextIndex);
    setFullscreenImage(fullscreenImages[nextIndex]);
  };

  const prevFullscreen = (e) => {
    e.stopPropagation();
    const prevIndex =
      (fullscreenIndex - 1 + fullscreenImages.length) %
      fullscreenImages.length;
    setFullscreenIndex(prevIndex);
    setFullscreenImage(fullscreenImages[prevIndex]);
  };

  return (
    <div className="Units fade-in">
      <div className="filter-bar fade-in">
        <div className="search-section">
          <h1 className="sea-gold-heading">
            <span className="unit-text">Unit</span>
            <span className="description-text">
              The Room that starts your dream
            </span>
          </h1>

          <div
            className="search-input"
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src="search-icon.png"
              alt="Search Icon"
              className="search-icon"
              onClick={() =>
                handleFilterClick("availability", capacityInput.trim())
              }
              style={{
                width: "20px",
                height: "20px",
                marginRight: "8px",
                cursor: "pointer",
              }}
            />
            <input
              type="number"
              placeholder="Insert the quantity of people"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilterClick("availability", capacityInput.trim());
                }
              }}
              min="1"
              max="14"
              style={{ flex: 1 }}
            />
          </div>
        </div>

      </div>

      <div id="rental-container" className={animateContainer ? "animate" : ""}>
  {filteredUnits.length > 0 ? (
    filteredUnits.map((unit) => (
      <div key={unit.id} className="rental-card">
        <div className="rental-header">
          <span className="verified-badge">{unit.unit_code}</span>
          {Array.isArray(unit.images) && unit.images.length > 0 && (
            <div className="carousel-container">
              <button
                className="carousel-btn prev"
                onClick={() =>
                  handleCarousel(unit.id, "prev", unit.images.length)
                }
              >
                &#8592;
              </button>
              <div
                className="carousel-images"
                      style={{
                        transform: `translateX(-${
                          (carouselIndices[unit.id] || 0) * 100
                        }%)`,
                      }}
                    >
                    {unit.images.slice(0, 1).map((img, i) => (
                      <img
                        src={img.image_path}
                        alt={`Room ${unit.unit_code}`}
                        className="rental-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/fallback.jpg"; // fallback image
                        }}
                        onClick={() => openFullscreen(unit.images.map(i => i.image_path), i)}
                      />
                    ))}

                    </div>
                    <button
                      className="carousel-btn next"
                      onClick={() =>
                        handleCarousel(unit.id, "next", unit.images.length)
                      }
                    >
                      &#8594;
                    </button>
                  </div>
                )}
              </div>

              {showPriceModal && (
                <div className="price-modal-overlay" onClick={() => setShowPriceModal(false)}>
                  <div className="price-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Room Pricing</h2>
                    <img
                      src="/images/sample-pricing.jpg"
                      alt="Pricing Info"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <button onClick={() => setShowPriceModal(false)} className="close-modal-btn">
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="rental-content">
              <h3 className="rental-title">{unit.unit_code}</h3>
                <button className="view-price-btn" onClick={() => setShowPriceModal(true)}>
                  View Price
                </button>
                <p className="rental-availability">
                Slots Available: {unit.max_capacity - (unit.monthly_users_count || 0)} / {unit.max_capacity}

                </p>
              </div>
            </div>
          ))
        ) : (
          <div
            className="no-availability"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <p>
              Oops! It looks like no rooms are available for your selected filters.
            </p>
            <img
              src="sad.svg"
              alt="Room Not Available"
              style={{ maxWidth: "200px", width: "100%" }}
            />
          </div>
        )}
      </div>

      {fullscreenImage && (
        <div
          className="fullscreen-overlay"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="fullscreen-nav prev" onClick={prevFullscreen}>
            ⟵
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen Preview"
            className="fullscreen-image"
          />
          <button className="fullscreen-nav next" onClick={nextFullscreen}>
            ⟶
          </button>
        </div>
      )}
    </div>
  );
};

export default Units;
