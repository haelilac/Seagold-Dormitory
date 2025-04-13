import React, { useEffect, useState } from 'react';
import './PendingApplications.css'; 

const PendingApplications = () => {
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    const [applications, setApplications] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [uploadedValidIdPath, setUploadedValidIdPath] = useState('');
    const [formData, setFormData] = useState({
        duration: '',
        reservation_details: '',
        set_price: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            console.time("⏱️ Total Fetch Time");
    
            try {
                console.time("📄 Fetch Applications");
                const appRes = await fetch('https://seagold-laravel-production.up.railway.app/api/applications-only');
                const appData = await appRes.json();
                setApplications(appData.applications || []);
                console.timeEnd("📄 Fetch Applications");
    
                console.time("🏘️ Fetch Units");
                const unitRes = await fetch('https://seagold-laravel-production.up.railway.app/api/units-only');
                const unitData = await unitRes.json();
                setUnits(unitData.units || []);
                console.timeEnd("🏘️ Fetch Units");
    
            } catch (err) {
                console.error("❌ Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                console.timeEnd("⏱️ Total Fetch Time");
            }
        };
    
        fetchData();
    }, []);
    

    // Fetch pending applications
    useEffect(() => {
        const fetchApplications = async () => {
            const start = performance.now(); // Start timer
            try {
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/applications');
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const data = await response.json();
    
                setApplications(data.applications || []);
                setUnits(data.units || []);
    
                const end = performance.now(); // End timer
                const seconds = ((end - start) / 1000).toFixed(2);
                console.log(`✅ Pending applications fetched in ${seconds} seconds`);
            } catch (err) {
                console.error('❌ Error fetching applications:', err);
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
            set_price: application.set_price || '',
            stay_type: application.stay_type || '', // ✅ ADD THIS LINE
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
    
    const matchingUnit = selectedApplication
    ? (() => {
        console.log("Trying match for:", selectedApplication?.reservation_details, selectedApplication?.stay_type);

        const filteredUnits = units
          .filter(
            (u) =>
              u.unit_code === selectedApplication.reservation_details &&
              u.stay_type?.toLowerCase() === selectedApplication.stay_type?.toLowerCase() &&
              u.status === 'available'
          )
          .filter((u) => {
            const sameTypeCount = u.same_staytype_users_count || 0;
            const totalCount = u.total_users_count || 0;
        
            const futureSameType = sameTypeCount + 1;
            const futureTotal = totalCount + 1;
        
            const isMatch = (
              futureSameType <= u.max_capacity &&
              futureTotal <= u.occupancy
            );
        
            console.log('Evaluating unit:', u.unit_code, u.stay_type, {
              sameTypeCount,
              totalCount,
              futureSameType,
              futureTotal,
              max_capacity: u.max_capacity,
              occupancy: u.occupancy,
              isMatch
            });
        
            return isMatch;
          })
          .sort((a, b) => a.capacity - b.capacity);
        
        console.log("Filtered candidates:", filteredUnits);
        return filteredUnits[0] || null;
      })()
    : null;
  

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

    if (loading) {
        return (
          <div className="spinner"></div>
        );
      }
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
                            <p><strong>Auto Price:</strong> ₱
                                {matchingUnit ? parseFloat(matchingUnit.price).toLocaleString() : 'No matching price'}
                                </p>

                                <p><strong>Rent Price:</strong> ₱
                                {(selectedApplication.set_price && parseFloat(selectedApplication.set_price) > 0)
                                    ? parseFloat(selectedApplication.set_price).toLocaleString()
                                    : (matchingUnit ? parseFloat(matchingUnit.price).toLocaleString() : 'Not set')}
                                </p>

                                {!matchingUnit && (
                                <p style={{ color: 'red' }}>
                                    No available pricing. Room may be full or not suitable for current group size.
                                </p>
                                )}

                            {/* Display Valid ID if available */}
                            
                            {selectedApplication.valid_id && (
                                <div>
                                    <p><strong>Valid ID:</strong></p>
                                    {console.log("Cloudinary URL for valid_id:", selectedApplication.valid_id)}
                                    <img 
                                    src={selectedApplication.valid_id}
                                        alt="Valid ID" 
                                        style={{
                                            width: '300px',
                                            height: 'auto',
                                            marginTop: '10px',
                                            border: '1px solid #ccc',
                                            padding: '5px'
                                        }}
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
                                    <option key={unit.id} value={unit.unit_code}>{unit.unit_code}</option>
                                ))}
                            </select>

                            <p><strong>Default Rent Price:</strong> ₱
                                {(
                                    units.find(
                                    (u) =>
                                        u.unit_code === formData.reservation_details &&
                                        u.stay_type?.toLowerCase() === formData.stay_type?.toLowerCase()
                                    )?.price?.toLocaleString() || '0.00'
                                )}
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
