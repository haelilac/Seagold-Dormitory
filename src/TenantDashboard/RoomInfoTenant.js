import React from 'react';
import './RoomInfo.css';

const RoomCard = () => {
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  // Main room image
  const sampleDormImage = 'https://seagold-laravel-production.up.railway.app/Dorm.jpg';

  // Info icons
  const unitIcon = 'https://seagold-laravel-production.up.railway.app/unit.svg';
  const capacityIcon = 'https://seagold-laravel-production.up.railway.app/capacity.svg';
  const rentIcon = 'https://seagold-laravel-production.up.railway.app/rent.svg';
  const dueDateIcon = 'https://seagold-laravel-production.up.railway.app/due-date.svg';

  // Amenity icons
  const airconIcon = 'https://seagold-laravel-production.up.railway.app/aircon.svg';
  const bathIcon = 'https://seagold-laravel-production.up.railway.app/bath.svg';
  const wifiIcon = 'https://seagold-laravel-production.up.railway.app/wifi.svg';
  const studyIcon = 'https://seagold-laravel-production.up.railway.app/study.svg';
  const wardrobeIcon = 'https://seagold-laravel-production.up.railway.app/wardrobe.svg';

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
            <div className="infoBlock">
              <div className="infoLabel">
                <img src={unitIcon} alt="Unit icon" className="infoIcon" />
                UNIT TYPE:
              </div>
              <div className="infoValue">Direct Air-con Room</div>
            </div>

            <div className="infoBlock">
              <div className="infoLabel">
                <img src={capacityIcon} alt="Capacity icon" className="infoIcon" />
                CAPACITY:
              </div>
              <div className="infoValue">8 occupants</div>
            </div>

            <div className="infoBlock">
              <div className="infoLabel">
                <img src={rentIcon} alt="Rent icon" className="infoIcon" />
                MONTHLY RENT:
              </div>
              <div className="infoValue">₱5,000</div>
            </div>

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
