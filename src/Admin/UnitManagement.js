import React, { useEffect, useState } from 'react';
import './UnitManagement.css';

const UnitManagement = ({ onAddUnit }) => {
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    const [units, setUnits] = useState([]);
    const [availableUnits, setAvailableUnits] = useState(0);
    const [unavailableUnits, setUnavailableUnits] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [pricingDetails, setPricingDetails] = useState([]);

    // Fetch Units on Component Load
    useEffect(() => {
        fetchUnits();
    }, []);

    // Fetch Units from API
    const fetchUnits = async () => {
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
            if (!response.ok) throw new Error('Failed to fetch units');

            const data = await response.json();
            setUnits(data);
            setAvailableUnits(data.filter(unit => unit.status === 'available').length);
            setUnavailableUnits(data.filter(unit => unit.status === 'unavailable').length);
        } catch (error) {
            console.error('Error fetching units:', error.message);
        }
    };

    const handleViewDetails = async (unitCode) => {
        const filtered = units.filter(u => u.unit_code === unitCode);
        setPricingDetails(filtered);
        setSelectedUnit(unitCode);
        setShowModal(true);
      };
      

    // Toggle Unit Availability Status
    const handleToggleStatus = async (unitId, currentStatus) => {
        const newStatus = currentStatus === 'unavailable' ? 'available' : 'unavailable';

        try {
            await fetch(`https://seagold-laravel-production.up.railway.app/api/units/${unitId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchUnits();
        } catch (error) {
            console.error('Error updating unit status:', error.message);
        }
    };

    // Handle Adding a New Unit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newUnit = {
            unit_code: formData.get("unit_code"),
            name: formData.get("name"),
            capacity: formData.get("capacity"),
            price: formData.get("price"),
            stay_type: "long-term" 
        };

        try {
            await fetch('https://seagold-laravel-production.up.railway.app/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUnit),
            });
            fetchUnits();
        } catch (error) {
            console.error('Error adding unit:', error.message);
        }
        e.target.reset();
    };

    return (
        <section id="unit-management" className="dashboard-section">
    
            {/* Unit Management Section */}
            <div className="unit-section">
                <header className="header-bar">
                    My Unit Management Dashboard
                </header> 
                <div className="unit-layout">
    
                    {/* Add Unit Form */}
                    <form onSubmit={handleSubmit} className="unit-form">
                        <h3>Add New Unit</h3>
                        <label>Unit Code:
                            <input type="text" name="unit_code" required placeholder="Unit Code (e.g., CF-1)" />
                        </label>
                        <label>Name:
                            <input type="text" name="name" required placeholder="Unit Name" />
                        </label>
                        <label>Capacity:
                            <input type="number" name="capacity" required placeholder="Capacity" />
                        </label>
                        <label>Price:
                            <input type="number" name="price" required placeholder="Price" />
                        </label>
                        <button type="submit">Add Unit</button>
                    </form>
    
                    {/* Unit Statistics */}
                    <div className="unit-management-container">
                        <div className="unit-statistics">
                            <div className="unit-box total">Total Unit: <span>{units.length}</span></div>
                            <div className="unit-box available">Available Unit: <span>{availableUnits}</span></div>
                            <div className="unit-box unavailable">Unavailable Unit: <span>{unavailableUnits}</span></div>
                        </div>
                    </div>
                </div>
            </div>
    
                    {/* Box/Card Layout */}
                    <div className="unit-section">
                    <h3>All Units</h3>
                    <div className="unit-card-grid">
                        {units.map((unit) => (
                        <div key={unit.id} className={`unit-card ${unit.status}`}>
                            <h4>{unit.unit_code}</h4>
                            <p><strong>Name:</strong> {unit.name}</p>
                            <p><strong>Capacity:</strong> {unit.capacity}</p>
                            <p><strong>Price:</strong> ₱{parseFloat(unit.price).toLocaleString()}</p>
                            <p><strong>Occupied:</strong> {unit.users_count || 0}</p>
                            <p><strong>Status:</strong> {unit.status}</p>
                            <div className="unit-card-actions">
                            <button
                                onClick={() => handleToggleStatus(unit.id, unit.status)}
                                className={unit.status === 'available' ? 'make-unavailable' : 'make-available'}
                            >
                                {unit.status === 'available' ? 'Make Unavailable' : 'Make Available'}
                            </button>
                            <button onClick={() => handleViewDetails(unit.unit_code)} className="view-details-btn">
                                View
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

    
            {/* Pricing Details Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Pricing Details for {selectedUnit}</h2>
                        <button onClick={() => setShowModal(false)} className="close-button">X</button>
                        <table className="pricing-table">
                            <thead>
                                <tr>
                                    <th>Stay Type</th>
                                    <th>Capacity</th>
                                    <th>Max Capacity</th>
                                    <th>Price (₱)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricingDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.stay_type}</td>
                                        <td>{item.capacity}</td>
                                        <td>{item.max_capacity}</td>
                                        <td>{parseFloat(item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
    
};

export default UnitManagement;
