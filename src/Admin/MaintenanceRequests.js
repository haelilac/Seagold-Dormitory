import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './MaintenanceRequests.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from '../contexts/DataContext';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Pusher and Echo
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '865f456f0873a587bc36',
    cluster: 'ap3',
    forceTLS: true,
    authEndpoint: 'https://seagold-laravel-production.up.railway.app/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    }
  });

const MaintenanceRequests = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [schedule, setSchedule] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterUnitCode, setFilterUnitCode] = useState('');
    const { getCachedData, updateCache } = useDataCache();
    const categories = [
        'Water Leak / Plumbing', 'Electrical Issue', 'Bathroom Problem', 'Flooring / Tiles',
        'Appliances', 'Furniture', 'Air Conditioning / Ventilation', 'Internet / WiFi',
        'Door / Window', 'Lighting', 'Others'
    ];
    const [selectedFile, setSelectedFile] = useState(null);
    const statuses = ['pending', 'scheduled', 'completed', 'cancelled'];
    // Fetch Maintenance Requests
    useEffect(() => {
        const cached = getCachedData('maintenance_requests');
        if (cached?.length > 0) {
            setMaintenanceRequests(cached);
            setLoading(false);
            return;
        }

        const fetchMaintenanceRequests = async () => {
            try {
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/maintenance-requests', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });
        
                if (!response.ok) throw new Error('Failed to fetch maintenance requests.');
        
                const data = await response.json();
                setMaintenanceRequests(data);
                updateCache('maintenance_requests', data);
            } catch (err) {
                console.error(err.message);
                setError('Failed to load maintenance requests. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        

        fetchMaintenanceRequests();
    }, []);

    // Real-time Listeners
    useEffect(() => {
        document.body.style.overflow = "auto";

        const maintenanceChannel = window.Echo.private('admin.maintenance');
        maintenanceChannel.listen('.new.maintenance', (e) => {
            console.log('🔧 New maintenance request received:', e.request);
            const updated = [...(getCachedData('maintenance_requests') || []), e.request];
            setMaintenanceRequests(updated);
            updateCache('maintenance_requests', updated);
        });

        const notificationChannel = window.Echo.private('admin.notifications');
        notificationChannel.listen('.admin.notification', (e) => {
            console.log("📢 Notification Received:", e);
        
            if (e.type === 'maintenance_follow_up') {
                alert(`🚨 Follow-Up Alert: ${e.message}`);
            } else if (e.type === 'maintenance_request') {
                alert(`🛠️ New Maintenance Request: ${e.message}`);
            }
        });

        return () => {
            window.Echo.leaveChannel('private-admin.maintenance');
            window.Echo.leaveChannel('private-admin.notifications');
        };
    }, []);

    // Modal Handlers
    const handleRowClick = (request) => {
        console.log("Selected Request:", request);
        setSelectedRequest(request);
        setSchedule('');
        if (request.files && request.files.length > 0) {
            setSelectedFile(request.files[0].file_path); // 👈 Auto-select first file
        } else {
            setSelectedFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedFile(null);
        setIsModalOpen(false);
        setSelectedRequest(null);
        setSchedule('');
    };

    // API Actions
    const updateStatus = async (id, status) => {
        try {
            console.log("Sending update status:", { id, status });
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${id}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ status }),
            });
    
            if (!response.ok) throw new Error('Failed to update status.');
    
            const updatedRequests = maintenanceRequests.map((req) =>
                req.id === id ? { ...req, status } : req
            );
    
            setMaintenanceRequests(updatedRequests);
            updateCache('maintenance_requests', updatedRequests);  // ✅ Update cache
    
            alert(`Status updated to "${status}" successfully.`);
            closeModal();
        } catch (error) {
            console.error('Error updating status:', error.message);
            alert('Error updating status.');
        }
    };
    

    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;
    
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                },
            });
    
            if (!response.ok) throw new Error('Failed to delete maintenance request.');
    
            const updatedRequests = maintenanceRequests.filter((req) => req.id !== id);
            setMaintenanceRequests(updatedRequests);
            updateCache('maintenance_requests', updatedRequests);  // ✅ Update cache
    
            alert('Maintenance request deleted successfully.');
        } catch (error) {
            console.error('Error:', error.message);
            alert('Failed to delete the maintenance request.');
        }
    };
    

    const scheduleMaintenance = async () => {
        try {
            const response = await fetch(
                `https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${selectedRequest.id}/schedule`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ schedule }),
                }
            );
    
            if (!response.ok) throw new Error('Failed to schedule maintenance.');
    
            const updatedRequests = maintenanceRequests.map((req) =>
                req.id === selectedRequest.id
                    ? { ...req, schedule, status: 'scheduled' }
                    : req
            );
    
            setMaintenanceRequests(updatedRequests);
            updateCache('maintenance_requests', updatedRequests);  // ✅ Update cache
    
            alert('Maintenance scheduled successfully.');
            closeModal();
        } catch (error) {
            console.error('Error scheduling maintenance:', error.message);
            alert('Failed to schedule maintenance.');
        }
    };
    

    // Render File Preview
    const renderFilePreview = () => {
        if (!selectedFile || typeof selectedFile !== 'string' || !selectedFile.trim()) return (
            <p style={{ color: 'gray' }}>No file to preview.</p>
        );
    
        const isImage = selectedFile.match(/\.(jpeg|jpg|png)$/i);
        const isVideo = selectedFile.match(/\.(mp4|webm|ogg)$/i);
    
        if (isImage) {
            return <img src={selectedFile} alt="Uploaded File" style={{ maxWidth: '100%' }} />;
        } else if (isVideo) {
            return (
                <video controls style={{ maxWidth: '100%' }}>
                    <source src={selectedFile} />
                    Your browser does not support the video tag.
                </video>
            );
        } else {
            return <p style={{ color: 'red' }}>⚠️ Unsupported file type</p>;
        }
    };
    
    
    
    return (
        <div className="filters">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Filter by Unit Code"
                value={filterUnitCode}
                onChange={(e) => setFilterUnitCode(e.target.value)}
            />


        <div className="maintenance-requests">
            <h2>Maintenance Requests</h2>
            {loading ? (
                <div className="maintenancerequests-spinner"></div>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Unit Code</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {maintenanceRequests
                        .filter((req) => 
                            (filterCategory ? req.category === filterCategory : true) &&
                            (filterStatus ? req.status === filterStatus : true) &&
                            (filterUnitCode ? req.unit_code?.toLowerCase().includes(filterUnitCode.toLowerCase()) : true)
                        )
                        .map((request) => (
                            <tr
                                key={request.id}
                                onClick={() => handleRowClick(request)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{request.user.name}</td>
                                <td>{request.unit_code || 'N/A'}</td>
                                <td>{request.category}</td>
                                <td>{request.description}</td>
                                <td style={{ color: request.status === 'cancelled' ? 'red' : 'black' }}>
                                    {request.status}
                                </td>
                                <td>
                                    {request.status === 'cancelled' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(request.id);
                                            }}
                                            className="remove-button"
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
    
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                ariaHideApp={false}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                {selectedRequest && (
                    <div className="modal-content">
                        <h2>Maintenance Request Details</h2>
                        <div className="modal-body">
                            <p><strong>User Name:</strong> {selectedRequest.user.name}</p>
                            <p><strong>Unit Code:</strong> {selectedRequest.unit_code || 'N/A'}</p>
                            <p><strong>Category:</strong> {selectedRequest.category}</p>
                            <p><strong>Description:</strong> {selectedRequest.description}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>
                            <p><strong>Schedule:</strong> {selectedRequest.schedule || 'N/A'}</p>
    
                            {selectedRequest.files && selectedRequest.files.length > 0 ? (
                            <div className="file-list">
                                <p><strong>Attached Files:</strong></p>
                                {selectedRequest.files.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedFile(file.file_path)}
                                    className="view-file-button"
                                >
                                    View File {index + 1}
                                </button>
                                ))}
                                <div style={{ marginTop: '10px' }}>{renderFilePreview()}</div>
                            </div>
                            ) : (
                            <p>No files attached.</p>
                            )}
                                
                            {selectedRequest.status === 'cancelled' && (
                                <p style={{ color: 'red', fontWeight: 'bold' }}>
                                    This maintenance request was cancelled by the tenant.
                                </p>
                            )}
    
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
                            <button
                                onClick={() => {
                                    if (!selectedRequest?.id) {
                                    alert("Invalid request ID.");
                                    return;
                                    }
                                    updateStatus(selectedRequest.id, 'completed');
                                }}
                                >
                                Mark as Completed
                            </button>
                            <button
                                onClick={() => {
                                    if (!selectedRequest?.id) {
                                    alert("Invalid request ID.");
                                    return;
                                    }
                                    updateStatus(selectedRequest.id, 'cancelled');
                                }}
                                >
                                Cancel Report
                                </button>
                            <button onClick={scheduleMaintenance}>Schedule</button>
                            <button className="close-button" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
        </div>
    );
};

export default MaintenanceRequests;
