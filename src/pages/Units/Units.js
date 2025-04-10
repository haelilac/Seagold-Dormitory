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

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
        const data = await res.json();
        setUnits(data);
      } catch (err) {
        console.error("Error fetching units:", err.message);
      }
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
                      {unit.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.image_path}
                          alt={`Room ${unit.unit_code}`}
                          className="rental-image"
                          onClick={() =>
                            openFullscreen(unit.images.map((i) => i.image_path), i)
                          }
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
              </div> {/* ✅ This was missing before */}

              <div className="rental-content">
                <h3 className="rental-title">{unit.name}</h3>
                <p className="rental-price">
                  Price: <strong>₱{parseFloat(unit.price).toLocaleString()}</strong>
                </p>
                <p className="rental-availability">
                  Slots Available: {unit.capacity - (unit.users_count || 0)} /{" "}
                  {unit.capacity}
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
