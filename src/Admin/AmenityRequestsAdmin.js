import React, { useEffect, useState } from 'react';
import { getAuthToken } from "../utils/auth";
import './AmenityRequestsAdmin.css';

const AmenityRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("https://seagold-laravel-production.up.railway.app/api/amenities/requests", {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/amenities/${action}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        alert(`Request ${action}d successfully!`);
        fetchRequests();
      } else {
        alert("Action failed.");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  return (
    <div className="amenity-requests-admin">
      <h2>Amenity Requests Management</h2>
      {requests.length === 0 ? (
        <p>No amenity requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Amenity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.tenant?.name || 'N/A'}</td>
                <td>{req.amenity_type}</td>
                <td>{req.status}</td>
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
