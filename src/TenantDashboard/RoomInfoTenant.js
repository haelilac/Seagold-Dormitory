import React, { useEffect, useState } from 'react';
import './RoomInfo.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";

const RoomInfoTenant = () => {
  const [info, setInfo] = useState(null);
  const { getCachedData, updateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // ⭐ States for Amenity Requests
  const [amenityType, setAmenityType] = useState('');
  const [otherAmenity, setOtherAmenity] = useState(''); // ⭐ NEW
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const cached = getCachedData("tenant-room-info");
        if (cached) {
          setInfo(cached);
        } else {
          const res = await fetch("http://localhost:8000/api/tenant-room-info", {
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
    fetchRequests();  // ⭐ Fetch existing amenity requests on load
  }, []);

  // ⭐ Fetch Amenity Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/amenities/requests", {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching amenity requests:", err);
    }
  };

  // ⭐ Handle Amenity Request Submission
  const handleRequestAmenity = async () => {
    const finalAmenity = amenityType === "Others" ? otherAmenity : amenityType;

    if (!finalAmenity.trim()) {
      return alert("Please select or specify an amenity!");
    }

    try {
      const res = await fetch("http://localhost:8000/api/amenities/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ amenity_type: finalAmenity })
      });
      if (res.ok) {
        alert("✅ Amenity request submitted!");
        setAmenityType('');
        setOtherAmenity('');
        fetchRequests();
      } else {
        alert("❌ Failed to submit request.");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

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
              src="http://localhost:8000/Dorm.jpg"
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

        {/* ⭐ Amenity Request Section */}
        <div className="amenityRequestSection">
          <h3>Request Additional Amenities</h3>

          <select value={amenityType} onChange={(e) => setAmenityType(e.target.value)}>
            <option value="">-- Select Amenity --</option>
            <option value="Mini Fridge">Mini Fridge</option>
            <option value="Electric Fan">Electric Fan</option>
            <option value="Extra Chair">Extra Chair</option>
            <option value="Extra Mattress">Extra Mattress</option>
            <option value="Air Conditioner">Air Conditioner</option>
            <option value="Microwave">Microwave</option>
            <option value="Water Dispenser">Water Dispenser</option>
            <option value="TV">TV</option>
            
            <option value="Others">Others (Specify)</option> {/* ⭐ Added "Others" option */}
          </select>

          {/* ⭐ Show text input only if "Others" selected */}
          {amenityType === "Others" && (
            <input
              type="text"
              placeholder="Specify other amenity"
              value={otherAmenity}
              onChange={(e) => setOtherAmenity(e.target.value)}
              style={{ marginTop: "10px", padding: "8px", width: "100%" }}
            />
          )}

          <button onClick={handleRequestAmenity} style={{ marginTop: "10px" }}>
            Request Amenity
          </button>

          <h4>My Requests</h4>
          <ul>
            {requests.length > 0 ? (
              requests.map(req => (
                <li key={req.id}>
                  {req.amenity_type} - <strong>{req.status}</strong>
                </li>
              ))
            ) : (
              <p>No amenity requests yet.</p>
            )}
          </ul>
        </div>
      </div>

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
