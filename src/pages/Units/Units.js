import React, { useEffect, useState } from "react";


const Units = () => {
  // -----------------------------------------------------
  // State Variables
  // -----------------------------------------------------
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("unitFilters");
    return saved
      ? JSON.parse(saved)
      : { price: "All", features: [], availability: "" };
  });
  const [capacityInput, setCapacityInput] = useState("");
  const [carouselIndices, setCarouselIndices] = useState({});
  const [selectedRental, setSelectedRental] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenImages, setFullscreenImages] = useState([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [animateContainer, setAnimateContainer] = useState(false);

  // Additional state for Room Modal (Facility modal removed)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomCategory, setRoomCategory] = useState("");
  const [roomImages, setRoomImages] = useState([]);
  const [roomIndex, setRoomIndex] = useState(0);

  // -----------------------------------------------------
  // Inline Style for Modal Content
  // -----------------------------------------------------
  const modalContentStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    color: "var(--bs-modal-color)",
    pointerEvents: "auto",
    backgroundColor: "#f2ede3",
    backgroundClip: "padding-box",
    border: "var(--bs-modal-border-width) solid var(--bs-modal-border-color)",
    borderRadius: "var(--bs-modal-border-radius)",
    outline: 0,
    padding: "25px",
    maxWidth: "500px",
    animation: "modalFadeIn 0.3s ease-out",
  };

  // -----------------------------------------------------
  // Rental Data
  // -----------------------------------------------------
  const rentals = [
    {
      id: 1,
      title: "Room 1",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      monthly: 11000,
      halfMonth: 7500,
      oneWeek: 5000,
      daily: 900,
      availability: "1",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Solo Room",
      features: ["Aircon", "Wifi"],
      note: "Strictly for one occupant. Payment must be made before check-in.",
    },
    {
      id: 2,
      title: "Room 2",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      monthly: 6000,
      halfMonth: 4000,
      oneWeek: 3000,
      daily: 600,
      availability: "2",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Duo Room",
      features: ["Aircon", "Wifi"],
      note: "For two occupants per head. Key deposit may apply.",
    },
    {
      id: 3,
      title: "Room 3",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      monthly: 5000,
      halfMonth: 3800,
      oneWeek: 2500,
      daily: 450,
      availability: "4-6-8",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Triple Room",
      features: ["Aircon", "Wifi"],
      note: "Suitable for 4 to 8 persons per head.",
    },
    {
      id: 4,
      title: "Room 4",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      monthly: 4500,
      halfMonth: 3500,
      oneWeek: 2400,
      daily: 450,
      availability: "10-12",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 4",
      features: ["Aircon", "Wifi"],
      note: "Ideal for 10-12 persons per head.",
    },
    {
      id: 5,
      title: "Room 5",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      monthly: 4500,
      halfMonth: 3300,
      oneWeek: 2300,
      daily: 450,
      availability: "14",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 5",
      features: ["Aircon", "Wifi"],
      note: "For 14 or more persons per head. Rates may vary based on occupancy.",
    },
  ];

  // -----------------------------------------------------
  // Filter Handlers
  // -----------------------------------------------------
  const handleFilterClick = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (type === "price") {
        newFilters.price = prev.price === value ? "All" : value;
      } else if (type === "features") {
        if (newFilters.features.includes(value)) {
          newFilters.features = newFilters.features.filter((f) => f !== value);
        } else {
          newFilters.features = [...newFilters.features, value];
        }
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

  // -----------------------------------------------------
  // Update Filtered Rentals
  // -----------------------------------------------------
  useEffect(() => {
    const filtered = rentals.filter((rental) => {
      const matchesPrice =
        filters.price === "All" ||
        (filters.price === "Below ₱5,000" && rental.oneWeek < 5000) ||
        (filters.price === "₱6,000 - ₱8,000" &&
          rental.oneWeek >= 6000 &&
          rental.oneWeek <= 8000) ||
        (filters.price === "₱9,000 - ₱11,000" &&
          rental.oneWeek >= 9000 &&
          rental.oneWeek <= 11000);

      const matchesFeatures =
        filters.features.length === 0 ||
        filters.features.every((feature) => rental.features.includes(feature));

      const matchesAvailability =
        filters.availability === "" ||
        parseInt(filters.availability) <= parseInt(rental.availability);

      return matchesPrice && matchesFeatures && matchesAvailability;
    });
    setFilteredRentals(filtered);
  }, [filters]);

  // -----------------------------------------------------
  // Animate Container on Filter Change
  // -----------------------------------------------------
  useEffect(() => {
    setAnimateContainer(true);
    const timer = setTimeout(() => {
      setAnimateContainer(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [filters]);

  // -----------------------------------------------------
  // Carousel Handlers
  // -----------------------------------------------------
  const handleCarousel = (rentalId, direction) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[rentalId] || 0;
      const totalImages = rentals.find((r) => r.id === rentalId).images.length;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % totalImages
          : (currentIndex - 1 + totalImages) % totalImages;
      return { ...prev, [rentalId]: newIndex };
    });
  };

  // -----------------------------------------------------
  // Modal & Fullscreen Handlers
  // -----------------------------------------------------
  const openModal = (rental) => {
    console.log("Opening modal for:", rental.title);
    setSelectedRental(rental);
  };
  const closeModal = () => setSelectedRental(null);

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
      (fullscreenIndex - 1 + fullscreenImages.length) % fullscreenImages.length;
    setFullscreenIndex(prevIndex);
    setFullscreenImage(fullscreenImages[prevIndex]);
  };

  // -----------------------------------------------------
  // Room Modal Handlers (using dummy data)
  // -----------------------------------------------------
  const openRoomModal = () => {
    setRoomCategory("Default Room Category");
    setRoomImages(["room1.jpg", "room2.jpg", "room3.jpg"]);
    setRoomIndex(0);
    setRoomModalOpen(true);
  };

  const closeRoomModal = () => setRoomModalOpen(false);

  const nextRoomCategory = () => {
    const categories = ["Default Room Category"];
    const currentIndex = categories.indexOf(roomCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setRoomCategory(categories[nextIndex]);
    setRoomImages(["room1.jpg", "room2.jpg", "room3.jpg"]);
    setRoomIndex(0);
  };

  const prevRoomCategory = () => {
    const categories = ["Default Room Category"];
    const currentIndex = categories.indexOf(roomCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    setRoomCategory(categories[prevIndex]);
    setRoomImages(["room1.jpg", "room2.jpg", "room3.jpg"]);
    setRoomIndex(0);
  };

  const nextRoomImage = () =>
    setRoomIndex((prev) => (prev + 1) % roomImages.length);
  const prevRoomImage = () =>
    setRoomIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));

  // -----------------------------------------------------
  // Render Component
  // -----------------------------------------------------
  return (
    <div className="Units fade-in">
      {/* Filter Bar */}
      <div className="filter-bar fade-in">
        <div className="search-section">
          <h1 className="sea-gold-heading">
            <span className="unit-text">Unit</span>
            <span className="description-text">
              The Room that starts your dream
            </span>
          </h1>
          {/* Search Input with Icon */}
          <div className="search-input" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="search-icon.png"
              alt="Search Icon"
              className="search-icon"
              onClick={() => handleFilterClick("availability", capacityInput)}
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
                  handleFilterClick("availability", capacityInput);
                }
              }}
              min="1"
              max="14"
              style={{ flex: 1 }}
            />
          </div>
        </div>
        {/* Filter Buttons */}
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
          <button
            className={filters.features.includes("Wifi") ? "active" : ""}
            onClick={() => handleFilterClick("features", "Wifi")}
          >
            Wifi / Internet
          </button>
          <button
            className={filters.features.includes("Aircon") ? "active" : ""}
            onClick={() => handleFilterClick("features", "Aircon")}
          >
            Air Conditioned
          </button>
          <button className="clear-button" onClick={clearFilters}>
            ✕
          </button>
        </div>
      </div>

      {/* Rental Cards / No Availability Message */}
      <div id="rental-container" className={animateContainer ? "animate" : ""}>
        {filteredRentals.length > 0 ? (
          filteredRentals.map((rental) => (
            <div key={rental.id} className="rental-card">
              <div className="rental-header">
                <span className="verified-badge">{rental.tag}</span>
                <div className="carousel-container">
                  <button
                    className="carousel-btn prev"
                    onClick={() => handleCarousel(rental.id, "prev")}
                  >
                    &#8592;
                  </button>
                  <div
                    className="carousel-images"
                    style={{
                      transform: `translateX(-${(carouselIndices[rental.id] || 0) * 100}%)`,
                    }}
                  >
                    {rental.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={rental.title}
                        className="rental-image"
                        onClick={() => openFullscreen(rental.images, index)}
                      />
                    ))}
                  </div>
                  <button
                    className="carousel-btn next"
                    onClick={() => handleCarousel(rental.id, "next")}
                  >
                    &#8594;
                  </button>
                </div>
              </div>
              <div className="rental-content">
                <h3 className="rental-title">{rental.title}</h3>
                <p className="rental-inclusion">
                  {`${rental.inclusion} and ${rental.inclusion2}`}
                </p>
                <p className="rental-price">
                  One Week: <strong>₱{rental.oneWeek.toLocaleString()}</strong>
                </p>
                <p className="rental-availability">
                  {rental.availability} Capacity
                </p>
                <button
                  className="details-button"
                  onClick={() => openModal(rental)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="no-availability"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <p>
              Oops! It looks like no rooms are available for your selected capacity.
            </p>
            <img
              src="sad.svg"
              alt="Room Not Available"
              style={{ maxWidth: "200px", width: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Modal for Rental Details */}
      {selectedRental && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={modalContentStyle}
          >
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              {selectedRental.title}
            </h2>
            <p>
              <strong>Inclusions:</strong> {selectedRental.inclusion} and{" "}
              {selectedRental.inclusion2}
            </p>
            <p>
              <strong>Monthly:</strong> ₱{selectedRental.monthly.toLocaleString()}
            </p>
            <p>
              <strong>Half Month:</strong> ₱{selectedRental.halfMonth.toLocaleString()}
            </p>
            <p>
              <strong>One Week:</strong> ₱{selectedRental.oneWeek.toLocaleString()} per week
            </p>
            <p>
              <strong>Daily:</strong> ₱{selectedRental.daily.toLocaleString()}
            </p>
            <p>
              <strong>Capacity:</strong> {selectedRental.availability} persons
            </p>
            {selectedRental.note && (
              <p>
                <strong>Note:</strong> {selectedRental.note}
              </p>
            )}
            {/* Additional Rental Notes */}
            <div className="rental-notes">
              <p>
                <strong>NOTES:</strong>
              </p>
              <p>
                <span style={{ color: "red" }}>Rules</span> on{" "}
                <strong>EXCESS DAYs</strong> in half month & monthly basis, it will be{" "}
                <strong>CHARGE BASE</strong> on Daily Basis Rate; & it SHOULD NOT BE divided
                in 15 or 30 days to come up with daily rate amount.
              </p>
              <p>
                For ALL Half Month Basis{" "}
                <strong style={{ color: "blue" }}>WISHES</strong> to Continue for One Month{" "}
                <strong style={{ color: "blue" }}>SHOULD PAY ₱2,500.00 Additional</strong> & it
                SHOULD NOT BE OVERDUE & NOT the remaining amount of the Monthly rate. <br />
                EXCEPT for Capacity of 1-2 Persons Room. And For this Room should Pay{" "}
                <strong>₱3,500.00</strong>
              </p>
              <p>
                For the <strong style={{ color: "red" }}>OVERDUE</strong> of 1 to 5 days only
                consideration, For Half Month Basis{" "}
                <strong style={{ color: "blue" }}>WISHES</strong> to Continue for One Month{" "}
                <strong style={{ color: "red" }}>
                  SHOULD PAY ONE HALF OF MONTHLY RATE Additional
                </strong>{" "}
                & it SHOULD NOT BE the remaining amount of the Monthly rate.
              </p>
              <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
                Room rates are subject to change without prior noticed.
              </p>
            </div>
            <button className="close-modal" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {roomModalOpen && roomImages.length > 0 && (
        <div className="modal-overlay" onClick={closeRoomModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close-btn" onClick={closeRoomModal}>
              &times;
            </span>
            <h2>{roomCategory}</h2>
            <div className="modal-image-container">
              <button className="arrow-btn left-arrow" onClick={prevRoomImage}>
                &#9665;
              </button>
              <img
                src={`${process.env.PUBLIC_URL}/images/${roomImages[roomIndex]}`}
                alt="Room View"
                className="modal-image"
              />
              <button className="arrow-btn right-arrow" onClick={nextRoomImage}>
                &#9655;
              </button>
            </div>
            <div className="modal-controls">
              <button className="category-btn" onClick={prevRoomCategory}>
                Previous Room
              </button>
              <button className="category-btn" onClick={nextRoomCategory}>
                Next Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Overlay */}
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
