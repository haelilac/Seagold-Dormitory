import React, { useEffect, useState } from 'react';
import './RoomInfo.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { FaDoorOpen, FaUsers, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { FaClock, FaCheckCircle } from 'react-icons/fa';

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
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (!userId) return;
  
    window.Pusher = Pusher;
    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: '865f456f0873a587bc36',
      cluster: 'ap3',
      forceTLS: true,
      authEndpoint: 'https://seagold-laravel-production.up.railway.app/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    });
  
    const channel = window.Echo.private(`tenant.notifications.${userId}`);
    channel.listen('.tenant-notification', (event) => {
      console.log("🔔 Amenity Notification Received:", event);
  
      if (event.type === 'amenity') {
        alert(event.message);
        fetchRequests(); // ✅ refresh amenity requests
      }
    });
  
    return () => {
      window.Echo.leave(`tenant.notifications.${userId}`);
    };
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
    fetchRequests();  // ⭐ Fetch existing amenity requests on load
  }, []);

  // ⭐ Fetch Amenity Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch("https://seagold-laravel-production.up.railway.app/api/amenities/requests", {
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
      const res = await fetch("https://seagold-laravel-production.up.railway.app/api/amenities/request", {
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
        
        // Update local state to show the request instantly
        setRequests(prevRequests => [
          ...prevRequests,
          { amenity_type: finalAmenity, status: 'pending', created_at: new Date().toLocaleDateString() }
        ]);
      } else {
        alert("❌ Failed to submit request.");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  if (loading || !info) return <div className="roominfo-spinner"></div>;

  return (
    <div className="roomCard-wrapper">
      <div className="roomCard-header">Room Information</div>
      <div className="roomCard-container">
        <div className="unitCodeDisplay">{info.unit_code}</div>
        <div className="roomImageGallery">
          {info.images && info.images.length > 0 ? (
            <>
              <img
                src={info.images[0].image_path}
                alt="Main Room"
                className="mainImage"
                onClick={() => setSelectedImage(info.images[0].image_path)}
              />
              <div className="thumbnailGrid">
                {info.images.slice(1, 5).map((img, index) => (
                  <img
                    key={index}
                    src={img.image_path}
                    alt={`Room image ${index + 2}`}
                    onClick={() => setSelectedImage(img.image_path)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <img
                src="https://seagold-laravel-production.up.railway.app/Dorm.jpg"
                alt="Default Room"
                className="mainImage"
              />
            </>
          )}
        </div>

        <div className="roomDetails">
          <div className="infoBlock">
            <FaDoorOpen className="infoIcon" />
            <span className="infoLabel">UNIT TYPE:</span> {info.stay_types?.join(", ") || "N/A"}
          </div>
          <div className="infoBlock">
            <FaUsers className="infoIcon" />
            <span className="infoLabel">CAPACITY:</span> {info.max_capacity} occupants
          </div>
          <div className="infoBlock">
            <FaMoneyBillWave className="infoIcon" />
            <span className="infoLabel">MONTHLY RENT:</span> ₱{info.base_price?.toLocaleString()}
          </div>
          <div className="infoBlock">
            <FaCalendarAlt className="infoIcon" />
            <span className="infoLabel">RENT DUE DATE:</span> 15th of every month
          </div>
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

      {/* New separate container for "Request Additional Amenities" */}
      <div className="amenityRequestContainer">
        <div className="amenityRequestSection">
          <h3>Request Additional Amenities</h3>
          <div className="amenityRequestRow">
            <select
              value={amenityType}
              onChange={(e) => setAmenityType(e.target.value)}
              className="amenitySelect"
            >
              <option value="">-- Select Amenity --</option>
              <option value="Mini Fridge">Mini Fridge</option>
              <option value="Electric Fan">Electric Fan</option>
              <option value="Extra Chair">Extra Chair</option>
            </select>
            <button onClick={handleRequestAmenity} className="requestButton">
              Request Amenity
            </button>
          </div>
        </div>
      </div>

      {/* New container for "My Requests" Table */}
      <div className="myRequestsContainer">
        <h4>My Requests</h4>
        <div className="myRequestsTableContainer">
          <table className="myRequestsTable">
          <thead>
  <tr>
    <th>Amenity Type</th>
    <th>Status</th>
    <th>Date Requested</th>
    <th>Date Approved</th>
  </tr>
</thead>
<tbody>
  {requests.length > 0 ? (
    requests.map((req) => (
      <tr key={req.id}>
        <td>{req.amenity_type}</td>
        <td
          className={
            req.status.toLowerCase() === "pending"
              ? "status-pending"
              : "status-approved"
          }
        >
          {req.status.toLowerCase() === "pending" ? (
            <>
              <FaClock /> <strong>{req.status}</strong>
            </>
          ) : (
            <>
              <FaCheckCircle /> <strong>{req.status}</strong>
            </>
          )}
        </td>
        <td>
          {new Date(req.created_at).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </td>
        <td>
          {req.status.toLowerCase() === "approved" && req.approved_at ? (
            new Date(req.approved_at).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          ) : (
            "—"
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4">No amenity requests yet.</td>
    </tr>
  )}
</tbody>


          </table>
        </div>
      </div>

      {selectedImage && (
        <div className="imageModalOverlay" onClick={() => setSelectedImage(null)}>
          <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="modalImage" />
            <button className="closeModal" onClick={() => setSelectedImage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInfoTenant;