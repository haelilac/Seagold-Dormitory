import React, { useEffect, useState } from 'react';
import { getAuthToken } from "../utils/auth";
import './AmenityRequestsAdmin.css';

const AmenityRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:8000'
    : 'https://seagold-laravel-production.up.railway.app';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/amenities/requests`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${BASE_URL}/api/amenities/${action}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      if (res.ok) {
        alert(`Request ${action}d successfully!`);
        // Update the request state to reflect the approved date
        const updatedRequests = requests.map(req => {
          if (req.id === id && action === 'approve') {
            req.status = 'approved';
            req.approved_at = new Date().toLocaleDateString(); // Set approved_at when approved
          }
          return req;
        });
        setRequests(updatedRequests); // Update local state
      } else {
        alert("Action failed.");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  if (loading) return <div className="amenity-spinner"></div>;

  return (
    <div className="amenity-requests-admin">
      <h2>Amenity Requests</h2>
      {requests.length === 0 ? (
        <p>No amenity requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Amenity</th>
              <th>Status</th>
              <th>Date Requested</th> {/* ✅ NEW */}
              <th>Date Approved</th>  {/* ✅ NEW */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.tenant?.name || 'N/A'}</td>
                <td>{req.amenity_type}</td>
                <td>{req.status}</td>
                <td>{req.created_at || '—'}</td> {/* 🟢 Formatted from backend */}
                <td>{req.approved_at || '—'}</td> {/* 🟢 Null-safe */}
                <td>
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleAction(req.id, 'approve')}>Approve</button>
                      <button onClick={() => handleAction(req.id, 'reject')}>Reject</button>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AmenityRequestsAdmin;
