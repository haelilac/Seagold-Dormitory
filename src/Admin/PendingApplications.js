import React, { useEffect, useState } from 'react';
import './PendingApplications.css'; // Add custom styles here

const PendingApplications = () => {
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    const [applications, setApplications] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        duration: '',
        reservation_details: '',
        set_price: ''
    });

    // Fetch pending applications
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/applications');
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const data = await response.json();

                // Extract applications and units
                setApplications(data.applications || []);
                setUnits(data.units || []);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const handleSelectApplication = (application) => {
        setSelectedApplication(application);
        setFormData({
            duration: application.duration,
            reservation_details: application.reservation_details,
            set_price: application.set_price || ''
        });
    };

    const handleCloseDetails = () => {
        setSelectedApplication(null);
        setEditMode(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdateApplication = async (applicationId) => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/applications/${applicationId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update application.');
            
            alert('Application updated successfully.');
            handleCloseDetails();
            window.location.reload();
        } catch (error) {
            alert('An error occurred while updating the application.');
        }
    };

    const handleAccept = async (applicationId, tenantName, tenantEmail, unitCode) => {
        if (!window.confirm('Accept this application and create a tenant account?')) return;
    
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/applications/${applicationId}/accept`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    name: tenantName, 
                    email: tenantEmail, 
                    unit_code: unitCode 
                }),
            });
    
            if (!response.ok) throw new Error('Failed to accept the application.');
    
            alert('Application accepted! Tenant account created.');
            setApplications((prev) => prev.filter((app) => app.id !== applicationId));
            handleCloseDetails();
        } catch (error) {
            alert('An error occurred while accepting the application.');
        }
    };
    
    

    const handleDecline = async (applicationId) => {
        if (!window.confirm('Decline this application?')) return;

        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/applications/${applicationId}/decline`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to decline the application.');
            
            alert('Application declined.');
            setApplications((prev) => prev.filter((app) => app.id !== applicationId));
            handleCloseDetails();
        } catch (error) {
            alert('An error occurred while declining the application.');
        }
    };

    if (loading) return <p>Loading applications...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="pending-applications">
            <h2>Pending Applications</h2>
            <table className="applications-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact Number</th>
                        <th>Check-in Date</th>
                        <th>Duration</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((application) => (
                        <tr key={application.id} onClick={() => handleSelectApplication(application)}>
                            <td>{`${application.first_name} ${application.middle_name || ''} ${application.last_name}`}</td>
                            <td>{application.email}</td>
                            <td>{application.contact_number}</td>
                            <td>{application.check_in_date || 'N/A'}</td>
                            <td>{application.duration} months</td>
                            <td>{application.reservation_details || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedApplication && (
                <div className="modal-overlay" onClick={handleCloseDetails}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Application Details</h3>
                        {!editMode ? (
                        <>
                            <p><strong>Name:</strong> {`${selectedApplication.first_name} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name}`}</p>
                            <p><strong>Email:</strong> {selectedApplication.email}</p>
                            <p><strong>Contact Number:</strong> {selectedApplication.contact_number}</p>
                            <p><strong>Duration:</strong> {selectedApplication.duration} months</p>
                            <p><strong>Reservation:</strong> {selectedApplication.reservation_details}</p>
                            <p><strong>Rent Price:</strong> ₱{selectedApplication.set_price || 'Not set'}</p>


                            {/* Display Valid ID if available */}
                            {selectedApplication.valid_id && (
                                <div>
                                    <p><strong>Valid ID:</strong></p>
                                    <img 
                                        src={`https://seagold-laravel-production.up.railway.app/storage/${selectedApplication.valid_id}`} 
                                        alt="Valid ID" 
                                        style={{ width: '300px', height: 'auto', marginTop: '10px', border: '1px solid #ccc', padding: '5px' }}
                                    />
                                </div>
                            )}

                            
                            <button onClick={() => setEditMode(true)}>Edit</button>
                            <button onClick={() => handleAccept(selectedApplication.id, selectedApplication.first_name, selectedApplication.email, selectedApplication.reservation_details)}>Accept</button>
                            <button onClick={() => handleDecline(selectedApplication.id)}>Decline</button>
                            <button onClick={handleCloseDetails}>Close</button>
                        </>
                    ) : (
                        <>
                            <label>Duration:</label>
                            <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} />
                            
                            <label>Unit:</label>
                            
                            <select name="reservation_details" value={formData.reservation_details} onChange={handleInputChange}>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.unit_code}>{unit.name}</option>
                                ))}
                            </select>

                            <p><strong>Default Rent Price:</strong> ₱
                                {units.find((u) => u.unit_code === formData.reservation_details)?.price?.toLocaleString() || '0.00'}
                            </p>

                            <label>Set Price:</label>
                            <input type="number" name="set_price" value={formData.set_price} onChange={handleInputChange} />

                            <button onClick={() => handleUpdateApplication(selectedApplication.id)}>Save</button>
                            <button onClick={handleCloseDetails}>Cancel</button>
                        </>
                    )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApplications;
