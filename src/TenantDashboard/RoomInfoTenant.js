import React from 'react';
import './RoomInfo.css';

// Importing images properly
import sampleDormImage from '../images/dormpic1.jpg';
import unitIcon from '../images/unit.svg';
import capacityIcon from '../images/capacity.svg';
import rentIcon from '../images/rent.svg';
import dueDateIcon from '../images/due-date.svg';

// Amenity icons
import airconIcon from '../images/aircon.svg';
import bathIcon from '../images/bath.svg';
import wifiIcon from '../images/wifi.svg';
import studyIcon from '../images/study.svg';
import wardrobeIcon from '../images/wardrobe.svg';

const RoomCard = () => {
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

            {/* 3) MONTHLY RENT */}
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
