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

    // Address Data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);


    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvincesAndNCR = async () => {
            try {
                // Fetch Provinces
                const provincesResponse = await axios.get("https://psgc.gitlab.io/api/provinces.json");
                const provinces = provincesResponse.data;
    
                // Fetch NCR (National Capital Region)
                const ncrResponse = await axios.get("https://psgc.gitlab.io/api/regions/130000000/cities-municipalities.json");
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
            const response = await axios.get(`https://seagold-laravel-production.up.railway.app/api/room-pricing`, {
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
                const response = await fetch('https://seagold-laravel-production.up.railway.app/api/units');
                if (!response.ok) throw new Error('Failed to fetch units');
                const data = await response.json();
                console.log('✅ Units fetched:', data); // ✅ Debug here
                setUnits(data);
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
            if (value === "half-month") autoDuration = 15;
            else if (value === "weekly") autoDuration = 7;
            else if (value === "daily") autoDuration = formData.duration || ""; // Allow custom duration for daily
            else if (value === "monthly") autoDuration = "";
    
            setFormData(prev => ({
                ...prev,
                [name]: value,
                duration: autoDuration
            }));
            return;
        }
    
        // Handle other inputs
        setFormData({ ...formData, [name]: value });
    };
    

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("id_type", formData.id_type);  // ✅ Append 'id_type' to FormData
        
        try {
            const response = await fetch("https://seagold-laravel-production.up.railway.app/api/upload-id", { 
                method: 'POST',
                body: formDataUpload,
                headers: { 
                    Accept: 'application/json'
                }
            });
        
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server Error: ${response.status} - ${text}`);
            }
        
            const data = await response.json();
            console.log("Returned file path from backend:", data.file_path);
        
            // ✅ Set formData.valid_id here, now that data is available
            setFormData((prev) => ({
                ...prev,
                valid_id: data.file_path,             // (optional: keep if you want to preview)
                valid_id_url: data.file_path          // ✅ this makes it part of formData!
              }));
        
            setUploadedValidIdPath(data.file_path);
            console.log("Image Preview URL", data.file_path);
        
            if (data.error) {
                alert(`❌ ID Processing Error: ${data.error}`);
                setIsIdVerified(false);
            } else if (data.id_verified) {
                alert(`✅ ID Verified Successfully!\nExtracted Text: ${data.ocr_text}`);
                setIsIdVerified(true);
            } else {
                alert(`❌ ID Mismatch!\nExtracted Text: ${data.ocr_text}`);
                setIsIdVerified(false);
            }
        } catch (error) {
            console.error('Error uploading ID:', error);
            alert("Error processing the ID. Please check the console.");
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
            if (user.emailVerified) {
                setFormData((prev) => ({
                    ...prev,
                    email: user.email,
                    first_name: user.displayName.split(" ")[0],
                    last_name: user.displayName.split(" ").slice(-1)[0],
                }));
                setIsVerified(true);
                alert(`Email verified: ${user.email}`);
            } else {
                alert("Please verify your email in your Google account settings before proceeding.");
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("Failed to verify email. Please try again.");
        }
    };

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
    
        try {
            const requestData = new FormData();
    
            // Append all form fields
            Object.keys(formData).forEach((key) => {
                if (key === 'check_in_date') {
                    requestData.append(key, formatDateTime(formData[key]));
                } else if (key === 'valid_id') {
                    return; // Skip raw file field
                } else {
                    requestData.append(key, formData[key]);
                }
            });
    
            // ✅ Add unit price after FormData is created
            requestData.append("set_price", unitPrice || 0);
    
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/applications', {
                method: 'POST',
                body: requestData,
                headers: { Accept: 'application/json' },
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
        }
    };
    
    const duration = Number(formData.duration);

    return (
        <div className="contact-page-container">
            <div className="get-in-touch">
                <h2>Interested? Be With Us!</h2>
                <form className="contact-form" onSubmit={handleSubmit}>

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
                        <DatePicker
                        selected={formData.birthdate}
                        onChange={(date) => {
                            const formattedDate = date ? date.toISOString().split("T")[0] : ""; // Convert to YYYY-MM-DD
                            setFormData({ ...formData, birthdate: formattedDate });
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select your birthdate"
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
                                value="15 days"
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



                {/* Reservation */}
                <div className="form-group">
                    <label>Reservation</label>
                    <select
                        name="reservation_details"
                        value={formData.reservation_details}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.stay_type || !formData.duration} // Disable if stay type & duration are not selected
                    >
                        <option value="">Select a Unit</option>

                        {formData.stay_type && (
                            <optgroup label={`${formData.stay_type.charAt(0).toUpperCase() + formData.stay_type.slice(1)} Stay`}>
                                {Object.entries(
                                units
                                .filter(unit => unit.monthly_users_count < unit.max_capacity) // changed this line
                                .reduce((acc, unit) => {
                                if (!acc[unit.unit_code]) {
                                    acc[unit.unit_code] = unit;
                                } else if (
                                    (unit.max_capacity - unit.monthly_users_count) >
                                    (acc[unit.unit_code].max_capacity - acc[unit.unit_code].monthly_users_count)
                                ) {
                                    acc[unit.unit_code] = unit;
                                }
                                return acc;
                                }, {})

                                ).map(([unitCode, unit]) => (
                                    <option key={unitCode} value={unit.unit_code}>
                                    {unit.unit_code} - ({unit.max_capacity - unit.monthly_users_count} slots available)
                                    </option>

                                ))}

                            </optgroup>
                            )}
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
                    <div className="form-group">
                        <input
                            type="checkbox"
                            name="accept_privacy"
                            checked={formData.accept_privacy}
                            onChange={(e) =>
                                setFormData({ ...formData, accept_privacy: e.target.checked })
                            }
                            required
                        />
                        <label>
                            I accept the{' '}
                            <span
                                style={{ color: '#607d8b', cursor: 'pointer' }}
                                onClick={() => setShowTermsModal(true)}
                            >
                                Terms and Privacy
                            </span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="send-message-button" disabled={!isVerified || !isIdVerified}>Submit</button>
            </form> 
            </div>
            
                {/* Contact Information */}
                <div className="contact-information">
                    <h2>Contact Information</h2>
                    <p><strong>Address:</strong> 3/F Fern Building, Sampaloc, Manila</p>
                    <p><strong>Phone:</strong> +1235 2355 98</p>
                    <p><strong>Facebook:</strong> <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Visit Our Page</a></p>
                </div>
                
                {/* Terms Modal */}
                {showTermsModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Terms and Privacy</h2>
                            <p>By submitting this form, you agree to our terms and privacy policy. Please ensure all your information is accurate. For more details, contact us directly.</p>
                            <button onClick={() => setShowTermsModal(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        );

    };
export default ContactUs;
