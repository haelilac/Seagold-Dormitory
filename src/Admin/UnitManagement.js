import React, { useEffect, useState } from 'react';
import './UnitManagement.css';
import { useDataCache } from '../contexts/DataContext';
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
window.Echo = new Echo({
  broadcaster: 'pusher',
  key: 'fea5d607d4b38ea09320',
  cluster: 'ap1',
  forceTLS: true,
});

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [availableUnits, setAvailableUnits] = useState(0);
    const [unavailableUnits, setUnavailableUnits] = useState(0);
    const { getCachedData, updateCache } = useDataCache();
    const cachedUnits = getCachedData('unit_groups');
    const [showModal, setShowModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [pricingDetails, setPricingDetails] = useState([]);
    const [unitImages, setUnitImages] = useState([]);
    const [unitImageFiles, setUnitImageFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        max_capacity: '',
        occupancy: '',
        price: '',
    });

    useEffect(() => {
        document.body.style.overflow = "auto";
        if (cachedUnits?.length) {
            setUnits(cachedUnits);
            setAvailableUnits(cachedUnits.filter(unit => unit.overall_status === 'available').length);
            setUnavailableUnits(cachedUnits.filter(unit => unit.overall_status === 'unavailable').length);
            setLoading(false);
        } else {
            fetchUnits();
        }
    }, []);

    useEffect(() => {
        if (showModal && selectedUnit) fetchUnitImages();
    }, [showModal, selectedUnit]);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
            const data = await response.json();
            setUnits(data);
            updateCache('unit_groups', data);
            setAvailableUnits(data.filter(unit => unit.overall_status === 'available').length);
            setUnavailableUnits(data.filter(unit => unit.overall_status === 'unavailable').length);
        } catch (error) {
            console.error('Error fetching units:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const channel = window.Echo.channel('admin.units');
        channel.listen('.unit.updated', (e) => {
            console.log("📦 Unit updated via Pusher:", e.unit);
            fetchUnits();
        });
        return () => {
            window.Echo.leave('admin.units');
        };
    }, []);

    const handleViewDetails = async (unitCode) => {
        try {
            setSelectedUnit(null);
            const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/units/by-code/${unitCode}`);
            const data = await response.json();
            setPricingDetails(data);
            if (data.length > 0) {
                const sample = data[0];
                setFormData({
                    name: sample.name,
                    capacity: sample.capacity,
                    max_capacity: sample.max_capacity,
                    occupancy: sample.occupancy,
                    price: sample.price,
                });
                setSelectedUnit(sample);
            }
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching unit details:', error.message);
        }
    };

    const fetchUnitImages = async () => {
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/unit-images/${selectedUnit.unit_code}`);
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

    const handleForceOccupyFromCard = async (unit) => {
        if (!unit) return;
        if (!window.confirm(`Are you sure you want to ${unit.is_force_occupied ? 'make available' : 'force occupy'} ${unit.unit_code}?`)) return;

        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/units/${unit.id}/force-occupy`, {
                method: 'PUT',
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to update force occupancy');

            alert('Force occupancy updated!');

            // ✅ Re-fetch units after force occupy success
            await fetchUnits(); 

        } catch (err) {
            console.error(err);
            alert('Error updating occupancy status.');
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

            if (unitImageFiles.length > 0) {
                for (let file of unitImageFiles) {
                    const imageForm = new FormData();
                    imageForm.append('image', file);
                    imageForm.append('unit_code', newUnit.unit_code);

                    await fetch('https://seagold-laravel-production.up.railway.app/unit-images/upload', {
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
            fetchUnits();
        } catch (err) {
            alert('Update error');
        }
    };

    if (loading) return <div className="unitmanagement-spinner"></div>;
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
  
              <div className="unit-management-container">
                <div className="unit-statistics">
                  <div className="unit-box total">Total Unit: <span>{units.length}</span></div>
                  <div className="unit-box available">Available Unit: <span>{availableUnits}</span></div>
                  <div className="unit-box unavailable">Unavailable Unit: <span>{unavailableUnits}</span></div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Unit Cards */}
          <div className="unit-section">
            <h3>All Units</h3>
            <div className="unit-card-grid">
              {units.map((unit) => (
                <div key={unit.id} className={`unit-card ${unit.status}`}>
                  <h4>{unit.unit_code}</h4>
                  <p><strong>Occupied:</strong> {unit.monthly_users_count || 0} / {unit.max_capacity}</p>
                  <p><strong>Status:</strong> {unit.is_force_occupied ? "Fully Occupied" : unit.overall_status}</p>
  
                  <div className="unit-card-actions">
                    <button onClick={() => handleToggleStatus(unit.id, unit.overall_status)}>
                      {unit.overall_status === 'available' ? 'Make Unavailable' : 'Make Available'}
                    </button>
  
                    <button onClick={() => handleForceOccupyFromCard(unit)} style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                      {unit.is_force_occupied ? 'Make it Available' : 'Force Occupy'}
                    </button>
  
                    <button onClick={() => handleViewDetails(unit.unit_code)}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Details for {selectedUnit?.unit_code}</h2>
  
                {/* Upload Section */}
                <div className="image-upload-section">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!unitImageFiles.length) return;
                    for (let file of unitImageFiles) {
                      const formData = new FormData();
                      formData.append('image', file);
                      formData.append('unit_code', selectedUnit.unit_code);
  
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
  
                  {/* Preview Images */}
                  <div className="image-preview-grid">
                    {unitImages.map((img) => (
                      <div key={img.id} className="image-preview-wrapper">
                        <img src={img.image_path} alt="Room" className="room-image-preview" />
                        <button onClick={handleUpdateUnit} className="save-button">Save Unit Info</button>
                        <button onClick={async () => {
                          if (!window.confirm('Delete this image?')) return;
                          await fetch(`https://seagold-laravel-production.up.railway.app/api/unit-images/${img.id}`, {
                            method: 'DELETE',
                          });
                          fetchUnitImages();
                        }}>
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
  