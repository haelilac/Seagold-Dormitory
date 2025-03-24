import React, { useState, useEffect } from 'react';
import './LandlordContact.css';


const LandlordContact = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
  

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/settings/landlord-contact');
                const data = await response.json();
                setPhoneNumber(data.phone_number || '');
                setEmail(data.email || '');
            } catch (error) {
                console.error('Error fetching landlord contact:', error);
            }
        };
        fetchContact();
    }, []);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:8000/api/settings/landlord-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, email }),
            });
            const result = await response.json();
            alert(result.message);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating landlord contact:', error);
        } finally {
            setIsUpdating(false);
        }
    };


    return (
        <section id="landlord-contact" className="dashboard-section">
            <h2>Landlord Contact</h2>
            <div className="landlord-contact-container">
                {isEditing ? (
                    <>
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter phone number"
                        />

                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                        />

                        <button onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                ) : (
                    <>
                        <p>
                            <strong>Phone Number: </strong>
                            {phoneNumber || 'N/A'}
                        </p>
                        <p>
                            <strong>Email: </strong>
                            {email || 'N/A'}
                        </p>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                    </>
                )}
            </div>
        </section>
    );
};

export default LandlordContact;
