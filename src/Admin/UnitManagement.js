import React, { useEffect, useState } from 'react';
import './UnitManagement.css';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [availableUnits, setAvailableUnits] = useState(0);
    const [unavailableUnits, setUnavailableUnits] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [pricingDetails, setPricingDetails] = useState([]);
    const [unitImages, setUnitImages] = useState([]);
    const [unitImageFiles, setUnitImageFiles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        max_capacity: '',
        occupancy: '',
        price: '',
      });
    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (showModal && selectedUnit) fetchUnitImages();
    }, [showModal, selectedUnit]);

    const fetchUnits = async () => {
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
            const data = await response.json();
            setUnits(data);
            setAvailableUnits(data.filter(unit => unit.status === 'available').length);
            setUnavailableUnits(data.filter(unit => unit.status === 'unavailable').length);
        } catch (error) {
            console.error('Error fetching units:', error.message);
        }
    };

    const handleViewDetails = async (unitCode) => {
        try {
          const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/units/by-code/${unitCode}`);
          const data = await response.json();
          setPricingDetails(data);
          setSelectedUnit(unitCode);
          setShowModal(true);
          
          // Pre-fill formData with the first matching row
          if (data.length > 0) {
            const sample = data[0];
            setFormData({
              name: sample.name,
              capacity: sample.capacity,
              max_capacity: sample.max_capacity,
              occupancy: sample.occupancy,
              price: sample.price,
            });
          }
      
        } catch (error) {
          console.error('Error fetching unit details:', error.message);
        }
      };
      

    const fetchUnitImages = async () => {
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/unit-images/${selectedUnit}`);
            const data = await res.json();
            setUnitImages(data);
        } catch (err) {
            console.error('Failed to load unit images:', err);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newUnit = {
            unit_code: formData.get("unit_code"),
            name: formData.get("name"),
            capacity: formData.get("capacity"),
            price: formData.get("price"),
            stay_type: "monthly"
        };

        try {
            await fetch('https://seagold-laravel-production.up.railway.app/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUnit),
            });

            // Bulk upload
            if (unitImageFiles.length > 0) {
                for (let file of unitImageFiles) {
                    const imageForm = new FormData();
                    imageForm.append('image', file);
                    imageForm.append('unit_code', newUnit.unit_code);

                    await fetch('https://seagold-laravel-production.up.railway.app/api/unit-images/upload', {
                        method: 'POST',
                        body: imageForm,
                    });
                }
            }

            fetchUnits();
        } catch (error) {
            console.error('Error adding unit:', error.message);
        }

        e.target.reset();
        setUnitImageFiles([]);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
      
      const handleUpdateUnit = async () => {
        try {
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/units/${selectedUnit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      
          if (!response.ok) throw new Error('Failed to update unit.');
          alert('Unit updated!');
          setShowModal(false);
          fetchUnits(); // reload unit list
        } catch (err) {
          alert('Update error');
        }
      };
      

        return (
            <section id="unit-management" className="dashboard-section">
                <div className="unit-section">
                    <header className="header-bar">My Unit Management Dashboard</header>
                    <div className="unit-layout">
                        <form onSubmit={handleSubmit} className="unit-form">
                            <h3>Add New Unit</h3>
                            <label>Unit Code:<input type="text" name="unit_code" required /></label>
                            <label>Capacity:<input type="number" name="capacity" required /></label>
                            <label>Price:<input type="number" name="price" required /></label>
                            <label>Max Occupancy (All Stay Types):</label>
                            <input
                            type="number"
                            name="occupancy"
                            value={formData.occupancy}
                            onChange={handleInputChange}
                            />
                            <label>Upload Room Images:
                                <input type="file" multiple onChange={(e) => setUnitImageFiles(Array.from(e.target.files))} />
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
                                <p><strong>Occupied:</strong> {unit.monthly_users_count || 0} / {unit.max_capacity}</p>
                                <p><strong>Status:</strong> {unit.overall_status}</p>
                                <div className="unit-card-actions">
                                    <button onClick={() => handleToggleStatus(unit.id, unit.overall_status)}>
                                        {unit.overall_status === 'available' ? 'Make Unavailable' : 'Make Available'}
                                    </button>
                                    <button onClick={() => handleViewDetails(unit.unit_code)}>View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        
                {/* Modal Section */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Details for {selectedUnit}</h2>
        
                            {/* Image Upload Section */}
                            <div className="image-upload-section">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!unitImageFiles || unitImageFiles.length === 0) return;
                                    for (let file of unitImageFiles) {
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        formData.append('unit_code', selectedUnit);
        
                                        await fetch('https://seagold-laravel-production.up.railway.app/api/unit-images/upload', {
                                            method: 'POST',
                                            body: formData,
                                        });
                                    }
                                    alert('Images uploaded!');
                                    setUnitImageFiles([]);
                                    fetchUnitImages();
                                }}>
                                    <input type="file" multiple onChange={(e) => setUnitImageFiles(Array.from(e.target.files))} />
                                    <button type="submit">Upload</button>
                                </form>
        
                                {/* Previews */}
                                <div className="image-preview-grid">
                                    {unitImages.map((img) => (
                                        <div key={img.id} className="image-preview-wrapper">
                                            <img src={img.image_path} alt="Room" className="room-image-preview" />
                                            <button onClick={handleUpdateUnit} className="save-button">
                                                Save Unit Info
                                                </button>

                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Delete this image?')) return;
                                                    await fetch(`https://seagold-laravel-production.up.railway.app/api/unit-images/${img.id}`, {
                                                        method: 'DELETE',
                                                    });
                                                    fetchUnitImages();
                                                }}
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    ))}
                                </div>
                            </div>
        
                            {/* Close Modal */}
                            <button onClick={() => setShowModal(false)} className="close-button">X</button>
        
                            {/* Pricing Summary */}
                            <div style={{ fontWeight: 'bold', marginTop: '20px' }}>
                                {(() => {
                                    const monthly = pricingDetails.filter(p => p.stay_type === 'monthly');
                                    const monthlyUsers = monthly.reduce((acc, item) => acc + (item.users_count || 0), 0);
                                    const totalUsers = pricingDetails.reduce((acc, item) => acc + (item.users_count || 0), 0);
                                    const matched = monthly.find(d => d.capacity === monthlyUsers);
                                    const fallback = monthly.length > 0 ? Math.min(...monthly.map(d => parseFloat(d.price))) : null;
                                    const basePrice = matched?.price || fallback;
                                    return <>
                                        🧑 Total Occupants (all types): {totalUsers} <br />
                                        🧑‍💼 Monthly Occupants: {monthlyUsers} <br />
                                        📌 Base Monthly Price: {basePrice ? `₱${parseFloat(basePrice).toLocaleString()}` : 'N/A'}
                                    </>;
                                })()}
                            </div>
        
                            {/* Pricing Table */}
                            <table className="pricing-table">
                                <thead>
                                    <tr>
                                        <th>Stay Type</th>
                                        <th>Capacity</th>
                                        <th>Price (₱)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricingDetails.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.stay_type}</td>
                                            <td>{item.capacity}</td>
                                            <td>{parseFloat(item.price).toLocaleString()}</td>
                                            <td>{item.status}</td>
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