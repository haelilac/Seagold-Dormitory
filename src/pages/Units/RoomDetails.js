import React, { useState } from "react";
import "./RoomDetails.css";

const RoomDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Open the modal and display the clicked image
  const openModal = (imageSrc) => {
    setCurrentImage(imageSrc); // Set the clicked image as the source
    setIsModalOpen(true); // Show the modal
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Hide the modal
  };

  return (
    <div className="room-details-container">
      {/* Image Gallery Section */}
      <div className="room-header">
        <div className="image-gallery">
          <div className="side-images">
            <img
              src="Room1.jpg"
              alt="Side 1"
              onClick={() => openModal("Room1.jpg")}
            />
            <img
              src="Room2.jpg"
              alt="Side 2"
              onClick={() => openModal("Room2.jpg")}
            />
            <img
              src="Room3.jpg"
              alt="Side 3"
              onClick={() => openModal("Room3.jpg")}
            />
            <img
              src="Room4.jpg"
              alt="Side 4"
              onClick={() => openModal("Room4.jpg")}
            />
          </div>
        </div>
      </div>

      {/* Room Information Section */}
      <div className="room-info">
        <h1 className="room-title">Room 1</h1>
        <h3>Unit 1 Room 1 Person(s)</h3>
        <p className="room-address">
          FERN (Amsir) Bldg, 827 P. Paredes Cor. S.H. Loyola Sts., Sampaloc,
          Manila
        </p>
        <p className="room-contact">
          <img
            src="phone-icon.png"
            alt="Phone Icon"
            className="phone-icon"
          />
          <strong>Tel. #:</strong> (02) 8579-5709 / 0922-5927385
        </p>
        <p className="description-title">Description</p>
        <p className="room-description">
          Experience a vibrant student community with modern amenities and
          unbeatable convenience.
        </p>

        {/* Highlights Section */}
        <h4 className="highlights-title">Highlights</h4>
        <div className="highlights">
          <div className="highlight-item">
            <img
              src="locker-icon.png"
              alt="Room Locker"
              className="highlight-icon"
            />
            <span>Room Locker</span>
          </div>
          <div className="highlight-item">
            <img
              src="wifi-icon.png"
              alt="Wi-Fi"
              className="highlight-icon"
            />
            <span>Wi-Fi</span>
          </div>
          <div className="highlight-item">
            <img
              src="ac-icon.png"
              alt="Air Conditioner"
              className="highlight-icon"
            />
            <span>Air Conditioner</span>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="amenities-section">
          <h4 className="amenities-title">Amenities</h4>
          <div className="amenities-list">
            <div className="amenity-item">
              <img
                src="wifi-icon.png"
                alt="Wi-Fi"
                className="amenity-icon"
              />
              <span>Wi-Fi</span>
            </div>
            <div className="amenity-item">
              <img
                src="studyhall-icon.png"
                alt="Study Hall"
                className="amenity-icon"
              />
              <span>Study Hall</span>
            </div>
            <div className="amenity-item">
              <img
                src="canteen-icon.png"
                alt="Canteen"
                className="amenity-icon"
              />
              <span>Canteen</span>
            </div>
            <div className="amenity-item">
              <img
                src="printer-icon.png"
                alt="Printer and Xerox Shop"
                className="amenity-icon"
              />
              <span>Printer and Xerox Shop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms Section */}
      <div className="payment-terms">
        <h4>Payment Terms:</h4>
        <p>
          Monthly: <strong>₱11,000.00</strong>
        </p>
        <p>
          Half Month: <strong>₱7,500.00</strong>
        </p>
        <p>
          One Week: <strong>₱5,000.00</strong>
        </p>
        <p>
          Daily: <strong>₱900.00</strong>
        </p>
      </div>

      {/* Notes Section */}
      <div className="room-notes">
        <h4>Notes:</h4>
        <p>
          <strong>Rules on Excess Days:</strong> Charges apply on a daily basis.
        </p>
        <p>
          <strong>Capacity:</strong> Additional ₱3,500 for 1-2 Persons Room.
        </p>
      </div>

      {/* Modal for Full-Size Image */}
      {isModalOpen && (
        <div className="image-modal">
          <button className="close-btn" onClick={closeModal}>
            X
          </button>
          <img src={currentImage} alt="Full-Size View" />
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
