import React from 'react';
import './RoomInfo.css';

const RoomCard = () => {
  // Replace with your own image path
  const sampleDormImage = '/dormpic1.jpg';

  // Example icon paths (replace with your actual icons)
  const unitIcon = '/unit.png';
  const capacityIcon = '/capacity.png';
  const rentIcon = '/rent.png';
  const dueDateIcon = '/due-date.png';

  // Amenity icons (example)
  const airconIcon = '/aircon.png';
  const bathIcon = '/bath.png';
  const wifiIcon = '/wifi.png';
  const studyIcon = '/study.png';
  const wardrobeIcon = '/wardrobe.png';

  return (
    <div className="roomCard-wrapper">
      {/* Header */}
      <div className="roomCard-header">
        ROOM U210
      </div>

      {/* Main Content Area */}
      <div className="roomContent">
        {/* Left Column: Image */}
        <div className="roomImageContainer">
          <img 
            src={sampleDormImage} 
            alt="Dorm" 
            className="roomImage"
          />
        </div>

        {/* Right Column: Details (with icons beside each label) */}
        <div className="roomDetails">
          {/* 1) UNIT TYPE */}
          <div className="infoBlock">
            <div className="infoLabel">
              <img 
                src={unitIcon} 
                alt="Unit icon" 
                className="infoIcon"
              />
              UNIT TYPE:
            </div>
            <div className="infoValue">Direct Air-con Room</div>
          </div>

          {/* 2) CAPACITY */}
          <div className="infoBlock">
            <div className="infoLabel">
              <img 
                src={capacityIcon} 
                alt="Capacity icon" 
                className="infoIcon"
              />
              CAPACITY:
            </div>
            <div className="infoValue">8 occupants</div>
          </div>

          {/* 3) MONTHLY RENT */}
          <div className="infoBlock">
            <div className="infoLabel">
              <img 
                src={rentIcon} 
                alt="Rent icon" 
                className="infoIcon"
              />
              MONTHLY RENT:
            </div>
            <div className="infoValue">5,000</div>
          </div>

          {/* 4) RENT DUE DATE */}
          <div className="infoBlock">
            <div className="infoLabel">
              <img 
                src={dueDateIcon} 
                alt="Due date icon" 
                className="infoIcon"
              />
              RENT DUE DATE:
            </div>
            <div className="infoValue">15th of every month</div>
          </div>
        </div>
      </div>

      {/* Amenities Section (Horizontal, with icons) */}
      <div className="amenitiesSection">
        <h3>AMENITIES:</h3>
        <ul className="amenitiesList">
          <li>
            <img src={airconIcon} alt="Aircon" className="amenityIcon" />
            Air Conditioning
          </li>
          <li>
            <img src={bathIcon} alt="Bathroom" className="amenityIcon" />
            Private Bathroom
          </li>
          <li>
            <img src={wifiIcon} alt="Wi-Fi" className="amenityIcon" />
            Wi-Fi
          </li>
          <li>
            <img src={studyIcon} alt="Study Table" className="amenityIcon" />
            Study Table
          </li>
          <li>
            <img src={wardrobeIcon} alt="Wardrobe" className="amenityIcon" />
            Wardrobe
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RoomCard;
