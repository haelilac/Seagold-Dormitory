import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './MaintenanceRequests.css';

const MaintenanceRequests = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [schedule, setSchedule] = useState(''); // Schedule date and time

    // Fetch Maintenance Requests
    useEffect(() => {
        const fetchMaintenanceRequests = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/maintenance-requests', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch maintenance requests.');

                const data = await response.json();
                setMaintenanceRequests(data);
            } catch (err) {
                console.error(err.message);
                setError('Failed to load maintenance requests. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenanceRequests();
    }, []);

    // Handle Row Click to Open Modal
    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setSchedule('');
    };

    // Update Maintenance Request Status
    const updateStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8000/api/maintenance-requests/${id}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) throw new Error('Failed to update status.');

            setMaintenanceRequests((prev) =>
                prev.map((req) => (req.id === id ? { ...req, status } : req))
            );

            alert(`Status updated to "${status}" successfully.`);
            closeModal();
        } catch (error) {
            console.error('Error updating status:', error.message);
            alert('Error updating status.');
        }
    };
    // Update Maintenance Request Status
    const handleRemove = async (id) => {
        if (window.confirm('Are you sure you want to delete this maintenance request?')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/maintenance-requests/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json',
                    },
                });
    
                if (!response.ok) throw new Error('Failed to delete maintenance request.');
    
                // Remove the deleted request from the state
                setMaintenanceRequests((prev) => prev.filter((req) => req.id !== id));
                alert('Maintenance request deleted successfully.');
            } catch (error) {
                console.error('Error:', error.message);
                alert('Failed to delete the maintenance request.');
            }
        }
    };
    
    // Schedule Maintenance
    const scheduleMaintenance = async () => {
        const formattedSchedule = schedule; // Use the datetime-local format directly

        try {
            const response = await fetch(
                `http://localhost:8000/api/maintenance-requests/${selectedRequest.id}/schedule`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ schedule: formattedSchedule }),
                }
            );
    
            if (!response.ok) throw new Error('Failed to schedule maintenance.');
    
            setMaintenanceRequests((prev) =>
                prev.map((req) =>
                    req.id === selectedRequest.id
                        ? { ...req, schedule: formattedSchedule, status: 'scheduled' }
                        : req
                )
            );
    
            alert('Maintenance scheduled successfully.');
            closeModal();
        } catch (error) {
            console.error('Error scheduling maintenance:', error.message);
            alert('Failed to schedule maintenance.');
        }
    };
    
    return (
        <div>
            <h2>Maintenance Requests</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Unit Code</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenanceRequests.map((request) => (
                            <tr 
                                key={request.id} 
                                onClick={() => handleRowClick(request)} // Attach the function here
                                style={{ cursor: 'pointer' }} // Change cursor to indicate interactivity
                            >
                                <td>{request.id}</td>
                                <td>{request.user.name}</td>
                                <td>{request.unit_code || 'N/A'}</td>
                                <td>{request.description}</td>
                                <td style={{ color: request.status === 'cancelled' ? 'red' : 'black' }}>
                                    {request.status}
                                </td>
                                <td>
                                    {/* Show Remove Button only for canceled requests */}
                                    {request.status === 'canceled' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering row click event
                                                handleRemove(request.id);
                                            }}
                                            className="remove-button"
                                            style={{ backgroundColor: 'red', color: 'white', border: 'none' }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                ariaHideApp={false}
                className="custom-modal"
                overlayClassName="custom-overlay"
                shouldCloseOnOverlayClick={true}
            >
                {selectedRequest && (
                    <div className="modal-content">
                        <h2>Maintenance Request Details</h2>
                        <div className="modal-body">
                            <p><strong>ID:</strong> {selectedRequest.id}</p>
                            <p><strong>User Name:</strong> {selectedRequest.user.name}</p>
                            <p><strong>Unit Code:</strong> {selectedRequest.user.unit_code}</p>
                            <p><strong>Description:</strong> {selectedRequest.description}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>
                            <p><strong>Schedule:</strong> {selectedRequest.schedule || 'N/A'}</p>

                            {/* Display Uploaded File */}
                            {selectedRequest.file_path && (
                                <div className="file-preview">
                                    <strong>Attached File:</strong>
                                    {selectedRequest.file_path.match(/\.(jpeg|jpg|png)$/i) ? (
                                        <img
                                            src={`http://localhost:8000/storage/${selectedRequest.file_path}`}
                                            alt="Uploaded"
                                            className="file-image"
                                        />
                                    ) : selectedRequest.file_path.match(/\.(mp4|mov)$/i) ? (
                                        <video controls className="file-video">
                                            <source
                                                src={`http://localhost:8000/storage/${selectedRequest.file_path}`}
                                                type="video/mp4"
                                            />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <a
                                            href={`http://localhost:8000/storage/${selectedRequest.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <button className="open-file-button">Open File</button>
                                        </a>
                                    )}
                                </div>
                            )}

                            {selectedRequest.status === 'canceled' && (
                                <p style={{ color: 'red', fontWeight: 'bold' }}>
                                    This maintenance request was canceled by the tenant.
                                </p>
                            )}

                            {/* Schedule Input */}
                            <label>
                                <strong>Schedule Maintenance:</strong>
                                <input
                                    type="datetime-local"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    
                                />
                            </label>
                            
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => updateStatus(selectedRequest.id, 'completed')}>
                                Mark as Completed
                            </button>
                            <button onClick={() => updateStatus(selectedRequest.id, 'canceled')}>
                                Cancel Report
                            </button>
                            <button onClick={scheduleMaintenance}>Schedule</button>
                            <button className="close-button" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MaintenanceRequests;
