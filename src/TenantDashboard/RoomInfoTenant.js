import React, { useEffect, useState } from 'react';
import './RoomInfo.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";

const RoomInfoTenant = () => {
  const [info, setInfo] = useState(null);
  const { getCachedData, updateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const cached = getCachedData("tenant-room-info");
        if (cached) {
          setInfo(cached);
        } else {
          const res = await fetch("https://seagold-laravel-production.up.railway.app/api/tenant-room-info", {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              Accept: "application/json"
            }
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

  if (loading || !info) return <div className="spinner"></div>;

  return (
    <div className="roomCard-wrapper">
      <div className="roomCard-header">ROOM {info.unit_code}</div>

      <div className="roomCard-container">
        <div className="roomImageGallery">
          {info.images && info.images.length > 0 ? (
            info.images.map((img, index) => (
              <img
                key={index}
                src={img.image_path}
                alt={`Room image ${index + 1}`}
                className="thumbnail"
                onClick={() => setSelectedImage(img.image_path)}
              />
            ))
          ) : (
            <img
              src="https://seagold-laravel-production.up.railway.app/Dorm.jpg"
              alt="Default Room"
              className="thumbnail"
            />
          )}
        </div>

        <div className="roomDetails">
        <div className="infoBlock"><span className="infoLabel">UNIT TYPE:</span> {info.stay_types?.join(", ") || "N/A"}</div>
          <div className="infoBlock"><span className="infoLabel">CAPACITY:</span> {info.max_capacity} occupants</div>
          <div className="infoBlock"><span className="infoLabel">MONTHLY RENT:</span> ₱{info.base_price?.toLocaleString()}</div>
          <div className="infoBlock"><span className="infoLabel">RENT DUE DATE:</span> 15th of every month</div>
        </div>

        <div className="amenitiesSection">
          <h3>AMENITIES:</h3>
          <div className="amenitiesList">
          {Array.isArray(info.amenities) && info.amenities.length > 0 ? (
                info.amenities.map((a, i) => (
                  <div key={i} className="amenityContainer">
                    <span>{a}</span>
                  </div>
                ))
              ) : (
                <p>No amenities listed.</p>
              )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="imageModalOverlay" onClick={() => setSelectedImage(null)}>
          <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="modalImage" />
            <button className="closeModal" onClick={() => setSelectedImage(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInfoTenant;
