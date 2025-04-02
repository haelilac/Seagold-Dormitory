import React from 'react';
import './RoomInfo.css';

const RoomCard = () => {
  const sampleDormImage = 'public/Dorm.jpg';
  const unitIcon = 'public/unit.svg';
  const capacityIcon = 'public/capacity.svg';
  const rentIcon = 'public/rent.svg';
  const dueDateIcon = 'public/due-date.svg';

  // Amenity icons
  const airconIcon = '/aircon.svg';
  const bathIcon = '/bath.svg';
  const wifiIcon = '/wifi.svg';
  const studyIcon = '/study.svg';
  const wardrobeIcon = '/wardrobe.svg';

  return (
    <div className="roomCard-wrapper">
      <div className="roomCard-header">
        ROOM U210
      </div>

      <div className="roomCard-container">
        <div className="roomContent">
          <div className="roomImageContainer">
            <img 
              src={sampleDormImage} 
              alt="Dorm" 
              className="roomImage"
            />
          </div>

          <div className="roomDetails">
            {/* 1) UNIT TYPE */}
            <div className="infoBlock">
              <div className="infoLabel">
                <img src={unitIcon} alt="Unit icon" className="infoIcon" />
                UNIT TYPE:
              </div>
              <div className="infoValue">Direct Air-con Room</div>
            </div>

            {/* 2) CAPACITY */}
            <div className="infoBlock">
              <div className="infoLabel">
                <img src={capacityIcon} alt="Capacity icon" className="infoIcon" />
                CAPACITY:
              </div>
              <div className="infoValue">8 occupants</div>
            </div>

            {/* 3) MONTHLY RENT (Now with ₱ sign) */}
            <div className="infoBlock">
              <div className="infoLabel">
                <img src={rentIcon} alt="Rent icon" className="infoIcon" />
                MONTHLY RENT:
              </div>
              <div className="infoValue">₱5,000</div>
            </div>

            {/* 4) RENT DUE DATE */}
            <div className="infoBlock">
              <div className="infoLabel">
                <img src={dueDateIcon} alt="Due date icon" className="infoIcon" />
                RENT DUE DATE:
              </div>
              <div className="infoValue">15th of every month</div>
            </div>
          </div>
        </div>

        <div className="amenitiesSection">
          <h3>AMENITIES:</h3>
          <div className="amenitiesList">
            <div className="amenityContainer">
              <img src={airconIcon} alt="Aircon" className="amenityIcon" />
              <span>Air Conditioning</span>
            </div>
            <div className="amenityContainer">
              <img src={bathIcon} alt="Bathroom" className="amenityIcon" />
              <span>Private Bathroom</span>
            </div>
            <div className="amenityContainer">
              <img src={wifiIcon} alt="Wi-Fi" className="amenityIcon" />
              <span>Wi-Fi</span>
            </div>
            <div className="amenityContainer">
              <img src={studyIcon} alt="Study Table" className="amenityIcon" />
              <span>Study Table</span>
            </div>
            <div className="amenityContainer">
              <img src={wardrobeIcon} alt="Wardrobe" className="amenityIcon" />
              <span>Wardrobe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
