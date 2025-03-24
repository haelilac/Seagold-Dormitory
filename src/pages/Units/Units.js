import React, { useEffect, useState } from "react";
import "./Units.css";
import RoomDetails from "./RoomDetails";


const Units = () => {
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [filters, setFilters] = useState({
    price: "All",
    features: [],
    availability: "",
  });
  const [carouselIndices, setCarouselIndices] = useState({});
  const [selectedRental, setSelectedRental] = useState(null); // Modal State

  const rentals = [
    {
      id: 1,
      title: "Solo Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 11000,
      availability: "1",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 1",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 2,
      title: "Duo Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 6000,
      availability: "2",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 2",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 3,
      title: "Quadro Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 5000,
      availability: "4",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 3",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 4,
      title: "Sixto Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 7000,
      availability: "6",
      images: ["Room4.jpg", "Room5.jpg", "Room6.jpg"],
      tag: "Room 4",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 5,
      title: "Otso Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 8000,
      availability: "8",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 5",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 6,
      title: "XL Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 4500,
      availability: "12",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 6",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 7,
      title: "Large Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 3500,
      availability: "14",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 7",
      features: ["Aircon", "Wifi"],
    },
    {
      id: 8,
      title: "Mega Room",
      inclusion: "Air Conditioned",
      inclusion2: "Wifi",
      price: 10000,
      availability: "10",
      images: ["Room1.jpg", "Room2.jpg", "Room3.jpg"],
      tag: "Room 8",
      features: ["Aircon", "Wifi"],
    },
  ];

  const handleFilterClick = (type, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (type === "price") {
        newFilters.price = prev.price === value ? "All" : value;
      } else if (type === "features") {
        newFilters.features = prev.features.includes(value)
          ? prev.features.filter((feature) => feature !== value)
          : [...prev.features, value];
      } else if (type === "availability") {
        newFilters.availability = value;
      }
      return newFilters;
    });
  };

  useEffect(() => {
    const filtered = rentals.filter((rental) => {
      const matchesPrice =
        filters.price === "All" ||
        (filters.price === "Below ₱5,000" && rental.price < 5000) ||
        (filters.price === "₱6,000 - ₱8,000" && rental.price >= 6000 && rental.price <= 8000) ||
        (filters.price === "₱9,000 - ₱11,000" && rental.price >= 9000 && rental.price <= 11000);

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

  const openModal = (rental) => setSelectedRental(rental);
  const closeModal = () => setSelectedRental(null);

  return (
    <div className="Units">
      <div className="filter-bar">
        <div className="search-section">
          <h1 className="sea-gold-heading">
            <span className="unit-text">Unit</span>
            <span className="description-text">The Room that starts your dream</span>
          </h1>
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="number"
              placeholder="Insert the quantity of people"
              onChange={(e) => handleFilterClick("availability", e.target.value)}
              min="1"
              max="14"
            />
          </div>
        </div>
        <div className="filters">
          <button onClick={() => handleFilterClick("price", "Below ₱5,000")}>Below ₱5,000</button>
          <button onClick={() => handleFilterClick("price", "₱6,000 - ₱8,000")}>
            ₱6,000 to ₱8,000
          </button>
          <button onClick={() => handleFilterClick("price", "₱9,000 - ₱11,000")}>
            ₱9,000 to ₱11,000
          </button>
          <button onClick={() => handleFilterClick("features", "Wifi")}>Wifi / Internet</button>
          <button onClick={() => handleFilterClick("features", "Aircon")}>Air Conditioned</button>
        </div>
      </div>

      <div id="rental-container">
        {filteredRentals.map((rental) => (
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
                  style={{ transform: `translateX(-${(carouselIndices[rental.id] || 0) * 100}%)` }}
                >
                  {rental.images.map((image, index) => (
                    <img key={index} src={image} alt={rental.title} className="rental-image" />
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
              <p className="rental-inclusion">{`${rental.inclusion} and ${rental.inclusion2}`}</p>
              <p className="rental-price">
                Starts at <strong>₱{rental.price.toLocaleString()}</strong>
              </p>
              <p className="rental-availability">{rental.availability} Capacity</p>
              <button className="details-button" onClick={() => openModal(rental)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRental && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <RoomDetails rental={selectedRental} />
            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default Units;
