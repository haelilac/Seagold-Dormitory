import React, { useEffect, useState } from 'react';
import './ManageTenants.css';
import { useDataCache } from '../contexts/DataContext';

const ManageTenants = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [unitId, setUnitId] = useState('');
    const [duration, setDuration] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [units, setUnits] = useState([]);
    const { getCachedData, updateCache } = useDataCache();
    const [showNewContractForm, setShowNewContractForm] = useState(false);
    const [terminatedTenants, setTerminatedTenants] = useState([]);
    const [loadingTerminated, setLoadingTerminated] = useState(true);
    const [formData, setFormData] = useState({ stay_type: '' });

    // Search States
    const [searchActive, setSearchActive] = useState('');
    const [searchTerminated, setSearchTerminated] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [terminatedEntriesPerPage, setTerminatedEntriesPerPage] = useState(10);
    const [terminatedCurrentPage, setTerminatedCurrentPage] = useState(1);



    useEffect(() => { document.body.style.overflow = "auto"; }, []);

    // Fetch Terminated Tenants
    useEffect(() => {
        const cached = getCachedData('terminated_tenants');
        if (cached) {
            setTerminatedTenants(cached);
            setLoadingTerminated(false);
            return;
        }
        const fetchData = async () => {
            try {
                const res = await fetch('https://seagold-laravel-production.up.railway.app/api/terminated-tenants');
                const data = await res.json();
                setTerminatedTenants(data);
                updateCache('terminated_tenants', data);
            } catch (e) { console.error(e); }
            finally { setLoadingTerminated(false); }
        };
        fetchData();
    }, []);

    // Fetch Units
    useEffect(() => {
        const cached = getCachedData('available_units');
        if (cached) { setUnits(cached); return; }
        const fetchUnits = async () => {
            try {
                const res = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
                const data = await res.json();
                const available = data.filter(unit => unit.status === 'available');
                setUnits(data);
                updateCache('available_units', data);
            } catch (e) { console.error(e); }
        };
        fetchUnits();
    }, []);


        // Function to terminate tenant contract
        const handleTerminateContract = async (action) => {
            if (action === 'terminate') {
                try {
                    const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenants/${selectedTenant.id}/terminate`, {
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


        const handleUpdateTenant = async (e) => {
            e.preventDefault();
            setIsUpdating(true);
        
            try {
                const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenants/${selectedTenant.id}/change-unit`, {
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
        

    // Fetch Active Tenants
    useEffect(() => {
        const cached = getCachedData('tenants');
        if (cached) {
            setTenants(cached);
            setLoading(false);
            return;
        }
        const fetchTenants = async () => {
            try {
                const res = await fetch('https://seagold-laravel-production.up.railway.app/api/tenants');
                const data = await res.json();
                const formatted = data.map(t => ({
                    id: t.id,
                    name: t.full_name,
                    email: t.email,
                    address: t.address,
                    contact_number: t.contact_number || 'N/A',
                    check_in_date: t.check_in_date,
                    duration: t.duration || 'N/A',
                    occupation: t.occupation || 'N/A',
                    unit_id: t.unit_id || null,
                    valid_id_url: t.valid_id_url || null,
                }));
                setTenants(formatted);
                updateCache('tenants', formatted);
            } catch (err) {
                setError('Unable to load tenant data');
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    const unitCodeMap = units.reduce((acc, unit) => {
        acc[unit.id] = unit.unit_code;
        return acc;
        }, {});


    const filteredActiveTenants = tenants.filter(t => {
        const unitCode = unitCodeMap[t.unit_id] || '';
        return (
            Object.values(t).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(searchActive.toLowerCase())
            ) ||
            unitCode.toLowerCase().includes(searchActive.toLowerCase())
        );
    });

    const paginatedActiveTenants = filteredActiveTenants.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const totalPages = Math.ceil(filteredActiveTenants.length / entriesPerPage);
    
    const filteredTerminatedTenants = terminatedTenants.filter(t => {
        const unitCode = unitCodeMap[t.unit_id] || '';
        return (
            Object.values(t).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(searchTerminated.toLowerCase())
            ) ||
            unitCode.toLowerCase().includes(searchTerminated.toLowerCase())
        );
    });

    const paginatedTerminatedTenants = filteredTerminatedTenants.slice(
        (terminatedCurrentPage - 1) * terminatedEntriesPerPage,
        terminatedCurrentPage * terminatedEntriesPerPage
    );

    const totalTerminatedPages = Math.ceil(filteredTerminatedTenants.length / terminatedEntriesPerPage);
    // Search Handlers
    const handleActiveSearchChange = (e) => {
        const query = e.target.value;
        setSearchActive(query);
        const filtered = tenants.filter(t => (t.name || '').toLowerCase().includes(query.toLowerCase()));
    };

    const handleTerminatedSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerminated(query);
        const filtered = terminatedTenants.filter(t => (t.full_name || '').toLowerCase().includes(query.toLowerCase()));
    };

    const handleCloseModal = () => {
        setSelectedTenant(null);
        setShowNewContractForm(false);
    };

    const handleRowClick = (tenant) => {
        setSelectedTenant(tenant);
        setShowNewContractForm(false);
    };

    if (loading) return <div className="managetenant-spinner"></div>;
    return (
            <>
             <div className="manage-tenants-container">
                {/* Active Tenants Section */}
                <section className="manage-tenants">
                    <h2>Manage Tenants</h2>

                        {/* Filter Container for Entries Per Page */}
                        <div className="search-container">
            <div className="filter-container">
                <label className="entries-label">
                    Show 
                    <select 
                        value={entriesPerPage} 
                        onChange={(e) => { 
                            setEntriesPerPage(Number(e.target.value)); 
                            setCurrentPage(1);  // Reset page on change
                        }} 
                        className="entries-select"
                    >
                        {[10, 30, 45, 60, 75, 100].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    entries
                </label>
            </div>
                                    <input
                                        type="text"
                                        placeholder="🔍 Search Tenant"
                                        value={searchActive}
                                        onChange={handleActiveSearchChange}
                                        className="search-tenant"
                                    />
                            </div>
        
                            <table className="tenants-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Check-in Date</th>
                                        <th>Duration</th>
                                        <th>Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
    {paginatedActiveTenants.map((tenant) => (
        <tr key={tenant.id} className="clickable-row" onClick={() => handleRowClick(tenant)}>
            <td>{tenant.name}</td>
            <td>{tenant.email}</td>
            <td>{tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleString() : 'N/A'}</td>
            <td>{tenant.duration} months</td>
            <td>{unitCodeMap[tenant.unit_id] || 'Not Assigned'}</td>
        </tr>
    ))}
</tbody>
                            </table>
                        
                    

<div className="pagination">
    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
    {[...Array(totalPages)].map((_, index) => (
        <button 
            key={index + 1} 
            className={currentPage === index + 1 ? "active" : ""} 
            onClick={() => setCurrentPage(index + 1)}
        >
            {index + 1}
        </button>
    ))}
    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
</div>
        
                    {/* Modal for Tenant Details */}
                    {selectedTenant && (
                        <div className="modal-overlay" onClick={handleCloseModal}>
                            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <button onClick={handleCloseModal} className="close-tenant-modal-button">&times;
                             </button>
                             
                                <h3 className="modal-header">Tenant Details</h3>
                                 <div className="manage-details">
                                <div className="manage-details-body">
                                <div className="details-left">
                                    <p><strong>Name:</strong> {selectedTenant.name}</p>
                                    <p><strong>Email:</strong> {selectedTenant.email}</p>
                                    <p><strong>Address:</strong> {selectedTenant.address}</p>
                                    </div>

                                    {selectedTenant.valid_id_url && (
                                        <div className="details-mid">
                                            <p><strong>Valid ID:</strong></p>
                                            <img src={selectedTenant.valid_id_url} alt="Valid ID" className="valid-id-image" />
                                        </div>
                                        
                                        
                                        
                                    )}
        
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

        <button className="update-button" type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Tenant'}
        </button>
    </form>
)}
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
                    ) : (
                        <>
{/* Filter Container for Entries Per Page */}
<div className="search-container">
    <div className="filter-container">
        <label className="entries-label">
            Show 
            <select 
                value={terminatedEntriesPerPage} 
                onChange={(e) => { 
                    setTerminatedEntriesPerPage(Number(e.target.value)); 
                    setTerminatedCurrentPage(1);  // Reset page on change
                }} 
                className="entries-select"
            >
                {[10, 30, 45, 60, 75, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                ))}
            </select>
            entries
        </label>
    </div>

    <input
        type="text"
        placeholder="🔍 Search Tenant"
        value={searchTerminated}
        onChange={handleTerminatedSearchChange}
        className="search-tenant"
    />
</div>              
        

                            <table className="tenants-table">
                                <thead>
                                    <tr>
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
    {paginatedTerminatedTenants.map((tenant) => (
        <tr key={tenant.id}>
            <td>{tenant.full_name}</td>
            <td>{tenant.email}</td>
            <td>{tenant.address}</td>
            <td>{tenant.contact_number || 'N/A'}</td>
            <td>{tenant.check_in_date || 'N/A'}</td>
            <td>{tenant.duration || 'N/A'} months</td>
            <td>{tenant.occupation || 'N/A'}</td>
            <td>{unitCodeMap[tenant.unit_id] || 'N/A'}</td>
            <td>{tenant.terminated_at}</td>
        </tr>
    ))}
</tbody>
                            </table>
                        </>
                    )}

<div className="pagination">
    <button 
        disabled={terminatedCurrentPage === 1} 
        onClick={() => setTerminatedCurrentPage(terminatedCurrentPage - 1)}
    >
        Previous
    </button>
    {[...Array(totalTerminatedPages)].map((_, index) => (
        <button 
            key={index + 1} 
            className={terminatedCurrentPage === index + 1 ? "active" : ""} 
            onClick={() => setTerminatedCurrentPage(index + 1)}
        >
            {index + 1}
        </button>
    ))}
    <button 
        disabled={terminatedCurrentPage === totalTerminatedPages} 
        onClick={() => setTerminatedCurrentPage(terminatedCurrentPage + 1)}
    >
        Next
    </button>
</div>


                </section>
                </div>
            </>
            
        );
        
    
};

export default ManageTenants;