import React, { useEffect, useState } from 'react';
import './ManageTenants.css';

const ManageTenants = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [unitId, setUnitId] = useState('');
    const [duration, setDuration] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [units, setUnits] = useState([]);
    const [showNewContractForm, setShowNewContractForm] = useState(false);
    const [terminatedTenants, setTerminatedTenants] = useState([]);
    const [loadingTerminated, setLoadingTerminated] = useState(true);
    const [formData, setFormData] = useState({
        stay_type: '',
    });
    
    useEffect(() => {
        const fetchTerminatedTenants = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/terminated-tenants');
                if (!response.ok) throw new Error('Failed to fetch terminated tenants');
                
                const data = await response.json();
                console.log('Terminated Tenants:', data); // Check if data is received
                setTerminatedTenants(data);
            } catch (error) {
                console.error('Error fetching terminated tenants:', error.message);
            } finally {
                setLoadingTerminated(false);
            }
        };
    
        fetchTerminatedTenants();
    }, []);
    
    

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/units');
                if (!response.ok) throw new Error('Failed to fetch units');
    
                const data = await response.json();
                console.log('Fetched Units:', data); // Debugging
                setUnits(data.filter(unit => unit.status === 'available')); // Filter only available units
            } catch (error) {
                console.error('Error fetching units:', error.message);
            }
        };
    
        fetchUnits();
    }, []);
    
    
    // Fetch tenants from the backend API
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/tenants');
                if (!response.ok) throw new Error('Failed to fetch tenant data');
        
                const data = await response.json();
                const formattedData = data.map((tenant) => ({
                    id: tenant.id,
                    name: tenant.full_name,
                    email: tenant.email,
                    address: tenant.address,  // Corrected field
                    contact_number: tenant.contact_number || 'N/A',
                    check_in_date: tenant.check_in_date,
                    duration: tenant.duration || 'N/A',
                    occupation: tenant.occupation || 'N/A',
                    unit_code: tenant.unit_id || 'Not Assigned',
                    valid_id_url: tenant.valid_id_url || null,
                }));
        
                setTenants(formattedData);
            } catch (err) {
                setError('Unable to load tenant data');
            } finally {
                setLoading(false);
            }
        };
        
    
        fetchTenants();
    }, []);
  
    const handleUpdateTenant = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
    
        try {
            const response = await fetch(`http://localhost:8000/api/tenants/${selectedTenant.id}/change-unit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    unit_id: unitId, 
                    duration, 
                    stay_type: formData.stay_type,
                    set_price: formData.set_price // Adding set_price to the request
                }),
            });
    
            if (!response.ok) throw new Error('Failed to update tenant details');
    
            alert('Tenant unit updated successfully!');
            handleCloseModal();
            window.location.reload();
        } catch (error) {
            alert('Error updating tenant details.');
        } finally {
            setIsUpdating(false);
        }
    };
    

    // Function to terminate tenant contract
    const handleTerminateContract = async (action) => {
        if (action === 'terminate') {
            try {
                const response = await fetch(`http://localhost:8000/api/tenants/${selectedTenant.id}/terminate`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
    
                if (!response.ok) throw new Error('Failed to terminate contract');
    
                alert('Tenant contract terminated and removed successfully!');
                handleCloseModal();
                window.location.reload();
            } catch (error) {
                alert('Error terminating contract.');
            }
        } else if (action === 'newContract') {
            setShowNewContractForm(true);
        }
    };
    

    // Function to open modal with tenant details

    const handleRowClick = (tenant) => {
        setSelectedTenant(tenant);
        setShowNewContractForm(false);
    };

    const handleCloseModal = () => {
        setSelectedTenant(null);
        setShowNewContractForm(false);
    };

    return (
        <>
            {/* Active Tenants Section */}
        <section className="manage-tenants">
            <h2>Manage Tenants</h2>
            {loading ? (
                <p>Loading tenants...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <table className="tenants-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Contact Number</th>
                            <th>Check-in Date</th>
                            <th>Duration</th>
                            <th>Occupation</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="clickable-row" onClick={() => handleRowClick(tenant)}>
                                <td>{tenant.id}</td>
                                <td>{tenant.name}</td>
                                <td>{tenant.email}</td>
                                <td>{tenant.address}</td>
                                <td>{tenant.contact_number}</td>
                                <td>{tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleString() : 'N/A'}</td>
                                <td>{tenant.duration} months</td>
                                <td>{tenant.occupation}</td>
                                <td>{tenant.unit_code}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal for Tenant Details */}
            {selectedTenant && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-header">Tenant Details</h3>
                        <div className="modal-content">
                            <p><strong>ID:</strong> {selectedTenant.id}</p>
                            <p><strong>Name:</strong> {selectedTenant.name}</p>
                            <p><strong>Email:</strong> {selectedTenant.email}</p>
                            <p><strong>Address:</strong> {selectedTenant.address}</p>

                            <div className="termination-buttons">
                                <button 
                                    onClick={() => handleTerminateContract('terminate')} 
                                    className="terminate-button"
                                >
                                    Terminate Contract
                                </button>
                                <button 
                                    onClick={() => handleTerminateContract('newContract')} 
                                    className="new-contract-button"
                                >
                                    Terminate & Make New Contract
                                </button>
                            </div>

                            {showNewContractForm && (
    <form onSubmit={handleUpdateTenant} className="update-form">
        <label>
            Stay Type:
            <select
                value={formData.stay_type}
                onChange={(e) => setFormData({ ...formData, stay_type: e.target.value })}
                required
            >
                <option value="">Select Stay Type</option>
                <option value="day">Day Basis</option>
                <option value="short-term">Short-Term Stay</option>
                <option value="long-term">Long-Term Stay</option>
            </select>
        </label>

        <label>
            Duration:
            <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                disabled={!formData.stay_type}
            >
                <option value="">Select Duration</option>
                {formData.stay_type === "day" && [...Array(30).keys()].map((day) => (
                    <option key={day + 1} value={day + 1}>{day + 1} {day + 1 === 1 ? "Day" : "Days"}</option>
                ))}
                {formData.stay_type === "short-term" && [...Array(6).keys()].map((month) => (
                    <option key={month + 1} value={month + 1}>{month + 1} {month + 1 === 1 ? "Month" : "Months"}</option>
                ))}
                {formData.stay_type === "long-term" && [...Array(6).keys()].map((month) => (
                    <option key={month + 7} value={month + 7}>{month + 7} Months</option>
                ))}
            </select>
        </label>

        <label>
            New Unit:
            <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                required
                disabled={!formData.stay_type || !duration}
            >
                <option value="">Select a Unit</option>
                {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                        {unit.unit_code} - {unit.name} (₱{unit.price})
                    </option>
                ))}
            </select>
        </label>

        <label>
            Set Custom Price (Optional):
            <input
                type="number"
                value={formData.set_price}
                onChange={(e) => setFormData({ ...formData, set_price: e.target.value })}
                placeholder="Enter Custom Price"
            />
        </label>

        <button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Tenant'}
        </button>
    </form>
)}


                            {selectedTenant.valid_id_url && (
                                <div className="modal-valid-id">
                                    <p><strong>Valid ID:</strong></p>
                                    <img src={selectedTenant.valid_id_url} alt="Valid ID" className="valid-id-image" />
                                </div>
                            )}

                            <button onClick={handleCloseModal} className="close-modal-button">
                                Close
                            </button>
                        </div>
                        </div>
                        </div>
            )}
        </section>

            {/* Terminated Tenants Section */}
            <section className="manage-terminated-tenants">
                <h2>Terminated Tenants</h2>
                {loadingTerminated ? (
                    <p>Loading terminated tenants...</p>
                ) : terminatedTenants.length > 0 ? (
                    <table className="tenants-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Contact Number</th>
                                <th>Check-in Date</th>
                                <th>Duration</th>
                                <th>Occupation</th>
                                <th>Unit</th>
                                <th>Terminated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {terminatedTenants.map(tenant => (
                                <tr key={tenant.id}>
                                    <td>{tenant.id}</td>
                                    <td>{tenant.full_name}</td>
                                    <td>{tenant.email}</td>
                                    <td>{tenant.address}</td>
                                    <td>{tenant.contact_number || 'N/A'}</td>
                                    <td>{tenant.check_in_date || 'N/A'}</td>
                                    <td>{tenant.duration || 'N/A'} months</td>
                                    <td>{tenant.occupation || 'N/A'}</td>
                                    <td>{tenant.unit_id || 'N/A'}</td>
                                    <td>{tenant.terminated_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No terminated tenants found.</p>
                )}
            </section>
        </>
    );
};

export default ManageTenants;