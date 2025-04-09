import React, { useEffect, useState } from "react";
import "./Units.css";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("unitFilters");
    return saved
      ? JSON.parse(saved)
      : { price: "All", features: [], availability: "" };
  });
  const [capacityInput, setCapacityInput] = useState("");
  const [carouselIndices, setCarouselIndices] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenImages, setFullscreenImages] = useState([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [animateContainer, setAnimateContainer] = useState(false);

  // Fetch units from backend
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch(
          "https://seagold-laravel-production.up.railway.app/api/units"
        );
        if (!response.ok) throw new Error("Failed to fetch units");
        const data = await response.json();
        setUnits(data);
      } catch (err) {
        console.error("Error fetching units:", err.message);
      }
    };
    fetchUnits();
  }, []);

  // Filtering logic
  const handleFilterClick = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (type === "price") {
        newFilters.price = prev.price === value ? "All" : value;
      } else if (type === "availability") {
        newFilters.availability = value;
      }
      localStorage.setItem("unitFilters", JSON.stringify(newFilters));
      return newFilters;
    });
  };

  const clearFilters = () => {
    const cleared = { price: "All", features: [], availability: "" };
    setFilters(cleared);
    localStorage.setItem("unitFilters", JSON.stringify(cleared));
  };

  const filteredUnits = units.filter((unit) => {
    const price = parseFloat(unit.price);
    const availability = unit.capacity - (unit.users_count || 0);

    const matchesPrice =
      filters.price === "All" ||
      (filters.price === "Below ₱5,000" && price < 5000) ||
      (filters.price === "₱6,000 - ₱8,000" && price >= 6000 && price <= 8000) ||
      (filters.price === "₱9,000 - ₱11,000" && price >= 9000 && price <= 11000);

    const matchesAvailability =
      filters.availability === "" ||
      parseInt(filters.availability) <= availability;

    return matchesPrice && matchesAvailability;
  });

  useEffect(() => {
    setAnimateContainer(true);
    const timer = setTimeout(() => setAnimateContainer(false), 600);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleCarousel = (unitId, direction) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[unitId] || 0;
      const totalImages = 3;
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

        <div className="filters">
          <button
            className={filters.price === "Below ₱5,000" ? "active" : ""}
            onClick={() => handleFilterClick("price", "Below ₱5,000")}
          >
            Below ₱5,000
          </button>
          <button
            className={filters.price === "₱6,000 - ₱8,000" ? "active" : ""}
            onClick={() => handleFilterClick("price", "₱6,000 - ₱8,000")}
          >
            ₱6,000 to ₱8,000
          </button>
          <button
            className={filters.price === "₱9,000 - ₱11,000" ? "active" : ""}
            onClick={() => handleFilterClick("price", "₱9,000 - ₱11,000")}
          >
            ₱9,000 to ₱11,000
          </button>
          <button className="clear-button" onClick={clearFilters}>
            ✕
          </button>
        </div>
      </div>

      <div id="rental-container" className={animateContainer ? "animate" : ""}>
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <div key={unit.id} className="rental-card">
              <div className="rental-header">
                <span className="verified-badge">{unit.unit_code}</span>
                <div className="carousel-container">
                  <button
                    className="carousel-btn prev"
                    onClick={() => handleCarousel(unit.id, "prev")}
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
                    {[1, 2, 3].map((i) => (
                      <img
                        key={i}
                        src={`/images/default-room${i}.jpg`}
                        alt={`Room ${unit.unit_code}`}
                        className="rental-image"
                        onClick={() =>
                          openFullscreen(
                            ["/images/default-room1.jpg", "/images/default-room2.jpg", "/images/default-room3.jpg"],
                            i - 1
                          )
                        }
                      />
                    ))}
                  </div>
                  <button
                    className="carousel-btn next"
                    onClick={() => handleCarousel(unit.id, "next")}
                  >
                    &#8594;
                  </button>
                </div>
              </div>

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
              Oops! It looks like no rooms are available for your selected
              filters.
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
