import React from 'react';
import './RoomInfo.css';
import { useDataCache } from "../contexts/DataContext";

const RoomInfoTenant = () => {
  const [info, setInfo] = useState(null);
  const { getCachedData, updateCache } = useDataCache();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const cached = getCachedData("tenant-room-info");
        if (cached) {
          setInfo(cached);
        } else {
          const res = await fetch("https://seagold-laravel-production.up.railway.app/api/room-info", {
            headers: { Accept: "application/json" },
          });
          const data = await res.json();
          setInfo(data);
          updateCache("tenant-room-info", data);
        }
      } catch (err) {
        console.error("Error fetching room info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomInfo();
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="roomCard-wrapper">
      <div className="roomCard-header">
        ROOM U210
      </div>

      <div className="roomCard-container">
        <div className="roomContent">
          <div className="roomImageContainer">
            <img 
              src="https://seagold-laravel-production.up.railway.app/Dorm.jpg" 
              alt="Dorm" 
              className="roomImage"
              style={{ cursor: 'default' }}
            />
          </div>

          <div className="roomDetails">
            <div className="infoBlock">
              <div className="infoLabel">
                <img 
                  src="https://seagold-laravel-production.up.railway.app/unit.svg" 
                  alt="Unit icon" 
                  className="infoIcon" 
                  style={{ cursor: 'default' }}
                />
                UNIT TYPE:
              </div>
              <div className="infoValue">Direct Air-con Room</div>
            </div>

            <div className="infoBlock">
              <div className="infoLabel">
                <img 
                  src="https://seagold-laravel-production.up.railway.app/capacity.svg" 
                  alt="Capacity icon" 
                  className="infoIcon" 
                />
                CAPACITY:
              </div>
              <div className="infoValue">8 occupants</div>
            </div>

            <div className="infoBlock">
              <div className="infoLabel">
                <img 
                  src="https://seagold-laravel-production.up.railway.app/rent.svg" 
                  alt="Rent icon" 
                  className="infoIcon" 
                />
                MONTHLY RENT:
              </div>
              <div className="infoValue">₱5,000</div>
            </div>

            <div className="infoBlock">
              <div className="infoLabel">
                <img 
                  src="https://seagold-laravel-production.up.railway.app/due-date.svg" 
                  alt="Due date icon" 
                  className="infoIcon" 
                />
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
              <img 
                src="https://seagold-laravel-production.up.railway.app/aircon.svg" 
                alt="Aircon" 
                className="amenityIcon" 
              />
              <span>Air Conditioning</span>
            </div>
            <div className="amenityContainer">
              <img 
                src="https://seagold-laravel-production.up.railway.app/bath.svg" 
                alt="Bathroom" 
                className="amenityIcon" 
              />
              <span>Private Bathroom</span>
            </div>
            <div className="amenityContainer">
              <img 
                src="https://seagold-laravel-production.up.railway.app/wifi.svg" 
                alt="Wi-Fi" 
                className="amenityIcon" 
              />
              <span>Wi-Fi</span>
            </div>
            <div className="amenityContainer">
              <img 
                src="https://seagold-laravel-production.up.railway.app/study.svg" 
                alt="Study Table" 
                className="amenityIcon" 
              />
              <span>Study Table</span>
            </div>
            <div className="amenityContainer">
              <img 
                src="https://seagold-laravel-production.up.railway.app/wardrobe.svg" 
                alt="Wardrobe" 
                className="amenityIcon" 
              />
              <span>Wardrobe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
