import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Modal from 'react-modal';
import './MaintenanceTenant.css';
import { getAuthToken } from "../utils/auth";

const MaintenanceTenant = () => {
    const { sidebarOpen } = useOutletContext();
    const [request, setRequest] = useState('');
    const [submittedRequests, setSubmittedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewFile, setPreviewFile] = useState(null);

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
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/tenant/maintenance-requests', {
                    Authorization: `Bearer ${getAuthToken()}`,
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFile(URL.createObjectURL(file));
        } else {
            setPreviewFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!request.trim()) {
            alert('Please describe the issue.');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('description', request);
        formData.append('status', 'pending');
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        setIsSubmitting(true);
        setProgress(0);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://seagold-laravel-production.up.railway.app/api/maintenance-requests');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.setRequestHeader('Accept', 'application/json');

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setProgress(percent);
                }
            };

            xhr.onload = () => {
                setIsSubmitting(false);
                setProgress(0);
                if (xhr.status === 201) {
                    const savedRequest = JSON.parse(xhr.responseText);
                    setSubmittedRequests((prev) => [...prev, savedRequest]);
                    setRequest('');
                    setPreviewFile(null);
                    fileInput.value = null;
                    alert('Request submitted successfully!');
                } else {
                    alert('Failed to submit request.');
                    console.error(xhr.responseText);
                }
            };

            xhr.onerror = () => {
                setIsSubmitting(false);
                setProgress(0);
                alert('Upload failed. Please try again.');
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error:', error.message);
            setIsSubmitting(false);
            alert('Error submitting request.');
        }
    };

    const handleCancel = async (id) => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${id}/cancel`, {
                method: 'POST',
                Authorization: `Bearer ${getAuthToken()}`,
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
                <input type="file" id="file-input" accept="image/*,video/*" onChange={handleFileChange} />

                {/* Preview Before Upload */}
                {previewFile && (
                    <div className="preview-container">
                        {previewFile.match(/\.(jpeg|jpg|png)$/i) ? (
                            <img src={previewFile} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        ) : (
                            <video controls style={{ maxWidth: '100%', maxHeight: '300px' }}>
                                <source src={previewFile} type="video/mp4" />
                            </video>
                        )}
                    </div>
                )}

                {/* Progress Bar */}
                {isSubmitting && (
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
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
                                        <span style={{ color: 'grey' }}>In process...</span>
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
                                <img src={selectedFile} alt="Uploaded File" style={{ maxWidth: '100%' }} />
                            ) : (
                                <video controls style={{ maxWidth: '100%' }}>
                                    <source src={selectedFile} type="video/mp4" />
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
