import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Modal from 'react-modal';
import './MaintenanceTenant.css';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from "../contexts/DataContext";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const MaintenanceTenant = () => {
    const { sidebarOpen } = useOutletContext();
    const { getCachedData, updateCache } = useDataCache();

    const [request, setRequest] = useState('');
    const [category, setCategory] = useState('');
    const [submittedRequests, setSubmittedRequests] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const categories = [
        'Water Leak / Plumbing', 'Electrical Issue', 'Bathroom Problem', 'Flooring / Tiles',
        'Appliances', 'Furniture', 'Air Conditioning / Ventilation', 'Internet / WiFi',
        'Door / Window', 'Lighting', 'Others'
    ];
            const token = getAuthToken();

            useEffect(() => {
                const storedId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
                console.log("Checking Stored User ID:", storedId);
            
                if (storedId && !isNaN(parseInt(storedId))) {
                    setUserId(parseInt(storedId));
                } else {
                    console.warn('User ID not found. Checking again in a moment...');
                    setTimeout(() => {
                        const retryId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
                        if (retryId && !isNaN(parseInt(retryId))) {
                            setUserId(parseInt(retryId));
                        } else {
                            alert('Session expired. Please log in again.');
                            window.location.href = '/login';
                        }
                    }, 500);
                }
            }, []);
            
            useEffect(() => {
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
                            Authorization: `Bearer ${getAuthToken()}`
                        }
                    }
                });
                
                const channel = window.Echo.private(`tenant.notifications.${userId}`);
                channel.listen('.tenant-notification', (event) => {

                    console.log("🔔 Tenant Notification Received:", event);

                    // Optionally alert the user
                    alert(event.message);
            
                    // Re-fetch updated request list
                    fetch("https://seagold-laravel-production.up.railway.app/api/tenant/maintenance-requests", {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                            Accept: 'application/json',
                        },
                    })
                    .then(res => res.json())
                    .then(data => {
                        setSubmittedRequests(data);
                        updateCache("tenant-maintenance", data);
                    })
                    .catch(err => console.error("Realtime fetch failed:", err));
                });
            
                return () => {
                    window.Echo.leave(`tenant.notifications.${userId}`);
                };
            }, [userId]);

    // Session Check & Scroll Reset
    useEffect(() => {
        document.body.style.overflow = "auto";
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
        }
    }, [token]);

    
    // Fetch Maintenance Requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const cached = getCachedData("tenant-maintenance");
                if (cached) {
                    setSubmittedRequests(cached);
                } else {
                    const response = await fetch("https://seagold-laravel-production.up.railway.app/api/tenant/maintenance-requests", {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        }
                    });
                    if (!response.ok) throw new Error("Failed to fetch maintenance requests");

                    const data = await response.json();
                    setSubmittedRequests(data);
                    updateCache("tenant-maintenance", data);
                }
            } catch (error) {
                console.error("Error fetching maintenance requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Handle File Change
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const existingImages = previewFiles.filter(file => file.type.startsWith('image/'));
        const existingVideos = previewFiles.filter(file => file.type.startsWith('video/'));
    
        const newImages = newFiles.filter(file => file.type.startsWith('image/'));
        const newVideos = newFiles.filter(file => file.type.startsWith('video/'));
    
        if (existingImages.length + newImages.length > 3) {
            alert("You can only upload a maximum of 3 images.");
            return;
        }
    
        if (existingVideos.length + newVideos.length > 1) {
            alert("You can only upload 1 video.");
            return;
        }
    
        const updatedPreviews = [
            ...previewFiles,
            ...newFiles.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type
            }))
        ];
    
        setPreviewFiles(updatedPreviews);
    };

    // Submit Maintenance Request
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!request.trim() || !category) {
            alert('Please complete the form.');
            return;
        }
    
        if (!userId) {
            alert('User not identified. Please log in again.');
            return;
        }
    
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('category', category);
        formData.append('description', request);
        formData.append('status', 'pending');
    
        const fileInput = document.getElementById('file-input');
        Array.from(fileInput.files).forEach(file => {
            formData.append('files[]', file);  // Send as array
        });
    
        setIsSubmitting(true);
        setProgress(0);
    
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/maintenance-requests', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
    
            if (!response.ok) throw new Error('Failed to submit request.');
    
            setProgress(100);
            alert('Request submitted successfully!');
            resetForm();
    
        } catch (error) {
            console.error('Error:', error.message);
            alert('Error submitting request.');
        } finally {
            setIsSubmitting(false);
            setProgress(0);
        }
    };
    
    
    
    const resetForm = () => {
        setRequest('');
        setCategory('');
        setPreviewFiles([]);
        document.getElementById('file-input').value = null;
    };

    // Cancel Request
    const handleCancel = async (id) => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) throw new Error('Failed to cancel request.');
            setSubmittedRequests(prev => prev.filter(req => req.id !== id));
            alert('Request cancelled successfully.');
        } catch (error) {
            console.error('Error:', error.message);
            alert('Failed to cancel request.');
        }
    };

    // Follow-Up Request
    const handleFollowUp = async (id) => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/maintenance-requests/${id}/follow-up`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) throw new Error('Failed to send follow-up.');
            alert('Follow-up notification sent to admin!');
        } catch (error) {
            console.error('Error sending follow-up:', error.message);
            alert('Failed to send follow-up.');
        }
    };

    // Render File Modal Preview
    const renderFilePreview = () => {
        if (!selectedFile) return null;

        return (
            <div className="file-preview">
                {selectedFile.match(/\.(jpeg|jpg|png)$/i) ? (
                    <img src={selectedFile} alt="Uploaded File" style={{ maxWidth: '100%' }} />
                ) : (
                    <video controls style={{ maxWidth: '100%' }}>
                        <source src={selectedFile} type="video/mp4" />
                    </video>
                )}
            </div>
        );
    };


    if (loading) return <div className="maintenancetenant-spinner"></div>;

    return (
        <div className={`maintenance-container`}>
            <h1>Maintenance Requests</h1>

            <form onSubmit={handleSubmit} className="maintenance-form">
            <p>Submit your maintenance concerns here</p>
                <label>Select Category:</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">-- Select Category --</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* 📝 Description Field */}
                <label>Describe the Issue:</label>
                <textarea
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Provide a detailed description of the issue..."
                    rows="4"
                    required
                ></textarea>

                <label>Upload Images/Videos (optional):</label>
                <input 
                    type="file" 
                    id="file-input" 
                    name="files[]" 
                    accept="image/*,video/*" 
                    multiple 
                    onChange={handleFileChange} 
                />

                {previewFiles.length > 0 && (
                    <div className="preview-container">
                        {previewFiles.map((file, index) => (
                            file.type.startsWith('image/') ? (
                                <img key={index} src={file.url} alt={`Preview ${index}`} style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }} />
                            ) : (
                                <video key={index} controls style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }}>
                                    <source src={file.url} type={file.type} />
                                </video>
                            )
                        ))}
                    </div>
                )}

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
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Category</th>
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
                            <td>{req.category}</td>
                            <td>{req.description}</td>
                            <td>
                                {req.files && req.files.length > 0 ? (
                                    req.files.map((file, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => { setSelectedFile(file.file_path); setIsFileModalOpen(true); }} 
                                        className="view-file-button"
                                    >
                                        View File {index + 1}
                                    </button>
                                    ))
                                ) : (
                                    <span>No files</span>
                                )}
                                </td>
                            <td>{req.status}</td>
                            <td>{req.schedule ? new Date(req.schedule).toLocaleString() : 'N/A'}</td>
                            <td>
                                {(req.status === 'pending' || req.status === 'in_progress') ? (
                                    <>
                                        <button onClick={() => handleCancel(req.id)} className="cancel-button">Cancel</button>
                                        <button onClick={() => handleFollowUp(req.id)} className="followup-button">Follow-Up</button>
                                    </>
                                ) : (
                                    <span style={{ color: 'grey' }}>No actions</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal
                isOpen={isFileModalOpen}
                onRequestClose={() => setIsFileModalOpen(false)}
                ariaHideApp={false}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <div className="modal-content">
                    <h2>File Preview</h2>
                    {renderFilePreview()}
                    <button onClick={() => setIsFileModalOpen(false)} className="close-button">Close</button>
                </div>
            </Modal>
        </div>
    );
};

export default MaintenanceTenant;
