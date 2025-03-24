import React from 'react';
import './CreateAccount.css';

const CreateAccount = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // If the modal is not open, don't render anything

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close button for the modal */}
        <button className="close-button" onClick={onClose}>×</button>

        <h1>Create Account</h1>
        <form>
          <div className="input-group">
            <input type="text" placeholder="Username" required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" required />
          </div>
          <button type="submit" className="modal-submit-button">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
