import React, { useEffect, useState } from 'react';
import './PendingApplications.css'; 
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useDataCache } from '../contexts/DataContext';

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '865f456f0873a587bc36',
  cluster: 'ap3',
  forceTLS: true,
});




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
    const { getCachedData, updateCache } = useDataCache();
    const cachedApplications = getCachedData('applications');
    const [processingAction, setProcessingAction] = useState(null); // 'accept' | 'decline' | 'save'
     useEffect(() => {
       document.body.style.overflow = "auto"; // force scroll back on
     }, []);
    
    useEffect(() => {
        const channel = window.Echo.channel('admin.applications'); // ✅ Make sure this matches your Laravel event
    
        channel.listen('.new.application', (e) => {
          console.log("📥 New Application Received:", e.application);
    
          const updatedApps = [...(getCachedData('applications') || []), e.application];
          updateCache('applications', updatedApps);
          setApplications(updatedApps); // ✅ update UI state
        });
    
        return () => {
          window.Echo.leave('admin.applications'); // clean up
        };
      }, []);

      useEffect(() => {
        if (cachedApplications) {
          setApplications(cachedApplications);
          setLoading(false);
          return; // ✅ skip fetch if cached
        }
      
        const fetchApplications = async () => {
          try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/applications-only');
            const data = await response.json();
            setApplications(data.applications);
            updateCache('applications', data.applications); // ✅ save to cache
          } catch (error) {
            console.error('❌ Error fetching applications:', error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchApplications();
      }, []);

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
        if (cachedApplications) {
          console.log('✅ Using cached applications');
          return;
        }
      
        const fetchApplications = async () => {
          try {
            const res = await fetch('https://seagold-laravel-production.up.railway.app/api/applications-only');
            const data = await res.json();
            updateCache('applications', data.applications || []);
            setApplications(data.applications || []);
          } catch (err) {
            console.error('❌ Error fetching applications:', err);
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
            stay_type: application.stay_type || '',
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
      setProcessingAction('save');
  
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
      } finally {
          setProcessingAction(null);
      }
  };
  

    const handleAccept = async (applicationId, tenantName, tenantEmail, unitCode) => {
      if (!window.confirm('Accept this application and create a tenant account?')) return;
  
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
          alert('Auth token not found. Please log in again.');
          return;
      }
  
      setProcessingAction('accept');
  
      try {
          const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/applications/${applicationId}/accept`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  name: tenantName,
                  email: tenantEmail,
                  unit_code: unitCode
              }),
          });
  
          const responseData = await response.json();
  
          if (!response.ok) {
              if (response.status === 409 && responseData.message?.includes("User already exists")) {
                  alert("❌ This user already exists. The application may have already been accepted.");
                  setApplications((prev) => prev.filter((app) => app.id !== applicationId));
                  handleCloseDetails();
              } else {
                  alert("❌ Failed to accept the application. " + (responseData.message || ''));
              }
              throw new Error(responseData.message || 'Failed to accept the application.');
          }
  
          alert('✅ Application accepted! Tenant account created.');
          setApplications((prev) => prev.filter((app) => app.id !== applicationId));
          handleCloseDetails();
      } catch (error) {
          console.error('Error accepting application:', error);
          alert('An error occurred while accepting the application.');
      } finally {
          setProcessingAction(null);
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
  
      setProcessingAction('decline');
  
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
      } finally {
          setProcessingAction(null);
      }
  };
  

    if (loading) return <div className="application-spinner"></div>;

    return (
        <div className="pending-applications">
          <h2 className="pending-title">Pending Applications</h2>
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Contact Number</th>
                <th>Check-in Date</th><th>Duration</th><th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} onClick={() => handleSelectApplication(app)}>
                  <td>{`${app.first_name} ${app.middle_name || ''} ${app.last_name}`}</td>
                  <td>{app.email}</td>
                  <td>{app.contact_number}</td>
                  <td>{app.check_in_date || 'N/A'}</td>
                  <td>
                    {app.duration}
                    {app.stay_type === 'monthly' && ' month(s)'}
                    {app.stay_type === 'half-month' && ' half month'}
                    {app.stay_type === 'weekly' && ' week(s)'}
                    {app.stay_type === 'daily' && ' day(s)'}
                  </td>
                  <td>{app.reservation_details || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
    
          {selectedApplication && (
            <div className="modal-overlay" onClick={handleCloseDetails}>
              <div className="application-details" onClick={e => e.stopPropagation()}>
              <button onClick={handleCloseDetails} className="close-details">&times; </button>
                {/* Header */}
                <div className="details-header">Application Details</div>
    
                {/* Body */}
                {!editMode ? (
                  <>
                    <div className="details-body">
                      <div className="details-left">
                        <p><strong>Name:</strong> {`${selectedApplication.first_name} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name}`}</p>
                        <p><strong>Email:</strong> {selectedApplication.email}</p>
                        <p><strong>Contact Number:</strong> {selectedApplication.contact_number}</p>
                        <p><strong>Duration:</strong> {selectedApplication.duration}
                          {selectedApplication.stay_type === 'monthly' && ' month(s)'}
                          {selectedApplication.stay_type === 'half-month' && ' half month'}
                          {selectedApplication.stay_type === 'weekly' && ' week(s)'}
                          {selectedApplication.stay_type === 'daily' && ' day(s)'}
                        </p>
                        <p><strong>Reservation:</strong> {selectedApplication.reservation_details}</p>
                      </div>
    
                      {selectedApplication.valid_id && (
                        <div className="details-right">
                          <p>Valid ID</p>
                          <img src={selectedApplication.valid_id} alt="Valid ID" />
                        </div>
                      )}

                      {selectedApplication.receipt_url && (
                        <div className="details-right">
                          <p>Receipt</p>
                          <img src={selectedApplication.receipt_url} alt="Receipt" />
                        </div>
                      )}
                    </div>
    
                    {/* Footer Prices */}
                    <div className="details-footer">
                      <p>
                        <strong>Auto Price:</strong> ₱{matchingUnit
                          ? parseFloat(matchingUnit.price).toLocaleString()
                          : '—'}
                      </p>
                      <p>
                        <strong>Rent Price:</strong> ₱{selectedApplication.set_price > 0
                          ? parseFloat(selectedApplication.set_price).toLocaleString()
                          : matchingUnit
                            ? parseFloat(matchingUnit.price).toLocaleString()
                            : '—'}
                      </p>
                    </div>
    
                    {/* Actions */}
                    <div className="action-buttons">
                      <button className="accept-button"
                              onClick={() => handleAccept(
                                  selectedApplication.id,
                                  selectedApplication.first_name,
                                  selectedApplication.email,
                                  selectedApplication.reservation_details
                              )}
                              disabled={processingAction !== null}>
                        {processingAction === 'accept' ? (
                          <span className="spinner"></span>
                        ) : 'Accept'}
                      </button>

                      <button className="decline-button"
                              onClick={() => handleDecline(selectedApplication.id)}
                              disabled={processingAction !== null}>
                        {processingAction === 'decline' ? (
                          <span className="spinner"></span>
                        ) : 'Decline'}
                      </button>

                      <button className="edit-button"
                              onClick={() => setEditMode(true)}
                              disabled={processingAction !== null}>
                        Edit
                      </button>
                    </div>
                  </>
                ) : (
                  /* Edit Mode */
                  <div className="details-body">
                    <div className="details-left">
                      <label>Duration:</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                      />
    
                      <label>Reservation:</label>
                      <select
                        name="reservation_details"
                        value={formData.reservation_details}
                        onChange={handleInputChange}
                      >
                        {units.map(u => (
                          <option key={u.id} value={u.unit_code}>
                            {u.unit_code}
                          </option>
                        ))}
                      </select>
    
                      <label>Set Price:</label>
                      <input
                        type="number"
                        name="set_price"
                        value={formData.set_price}
                        onChange={handleInputChange}
                      />
                    </div>
    
                    <div className="save-button">
                    <button 
                      onClick={() => handleUpdateApplication(selectedApplication.id)}
                      disabled={processingAction !== null}
                    >
                      {processingAction === 'save' ? (
                        <span className="spinner"></span>
                      ) : 'Save'}
                    </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default PendingApplications;