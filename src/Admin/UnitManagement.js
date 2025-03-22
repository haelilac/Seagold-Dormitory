import React, { useEffect, useState } from 'react';
import './UnitManagement.css';

const UnitManagement = ({ onAddUnit }) => {
    const [units, setUnits] = useState([]);
    const [availableUnits, setAvailableUnits] = useState(0);
    const [unavailableUnits, setUnavailableUnits] = useState(0);

    // Fetch Units on Component Load
    useEffect(() => {
        fetchUnits();
    }, []);

    // Fetch Units from API
    const fetchUnits = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/units');
            if (!response.ok) throw new Error('Failed to fetch units');

            const data = await response.json();
            setUnits(data);
            setAvailableUnits(data.filter(unit => unit.status === 'available').length);
            setUnavailableUnits(data.filter(unit => unit.status === 'unavailable').length);
        } catch (error) {
            console.error('Error fetching units:', error.message);
        }
    };

    // Toggle Unit Availability Status
    const handleToggleStatus = async (unitId, currentStatus) => {
        const newStatus = currentStatus === 'unavailable' ? 'available' : 'unavailable';

        try {
            await fetch(`http://localhost:8000/api/units/${unitId}/status`, {
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
        };

        try {
            await fetch('http://localhost:8000/api/units', {
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
            <header class="header-bar">
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

            {/* Short-Term Stay Units */}
            <div className="unit-section">
                <h3>Short-Term Stay Units</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Unit Code</th>
                                <th>Name</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Occupied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.filter(unit => unit.capacity <= 6).map(unit => (
                                <tr key={unit.id}>
                                    <td>{unit?.unit_code ?? 'N/A'}</td>
                                    <td>{unit.name}</td>
                                    <td>{unit.capacity}</td>
                                    <td>{unit.price}</td>
                                    <td>{unit.users_count || 0}</td>
                                    <td>{unit.status}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleToggleStatus(unit.id, unit.status)}
                                            className={unit.status === 'available' ? 'toggle-button make-unavailable' : 'toggle-button make-available'}>
                                            {unit.status === 'available' ? 'Make Unavailable' : 'Make Available'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Long-Term Stay Units */}
            <div className="unit-section">
                <h3>Long-Term Stay Units</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Unit Code</th>
                                <th>Name</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Occupied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.filter(unit => unit.capacity > 6).map(unit => (
                                <tr key={unit.id}>
                                    <td>{unit?.unit_code ?? 'N/A'}</td>
                                    <td>{unit.name}</td>
                                    <td>{unit.capacity}</td>
                                    <td>{unit.price}</td>
                                    <td>{unit.users_count || 0}</td>
                                    <td>{unit.status}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleToggleStatus(unit.id, unit.status)}
                                            className={unit.status === 'available' ? 'toggle-button make-unavailable' : 'toggle-button make-available'}>
                                            {unit.status === 'available' ? 'Make Unavailable' : 'Make Available'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </section>
    );
};

export default UnitManagement;
