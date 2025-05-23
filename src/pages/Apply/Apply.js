import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Apply.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { auth, provider } from "../../firebase/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        email: '',
        birthdate: null,
        facebook_profile: '',
        house_number: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        zip_code: '',
        contact_number: '',
        occupation: '',
        check_in_date: null,
        duration: '',
        reservation_details: '',
        stay_type: '', 
        valid_id: null,
        valid_id_url: '',
        accept_privacy: false,
    });
  useEffect(() => {
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);
    const [isVerified, setIsVerified] = useState(false); // Google Verification
    const [isIdVerified, setIsIdVerified] = useState(false); // ID Verification
    const [units, setUnits] = useState([]);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [uploadedValidIdPath, setUploadedValidIdPath] = useState('');
    const [unitPrice, setUnitPrice] = useState(null);
    const [reservationFee, setReservationFee] = useState(0);
    const [receipt, setReceipt] = useState(null);
    const [receiptUrl, setReceiptUrl] = useState('');
    // Address Data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        reference_number: '',
        amount: '',
    });
    const [hasAgreedToReservation, setHasAgreedToReservation] = useState(false);
const [showReservationModal, setShowReservationModal] = useState(true);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvincesAndNCR = async () => {
            try {
                // Fetch Provinces
                const provincesResponse = await axios.get(`https://psgc.gitlab.io/api/provinces.json`);
                const provinces = provincesResponse.data;
    
                // Fetch NCR (National Capital Region)
                const ncrResponse = await axios.get(`https://psgc.gitlab.io/api/regions/130000000/cities-municipalities.json`);
                const ncrCities = ncrResponse.data;
    
                // Add NCR as a province with its cities
                const ncrProvince = { 
                    name: "NCR (Metro Manila)", 
                    code: "130000000", 
                    cities: ncrCities 
                };
                
                console.log("Fetched Provinces:", provinces);
                console.log("Fetched NCR (Metro Manila):", ncrCities);
    
                // Update the provinces state to include NCR as a special region
                setProvinces([...provinces, ncrProvince]);
            } catch (error) {
                console.error("Error fetching provinces and NCR:", error);
            }
        };
    
        fetchProvincesAndNCR();
    }, []);    
    
    
    const handleProvinceChange = async (e) => {
        const provinceName = e.target.value; 
        const selectedProvince = provinces.find(prov => prov.name === provinceName); 
        
        setFormData(prev => ({
            ...prev,
            province: selectedProvince ? selectedProvince.name : "", 
            city: "",
            barangay: "",
        }));
    
        if (!selectedProvince) return;
    
        if (selectedProvince.name === "NCR (Metro Manila)") {
            setCities(selectedProvince.cities); // Directly set cities if province is NCR
            setMunicipalities([]);
        } else {
            try {
                const citiesResponse = await axios.get(`https://psgc.gitlab.io/api/provinces/${selectedProvince.code}/cities.json`);
                setCities(citiesResponse.data);
    
                const municipalitiesResponse = await axios.get(`https://psgc.gitlab.io/api/provinces/${selectedProvince.code}/municipalities.json`);
                setMunicipalities(municipalitiesResponse.data);
            } catch (error) {
                console.error("Error fetching cities or municipalities:", error);
            }
        }
    
        setBarangays([]);
    };
    
    
    // Handle City Selection
    const handleCityChange = async (e) => {
        const cityMunName = e.target.value; // Get the selected name
        const selectedCity = cities.find(c => c.name === cityMunName) || municipalities.find(m => m.name === cityMunName); // Find by name
    
        console.log("Selected City Name:", cityMunName);
        console.log("Matching City:", selectedCity);
    
        setFormData(prev => ({
            ...prev,
            city: selectedCity ? selectedCity.name : "", // Store Name Instead of Code
            barangay: "", // Reset barangay when changing city
        }));
    
        if (!selectedCity) return;
    
        try {
            let barangayResponse;
            if (cities.some(c => c.name === cityMunName)) {
                barangayResponse = await axios.get(`https://psgc.gitlab.io/api/cities/${selectedCity.code}/barangays.json`);
            } else {
                barangayResponse = await axios.get(`https://psgc.gitlab.io/api/municipalities/${selectedCity.code}/barangays.json`);
            }
    
            setBarangays(barangayResponse ? barangayResponse.data : []);
        } catch (error) {
            console.error("Error fetching barangays:", error);
        }
    };
    
    
    // Handle Barangay Selection
    const handleBarangayChange = (e) => {
        const barangayName = e.target.value; // Get the selected name
        const selectedBarangay = barangays.find(brgy => brgy.name === barangayName); // Find by name
    
        console.log("Selected Barangay Name:", barangayName);
        console.log("Matching Barangay:", selectedBarangay);
    
        setFormData(prev => ({
            ...prev,
            barangay: selectedBarangay ? selectedBarangay.name : "", // Store Name Instead of Code
        }));
    };
    
    useEffect(() => {
    const fetchRoomPrice = async () => {
        if (!formData.reservation_details || !formData.stay_type) return;

        try {
            const response = await axios.get("https://seagold-laravel-production.up.railway.app/api/room-pricing", {
                params: {
                    unit_code: formData.reservation_details,
                    stay_type: formData.stay_type
                }
            });

            // Find pricing for unit capacity
            const unit = units.find(u => u.unit_code === formData.reservation_details);
            if (!unit) return;

            const matchedPrice = response.data.find(p =>
                p.unit_code === formData.reservation_details &&
                p.capacity >= (unit.users_count + 1)
              );
            setUnitPrice(matchedPrice?.price || null);
        } catch (error) {
            console.error("Error fetching dynamic room pricing:", error);
        }
    };

    fetchRoomPrice();
}, [formData.reservation_details, formData.stay_type]);

    // Fetch units
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/units-only');
                if (!response.ok) throw new Error('Failed to fetch units');
                const data = await response.json();
                console.log('✅ Units fetched:', data);
                setUnits(Array.isArray(data.units) ? data.units : []);   // ✅ Only set the array part
            } catch (err) {
                console.error('Error fetching units:', err);
            }
        };
        fetchUnits();
    }, []);
    
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "contact_number") {
            let numericValue = value.replace(/\D/g, "");
            if (!numericValue.startsWith("9")) return;
            if (numericValue.length > 10) return;
            setFormData({ ...formData, [name]: numericValue });
            return;
        }
    
        if (name === "stay_type") {
            let autoDuration = "";
            let fee = 0;
          
            if (value === "monthly") {
              autoDuration = "";
              fee = 1000;
            } else if (value === "half-month") {
              autoDuration = 15;
              fee = 500;
            } else if (value === "weekly") {
              autoDuration = 7;
              fee = 500;
            }
          
            setFormData(prev => ({
              ...prev,
              [name]: value,
              duration: autoDuration,
            }));
          
            setReservationFee(fee);
            return; // ✅ stop here so it doesn’t override duration below
          }

        // Handle other inputs
        setFormData({ ...formData, [name]: value });
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert("❌ Please select a receipt file.");
            return;
        }
    
        const formDataUpload = new FormData();
        formDataUpload.append("receipt", file);
    
        try {
            const response = await fetch("https://seagold-laravel-production.up.railway.app/api/validate-receipt", {
                method: "POST",
                body: formDataUpload,
            });
    
            const result = await response.json();
            console.log("🔍 Receipt Upload Full Response:", result);
            
            if (response.ok && result.match === true) {
                const extractedAmount = parseFloat(result.amount || result.ocr_data?.extracted_amount);
                const reference = result.reference || result.ocr_data?.extracted_reference;
                const receiptURL = result.receipt_url || result.ocr_data?.receipt_url;
            
                const expectedAmount = formData.stay_type === "monthly" ? 1000 : 500;
            
                if (extractedAmount !== expectedAmount) {
                    alert(`❌ Amount mismatch. Expected ${expectedAmount}, but got ${extractedAmount}`);
                    return;
                }
            
                setPaymentData({
                    reference_number: reference,
                    amount: extractedAmount,
                });
            
                setReceiptUrl(receiptURL);
                console.log("✅ receiptUrl set:", receiptURL);
                alert("✅ Receipt validated successfully!");
            } else {
                alert(result.message || "❌ Error processing receipt.");
            }
            
    
        } catch (error) {
            console.error("❌ Error validating receipt:", error);
            alert("❌ Server error while validating receipt.");
        }
    };
    

    const formatDateTimeReadable = (date) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        return new Date(date).toLocaleString('en-US', options);
    };
    
    
     
    const sendToApplication = (applicationId, referenceNumber, amount, dateTime) => {
        fetch("https://seagold-laravel-production.up.railway.app/api/applications/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                application_id: applicationId,
                reference_number: referenceNumber,
                amount: amount,
                date_time: dateTime,
            }),
        })
        .then(response => response.json())
        .then(data => console.log("✅ Payment data linked to application:", data))
        .catch(error => console.error("❌ Error linking payment data:", error));
    };
    

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert("❌ Please select a file.");
            return;
        }
    
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("id_type", formData.id_type); 
    
        try {
            const response = await fetch("https://seagold-python-production.up.railway.app/upload-id/", { // <<== FIXED HERE
                method: 'POST',
                body: formDataUpload,
                headers: { 
                    Accept: 'application/json',
                },
            });
    
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server Error: ${response.status} - ${text}`);
            }
    
            const data = await response.json();
            console.log("✅ Upload ID OCR Response:", data);
    
            setFormData(prev => ({
                ...prev,
                valid_id_url: data.file_url || prev.valid_id_url,
              }));
              
              setUploadedValidIdPath(data.file_url || uploadedValidIdPath);
              if (data.id_type_matched) {
                alert('✅ ID Verified Successfully!');
                setIsIdVerified(true);
              } else {
                alert('❌ ID Mismatch detected!');
                setIsIdVerified(false);
              }
        } catch (error) {
            console.error("❌ Error uploading ID:", error);
            alert("❌ Failed to upload ID. Check console.");
            setIsIdVerified(false);
        }
    };
    
    

    const formatDateTime = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            const idToken = await user.getIdToken(); // ✅ get actual ID token
            console.log("✅ ID Token:", idToken); // Log ID token
    
            const baseUrl = window.location.hostname.includes('localhost')
                ? 'https://seagold-laravel-production.up.railway.app'
                : 'https://seagold-laravel-production.up.railway.app';
            console.log("✅ ID Token:", idToken);
            const verifyResponse = await fetch(`${baseUrl}/api/google-verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
            });
    
            const verifyData = await verifyResponse.json();
            console.log("✅ Google Verify API response:", verifyData); // Log API response
    
            if (verifyData.email) {
                setFormData((prev) => ({
                    ...prev,
                    email: verifyData.email,
                    first_name: verifyData.name.split(" ")[0],
                    last_name: verifyData.name.split(" ").slice(-1)[0],
                }));
                setIsVerified(true);
                alert(`Email verified: ${verifyData.email}`);
            } else {
                alert("Failed to verify Google account.");
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("Failed to verify email. Please try again.");
        }
    };
    
    
    console.log('receiptUrl:', receiptUrl);
    console.log('paymentData:', paymentData);
    console.log("✅ Submitting data with receipt URL:", receiptUrl);
    console.log("💸 Payment:", paymentData);
    console.log("✅ ID URL used:", formData.valid_id_url || uploadedValidIdPath || receiptUrl);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!isVerified) {
            alert('Please verify your email using Google Sign-In before submitting.');
            return;
        }
    
        if (!formData.accept_privacy) {
            alert('You must accept the privacy terms.');
            return;
        }
    
        if (!paymentData.reference_number || !paymentData.amount) {
            alert("❌ Receipt validation failed. Please upload a clearer image.");
            return;
        }
    
        const fallbackValidIdUrl = formData.valid_id_url || uploadedValidIdPath;
        if (!fallbackValidIdUrl || !/^https?:\/\//i.test(fallbackValidIdUrl)) {
            alert("❌ valid_id_url is missing or invalid.");
            return;
        }
        
        // Force it into the main formData state
        formData.valid_id_url = fallbackValidIdUrl;
    
        setLoading(true);
    
        try {
            const requestData = new FormData();
    
            Object.keys(formData).forEach((key) => {
                if (key === 'check_in_date') {
                    requestData.append(key, formatDateTime(formData[key]));
                } else if (key !== 'valid_id' && key !== 'valid_id_url') {
                    requestData.append(key, formData[key]);
                }
            });
    
            requestData.append("valid_id_url", fallbackValidIdUrl);
            requestData.append("reservation_fee", reservationFee);
            requestData.append("receipt_url", receiptUrl);
            requestData.append("reference_number", paymentData.reference_number);
            requestData.append("payment_amount", paymentData.amount);
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/applications', {
                method: 'POST',
                body: requestData,
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
            }
    
            alert('Application submitted successfully!');
            setFormData({
                last_name: '',
                first_name: '',
                middle_name: '',
                birthdate: null,
                email: '',
                facebook_profile: '',
                house_number: '',
                street: '',
                barangay: '',
                city: '',
                province: '',
                zip_code: '',
                contact_number: '',
                occupation: '',
                check_in_date: null,
                duration: '',
                reservation_details: '',
                stay_type: '',
                valid_id: null,
                accept_privacy: false,
            });
            setIsVerified(false);
        } catch (error) {
            console.error('Error submitting application:', error.message);
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false); // 🔥 Stop loading after done
        }
    };
    
          
    
    const duration = Number(formData.duration);

    return (
        <div className="contact-page-container">
            <div className="get-in-touch">
                <h2>Interested? Be With Us!</h2>
                {showReservationModal && (
            <div className="reservation-modal-overlay">
                <div className="reservation-modal">
                <h3>Reservation Notice</h3>
                <p>
                    Before you begin, please note that submitting an application will require a reservation fee
                    of <strong>₱500</strong> or <strong>₱1000</strong> depending on your selected stay type.
                </p>
                <p>
                    This fee confirms your intent and is necessary for admin review. Do you wish to proceed?
                </p>
                <div className="modal-buttons">
                    <button
                    className="agree-btn"
                    onClick={() => {
                        setHasAgreedToReservation(true);
                        setShowReservationModal(false);
                    }}
                    >
                    I Agree
                    </button>
                    <button
                    className="decline-btn"
                    onClick={() => {
                        setHasAgreedToReservation(false);
                        setShowReservationModal(false);
                    }}
                    >
                    I Do Not Agree
                    </button>
                </div>
                </div>
            </div>
            )}
                <div 
                    className="form-wrapper" 
                    onClick={(e) => {
                        if (!hasAgreedToReservation) {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowReservationModal(true);
                        }
                    }}
                    >
                    <form 
                        className="contact-form" 
                        onSubmit={handleSubmit} 
                        style={{ pointerEvents: hasAgreedToReservation ? 'auto' : 'none', opacity: hasAgreedToReservation ? 1 : 0.5 }}
                    >
                    {/* Name and Email */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Enter your last name" required />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Enter your first name" required />
                        </div>
                        <div className="form-group">
                            <label>Middle Name</label>
                            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} placeholder="Enter your middle name" />
                        </div>
                    </div>

                    <div className="form-group">
                      <label>Birthdate</label>
                        <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                        min="1900-01-01"
                        max="2025-12-31"
                  required
                    />
                </div>

                    {/* Email Verification */}
                    <div className="form-group email-group">
                        <label>Email</label>
                        <div className="email-container">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                            <button 
                                type="button" 
                                className="verify-email-button" 
                                onClick={handleGoogleSignIn}
                                disabled={isVerified}
                            >
                                {isVerified ? "Verified" : "Verify"}
                            </button>
                        </div>
                    </div>

                    {/* Facebook Profile */}
                    <div className="form-group">
                        <label>Facebook Profile</label>
                        <input
                            type="text"
                            name="facebook_profile"
                            value={formData.facebook_profile}
                            onChange={handleInputChange}
                            placeholder="Enter your Facebook profile URL"
                        />
                    </div>
                {/* Address and Contact */}
                <div className="form-group">
                    <label>Province</label>
                    <select name="province" value={formData.province} onChange={handleProvinceChange} required>
                        <option value="">Select Province</option>
                        {provinces.map((prov) => (
                            <option key={prov.code} value={prov.name}>
                                {prov.name}
                            </option>
                        ))}
                    </select>
                </div>

    
                <div className="form-row">
                    <div className="form-group">
                        <label>City / Municipality</label>
                        <select name="city" value={formData.city} onChange={handleCityChange} required disabled={!formData.province}>
                            <option value="">Select City/Municipality</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.name}> {/* Store name instead of code */}
                                    {city.name} (City)
                                </option>
                            ))}
                            {municipalities.map((municipality) => (
                                <option key={municipality.code} value={municipality.name}> {/* Store name instead of code */}
                                    {municipality.name} (Municipality)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                <label>House Number</label>
                <input
                    type="text"
                    name="house_number"
                    value={formData.house_number}
                    onChange={handleInputChange}
                    placeholder="Enter House Number"
                    required
                />
            </div>

            <div className="form-group">
                <label>Street</label>
                <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Enter Street"
                    required
                />
            </div>

            <div className="form-group">
                <label>Barangay</label>
                <select name="barangay" value={formData.barangay} onChange={handleBarangayChange} required disabled={!formData.city}>
                    <option value="">Select Barangay</option>
                    {barangays.map((brgy) => (
                        <option key={brgy.code} value={brgy.name}> {/* Store name instead of code */}
                            {brgy.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Zip Code</label>
                <input 
                    type="text" 
                    name="zip_code" 
                    value={formData.zip_code} 
                    onChange={handleInputChange} 
                    placeholder="Enter Zip Code" 
                    required 
                />
            </div>
                    {/* Occupation */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Occupation/Rank</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleInputChange}
                                placeholder="Enter your occupation"
                                required
                            />
                        </div>
                    </div>


                    {/* Check-in Date and Duration */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Check-in Date & Time</label>
                            <DatePicker
                                selected={formData.check_in_date}
                                onChange={(date) => setFormData({ ...formData, check_in_date: date })}
                                showTimeSelect
                                dateFormat="MMMM d, yyyy h:mm aa"
                                placeholderText="Select Date and Time"
                                required
                            />
                        </div>
                    </div>

             {/* Stay Type Selection */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Stay Type</label>
                        <select
                            name="stay_type"
                            value={formData.stay_type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Stay Type</option>
                            <option value="monthly">Monthly</option>
                            <option value="half-month">Half-Month</option>
                            <option value="weekly">Weekly</option>
                            <option value="daily">Daily</option>
                        </select>
                    </div>
                </div>

                {unitPrice && (
                    <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                        Estimated Price: ₱{parseFloat(unitPrice).toLocaleString()}
                    </p>
                )}

                {/* Duration based on Stay Type */}
                {formData.stay_type === "monthly" && (
                    <div className="form-group">
                        <label>Duration (Months)</label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Duration</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} month{ i > 0 && 's' }
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                {formData.stay_type === "half-month" && (
                <div className="form-group">
                    <label>Duration</label>
                    <input
                    type="text"
                    name="duration"
                    value={formData.duration ? `${formData.duration} days` : ''}
                    readOnly
                    />
                </div>
                )}


                    {formData.stay_type === "weekly" && (
                        <div className="form-group">
                            <label>Duration (Weeks)</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Duration</option>
                                {Array.from({ length: 12 }, (_, i) => ( // Allow 1 to 12 weeks (or more if needed)
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} week{ i > 0 && 's' }
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}


                    {formData.stay_type === "daily" && (
                        <div className="form-group">
                            <label>Duration (Days)</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Duration</option>
                                {Array.from({ length: 30 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} day{ i > 0 && 's' }
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reservationFee > 0 && (
                        <div className="form-group">
                            <label>Upload Payment Receipt (₱{reservationFee})</label>
                            <input 
                                type="file" 
                                onChange={handleReceiptUpload} 
                                accept="image/*,video/*,application/*"
                                required={true}
                            />
                        </div>
                    )}
                    {paymentData.reference_number && (
                        <div className="payment-preview">
                            <h4>📄 Payment Details Preview</h4>
                            <p><strong>Reference Number:</strong> {paymentData.reference_number}</p>
                            <p><strong>Amount:</strong> ₱{paymentData.amount}</p>
                        </div>
                    )}

                <div className="form-group">
                    <label>Contact Number</label>
                    <div className="contact-container">
                        <span className="country-code">+63</span>
                        <input 
                            type="text" 
                            name="contact_number" 
                            value={formData.contact_number} 
                            onChange={handleInputChange} 
                            placeholder="Enter your number" 
                            required 
                            maxLength="10" 
                            pattern="9[0-9]{9}" 
                            title="Must be a valid 10-digit Philippine mobile number starting with 9 (e.g., 9123456789)" 
                        />
                    </div>
                </div>

                {/* Reservation */}
                <div className="form-group">
                <label>Reservation</label>
                <select
                    name="reservation_details"
                    value={formData.reservation_details}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.stay_type || (formData.duration === "" || formData.duration === null)}

                >
                    <option value="">Select a Unit</option>

                    {units.length > 0 && formData.stay_type && (() => {
                    // Step 1: Filter units based on stay_type and available slots
                    const filteredUnits = units
                        .filter(unit => {
                        if (!unit.stay_type || !formData.stay_type) return false;
                        return unit.stay_type.toLowerCase() === formData.stay_type.toLowerCase();
                        })
                        .filter(unit => {
                        const currentUsers = unit.same_staytype_users_count || 0;
                        return currentUsers < unit.max_capacity;
                        });

                    // Step 2: Group by unit_code and keep unit with most slots available
                    const groupedUnits = {};
                    filteredUnits.forEach(unit => {
                        const availableSlots = unit.max_capacity - (unit.same_staytype_users_count || 0);
                        if (!groupedUnits[unit.unit_code] || availableSlots > groupedUnits[unit.unit_code].availableSlots) {
                        groupedUnits[unit.unit_code] = { ...unit, availableSlots };
                        }
                    });

                    const uniqueUnits = Object.values(groupedUnits);

                    if (uniqueUnits.length === 0) return null;

                    return (
                        <optgroup label={`${formData.stay_type.charAt(0).toUpperCase() + formData.stay_type.slice(1)} Stay`}>
                        {uniqueUnits.map(unit => (
                            <option key={`${unit.unit_code}-${unit.stay_type}`} value={unit.unit_code}>
                            {unit.unit_code} - ({unit.availableSlots} slots available)
                            </option>
                        ))}
                        </optgroup>
                    );
                    })()}
                </select>
                </div>


                {/* ID Type Selection and File Upload */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Select ID Type</label>
                        <select
                            name="id_type"
                            value={formData.id_type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select an ID Type</option>
                            <option value="Postal ID">Postal ID</option>
                            <option value="UMID">UMID</option>
                            <option value="National ID">National ID</option>
                            <option value="Passport">Passport</option>
                            <option value="Driver's License">Driver's License</option>
                            <option value="Philhealth ID">Philhealth ID</option>
                            <option value="School ID">School ID</option>
                            <option value="Voter's ID/ Voter's Certification">Voter's ID/ Voter's Certification</option>
                            <option value="PRC ID">PRC ID</option>
                        </select>
                    </div>
                </div>
                {formData.id_type && (
                    <div className="form-row">
                        <div className="form-group">
                            <label>Upload {formData.id_type}</label>
                            <input type="file" name="valid_id" onChange={handleFileChange} required />
                        </div>
                        </div>
)}
                {uploadedValidIdPath && (
                <img 
                    src={uploadedValidIdPath} 
                    alt="Uploaded Valid ID" 
                    style={{ width: '250px', marginTop: '10px', border: '1px solid #ccc' }} 
                />
                )}

                {/* Privacy Checkbox */}
                <div className="form-row">
                    <div className="terms-label">
                        <input
                        type="checkbox"
                        name="accept_privacy"
                        className="accept-privacy-checkbox"
                        checked={formData.accept_privacy}
                        onChange={(e) =>
                            setFormData({ ...formData, accept_privacy: e.target.checked })
                        }
                        required
                        />
                        <label className="terms-text">
                        I accept the{' '}
                        <span
                            className="terms-privacy-trigger"
                            onClick={() => setShowTermsModal(true)}
                        >
                            Terms and Privacy
                        </span>
                        </label>
                    </div>
                    </div>
                <button 
                    type="submit" 
                    className={`send-message-button ${loading ? "loading" : ""}`}

                    disabled={!isVerified || !isIdVerified || loading}
                >
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        "Submit"
                    )}
                </button>
            </form> 
            </div>
            </div>
            {showTermsModal && (
                <div className="terms-modal-overlay">
                        <div className="terms-modal">
                        <h3>Terms and Privacy Policy</h3>
                <p>
                This application collects and uses your personal information for the following purposes:
                </p>
                <ul>
                <li>Reserving dormitory units based on your selected stay type and duration</li>
                <li>Verifying your identity using government-issued ID uploads</li>
                <li>Validating your payment through uploaded GCash receipts</li>
                <li>Creating your tenant profile and account upon admin approval</li>
                </ul>

                <p>By proceeding, you agree that:</p>
                <ul>
                <li>Your personal and contact details may be stored securely in our system</li>
                <li>Uploaded documents (e.g., ID, receipt) will be processed for verification</li>
                <li>Admins reserve the right to accept, decline, or reassign applications</li>
                <li>Any falsified or mismatched information may result in disqualification</li>
                </ul>

                <p>
                We handle all your data with confidentiality and only use it for dormitory processing purposes.
                </p>

                        <button onClick={() => setShowTermsModal(false)} className="close-modal-button">
                            Close
                        </button>
                        </div>
                    </div>
                            )}
                {/* Contact Information */}
                <div className="contact-information">
                <h2>Contact Information</h2>
                <div className="info-block">
                    <i className="fas fa-map-marker-alt"></i>
                    <p> 3/F Fern Building, 827 P. Paredes St., Cor. S.H. Loyola St., Sampaloc, Manila 1008</p>
                </div>
                <div className="info-block">
                    <i className="fas fa-phone-alt"></i>
                    <p> (+63) 9225927385</p>
                </div>
                <div className="info-block">
                    <i className="fab fa-facebook-square"></i>
                    <a href="https://www.facebook.com/profile.php?id=61551676772866" target="_blank" rel="noopener noreferrer"> Visit Our Page</a>
                </div>

                {/* Additional Information */}
                <div className="info-block">
                    <i className="fas fa-clock"></i>
                    <p>Operating Daily</p>
                </div>
                <div className="info-block">
                    <i className="fas fa-envelope"></i>
                    <a href="mailto:seagold.service@gmail.com"> seagold.service@gmail.com</a>
                </div>

                {/* Google Maps Embed (Responsive) */}
                <div className="info-block">
                <i className="fas fa-map"></i>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.9160055625625!2d120.98647147414962!3d14.603860476998744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ca01e23c3fad%3A0x98f04273c1fedfbc!2sSeagold%20Dormitory!5e0!3m2!1sen!2sph!4v1745849998745!5m2!1sen!2sph"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"

                    
                ></iframe>
                </div>
                </div>
                </div>
                )}

export default ContactUs;