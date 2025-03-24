import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // Import to access sidebar state
import Modal from 'react-modal';
import './MaintenanceTenant.css';

const MaintenanceTenant = () => {
    const { sidebarOpen } = useOutletContext(); // Access sidebar state
    const [request, setRequest] = useState('');
    const [submittedRequests, setSubmittedRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const user_id = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
    }

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/tenant/maintenance-requests', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch maintenance requests.');
                const data = await response.json();
                setSubmittedRequests(data);
            } catch (error) {
                console.error('Error:', error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (request.trim()) {
            const formData = new FormData();
            formData.append('user_id', user_id);
            formData.append('description', request);
            formData.append('status', 'pending');
            const fileInput = document.getElementById('file-input');
            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/maintenance-requests', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    body: formData,
                });
                if (!response.ok) throw new Error('Failed to submit request.');
                const savedRequest = await response.json();
                setSubmittedRequests((prev) => [...prev, savedRequest]);
                setRequest('');
                alert('Request submitted successfully!');
            } catch (error) {
                console.error('Error:', error.message);
                alert('Error submitting request.');
            }
        } else {
            alert('Please describe the issue.');
        }
    };

    const handleCancel = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/maintenance-requests/${id}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to cancel request.');
            setSubmittedRequests((prev) => prev.filter((req) => req.id !== id));
            alert('Request canceled successfully.');
        } catch (error) {
            console.error('Error:', error.message);
            alert('Failed to cancel request.');
        }
    };

    const handleViewFile = (filePath) => {
        setSelectedFile(filePath);
        setIsFileModalOpen(true);
    };

    const closeFileModal = () => {
        setIsFileModalOpen(false);
        setSelectedFile(null);
    };

    return (
        <div className={`maintenance-container ${sidebarOpen ? 'shifted' : ''}`}>
            <h1 className="maintenance-header">Maintenance Requests</h1>
            <p className="maintenance-description">Submit your maintenance concerns here.</p>

            <form onSubmit={handleSubmit} className="maintenance-form">
                <label htmlFor="maintenance-request">Describe your issue:</label>
                <textarea
                    id="maintenance-request"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Describe the issue you're experiencing"
                    required
                ></textarea>
                <label htmlFor="file-input">Upload Image/Video (optional):</label>
                <input type="file" id="file-input" accept="image/*,video/*" />
                <button type="submit">Submit Request</button>
            </form>

            <h2 className="status-header">Maintenance Request History</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>File</th>
                            <th>Status</th>
                            <th>Schedule</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submittedRequests.map((req) => (
                            <tr key={req.id}>
                                <td>{req.id}</td>
                                <td>{req.description}</td>
                                <td>
                                    {req.file_path && (
                                        <button onClick={() => handleViewFile(req.file_path)} className="view-file-button">
                                            View File
                                        </button>
                                    )}
                                </td>
                                <td>{req.status}</td>
                                <td>{req.schedule ? new Date(req.schedule).toLocaleString() : 'N/A'}</td>
                                <td>
                                    {req.status === 'pending' ? (
                                        <button onClick={() => handleCancel(req.id)} className="cancel-button">
                                            Cancel
                                        </button>
                                    ) : (
                                        <span style={{ color: 'grey', fontWeight: 'regular' }}>In process...</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* File Modal */}
            <Modal
                isOpen={isFileModalOpen}
                onRequestClose={closeFileModal}
                ariaHideApp={false}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <div className="modal-content">
                    <h2>File Preview</h2>
                    {selectedFile && (
                        <div className="file-preview">
                            {selectedFile.match(/\.(jpeg|jpg|png)$/i) ? (
                                <img
                                    src={`http://localhost:8000/storage/${selectedFile}`}
                                    alt="Uploaded File"
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                />
                            ) : (
                                <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
                                    <source src={`http://localhost:8000/storage/${selectedFile}`} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    )}
                    <button onClick={closeFileModal} className="close-button">
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default MaintenanceTenant;
