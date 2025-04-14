import React, { useState, useEffect } from 'react';
import './PaymentTenant.css';
import { useResizeDetector } from 'react-resize-detector';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getAuthToken } from "../utils/auth";

// Initialize Pusher
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'fea5d607d4b38ea09320', // Replace with your Pusher app key
    cluster: 'ap1', // Replace with your cluster, e.g., 'mt1'
    forceTLS: true, // Use secure connection
    encrypted: true,     // To ensure WebSocket connection is encrypted
});

const PaymentTenant = () => {
    

    const [isCompact, setIsCompact] = useState(false);
    const [currentView, setCurrentView] = useState("dashboard");
    const [currentBillView, setCurrentBillView] = useState("bills");
    const [formData, setFormData] = useState({
        payment_for: '',
        payment_type: '',
        reference_number: '',
        receipt: null,
        amount: '',
    });
    const [unitPrice, setUnitPrice] = useState(0);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [duration, setDuration] = useState(0);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [balanceDue, setBalanceDue] = useState({}); // Track remaining balances
    const [availableCredits, setAvailableCredits] = useState(0);
    const [paymentDue, setPaymentDue] = useState(0);
    const [showTransactions, setShowTransactions] = useState(false);
    const [billingDetails, setBillingDetails] = useState([]);
    const [receiptValidated, setReceiptValidated] = useState(false); // Track receipt validation
    const [firstPartialMonth, setFirstPartialMonth] = useState(null);
    const { width, ref } = useResizeDetector({
        onResize: (width) => {
            if (width < 480) {
                setIsCompact(true);
            } else if (width < 768) {
                setIsCompact(true);
            } else {
                setIsCompact(false);
            }
        }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch('https://seagold-laravel-production.up.railway.app/api/auth/user', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${getAuthToken()}`,
                      'Accept': 'application/json',
                    },
                  });
                const user = await userResponse.json();

                setTenantId(user.id);
                fetchPaymentData(user.id);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        window.Echo.channel(`tenant-reminder.${tenantId}`).listen('.payment.reminder', (data) => {
            alert(data.message);
        });
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) {
            window.Echo.channel(`tenant-reminder.${tenantId}`)
                .listen('.payment.reminder', (data) => {
                    alert(data.message);
                })
                .listen('.payment.rejected', () => {
                    alert("❌ Your previous payment was rejected.");
                    fetchPaymentData(tenantId); // 🔄 Re-fetch updated data
                });
        }
    }, [tenantId]);

    const calculateRemainingBalance = (stayType, duration, unitPrice) => {
        switch (stayType) {
            case 'daily':
                return unitPrice * duration; // Total for the duration (e.g., 500 per day for 6 days)
            case 'weekly':
                const totalWeeks = Math.ceil(duration / 7); // Calculate weeks
                return unitPrice * totalWeeks; // Weekly calculation
            case 'half-month':
                return unitPrice / 2; // Assume half-month pricing is fixed (e.g., ₱1500)
            case 'monthly':
                return unitPrice; // Monthly charge remains the same
            default:
                return unitPrice;
        }
    };
    
    // Call this function where you need to update the remaining balance
    setDisplayedRemainingBalance(calculateRemainingBalance(formData.stay_type, duration, unitPrice));
    

    const [tempAmount, setTempAmount] = useState(""); 
    const [confirmedAmount, setConfirmedAmount] = useState(0); 
    const [displayedRemainingBalance, setDisplayedRemainingBalance] = useState(unitPrice);

    const handleAmountChange = (e) => {
        const enteredAmount = parseFloat(e.target.value) || 0;
        setTempAmount(e.target.value);
    
        // Fetch correct remaining balance based on the selected duration and stay type
        const originalRemainingBalance = calculateRemainingBalance(formData.stay_type, duration, unitPrice);
        
        const newRemainingBalance = Math.max(0, originalRemainingBalance - enteredAmount);
        const newPaymentType = newRemainingBalance > 0 ? 'Partially Paid' : 'Fully Paid';
        
        setFormData((prevData) => ({
            ...prevData,
            amount: enteredAmount,
            payment_type: newPaymentType,
        }));
    
        setDisplayedRemainingBalance(newRemainingBalance);
    };
    
    
    // ✅ Ensures final amount is registered properly on blur
    const handleAmountBlur = () => {
        setConfirmedAmount(parseFloat(tempAmount) || 0);
    };
    
    const [availableCreditsForMonth, setAvailableCreditsForMonth] = useState(0);
    const [nextDueMonth, setNextDueMonth] = useState(null);
    
    const getNextDueMonth = () => {
        for (const month of availableMonths) {
            if (balanceDue[month] > 0) {
                return month;
            }
        }
        return null; // No unpaid months left
    };
    
    const getRemainingBillForMonth = () => {
        const nextDue = getNextDueMonth();
        if (!nextDue) return unitPrice; // No payments made yet, show full price as the due balance
    
        const remainingBalance = balanceDue[nextDue] !== undefined ? balanceDue[nextDue] : unitPrice;
        return parseFloat(remainingBalance); 
    };
    

    useEffect(() => {
        setAvailableCreditsForMonth(getRemainingBillForMonth()); // ✅ Now shows the bill due
        setNextDueMonth(getNextDueMonth());
    }, [balanceDue, availableMonths]);

    const fetchPaymentData = async (id) => {
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenant-payments/${id}`, {
                headers: { Authorization: `Bearer ${getAuthToken()}`            },
            });

            if (!res.ok) throw new Error('Failed to fetch payment data.');

            const data = await res.json();

            setUnitPrice(data.unit_price || 0);
            setPaymentHistory(data.payments || []);
            setDueDate(data.due_date);
            setCheckInDate(data.check_in_date);
            setDuration(data.duration);
            setBalanceDue(data.unpaid_balances || {}); // Fetch remaining balance

            generatePaymentMonths(data.check_in_date, data.duration, data.payments);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setPaymentHistory([]);
        }
    };
    

    const generatePaymentMonths = (startDate, duration, payments) => {
        const months = [];
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + 1);
    
        for (let i = 0; i < duration; i++) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + i);
            const formattedDate = paymentDate.toISOString().split('T')[0];
            months.push(formattedDate);
        }
    
        console.log('Generated Months:', months);
    
        // Separate fully paid, partially paid, and unpaid months
        const monthStatus = {};
        payments.forEach((p) => {
            monthStatus[p.payment_period] = {
                amountPaid: parseFloat(p.amount),
                remainingBalance: parseFloat(p.remaining_balance),
            };
        });
    
        let unpaidMonths = [];
        let partiallyPaidMonths = [];
        let firstPartiallyPaid = null;
    
        months.forEach((month) => {
            if (monthStatus[month]) {
                if (monthStatus[month].remainingBalance > 0) {
                    partiallyPaidMonths.push(month);
                    if (!firstPartiallyPaid) firstPartiallyPaid = month; // ✅ Track the first partially paid month
                }
            } else {
                unpaidMonths.push(month);
            }
        });

        const limitedMonths = [];

            for (let month of months) {
                const status = monthStatus[month];

                if (status && status.remainingBalance > 0) {
                    limitedMonths.push(month); // First partially paid month
                    break;
                }

                if (!status) {
                    limitedMonths.push(month); // First fully unpaid month
                    break;
                }
            }
    
        setAvailableMonths(limitedMonths);
        setFirstPartialMonth(limitedMonths[0]); // ✅ Save first partially paid month
    };
    
    
    const [isScanning, setIsScanning] = useState(false); // Track scanning state

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
    
        if (!file) {
            alert("❌ Please select a receipt file.");
            return;
        }
    
        const selectedMethod = formData.payment_method;
    
        setFormData((prevData) => ({ ...prevData, receipt: file }));
    
        // ✅ Skip validation for Cash
        if (selectedMethod === 'Cash') {
            setReceiptValidated(true);
            console.log("💰 Cash selected — skipping validation.");
            return;
        }
    
        // ✅ Continue with GCash validation
        setReceiptValidated(false);
        setIsScanning(true);
    
        const formDataUpload = new FormData();
        formDataUpload.append("receipt", file);
        formDataUpload.append("user_reference", formData.reference_number);
        formDataUpload.append("user_amount", formData.amount);
    
        try {
            const response = await fetch("https://seagold-laravel-production.up.railway.app/api/validate-receipt", {
                method: "POST",
                body: formDataUpload,
            });
    
            const textResponse = await response.text();
            const result = JSON.parse(textResponse);
    
            if (response.ok && result.match === true) {
                alert("✅ Receipt validated successfully!");
                setReceiptValidated(true);
            } else {
                alert(result.message || "❌ Error processing receipt.");
                setReceiptValidated(false);
            }
        } catch (error) {
            console.error("❌ Error validating receipt:", error);
            alert("❌ Server error while validating receipt.");
            setReceiptValidated(false);
        } finally {
            setIsScanning(false);
        }
    };
    

    const handleMonthSelection = (e) => {
        const selectedMonth = e.target.value;
        
        setFormData((prevData) => ({
            ...prevData,
            payment_for: selectedMonth,
        }));
    
        // ✅ Fetch the correct remaining balance for the selected month
        const originalRemainingBalance = balanceDue[selectedMonth] !== undefined
            ? balanceDue[selectedMonth]  // Get actual remaining balance
            : unitPrice;  // Default to full unit price if no previous payment
    
        // ✅ Reset displayed balance when switching months
        setDisplayedRemainingBalance(originalRemainingBalance);
        setTempAmount("");  // Clear amount input
    };

    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.payment_method === 'GCash' && !receiptValidated) {
            alert("⚠️ Please validate your receipt before submitting the payment.");
            return;
        }
    
        if (!formData.payment_for) {
            alert('❌ Please select a payment period.');
            return;
        }
    
        const hasPendingPaymentForMonth = paymentHistory.some(
            (payment) =>
                payment.payment_period === formData.payment_for &&
                payment.status === "Pending"
        );
    
        if (hasPendingPaymentForMonth) {
            alert("⚠️ You already have a pending payment for this month. Please wait for it to be confirmed or rejected before submitting another.");
            return;
        }
    
        const requestData = new FormData();
        requestData.append('amount', formData.amount);
        requestData.append('payment_method', formData.payment_method);
        requestData.append('payment_type', formData.payment_type);
        requestData.append('reference_number', formData.reference_number);
        requestData.append('payment_for', formData.payment_for);
        requestData.append('receipt', formData.receipt);
        requestData.append('duration', duration); // Pass the duration here
    
        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/payments', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
                body: requestData,
            });
    
            const responseData = await response.json();
    
            if (!response.ok) {
                if (responseData.details?.includes("reference number has already been used")) {
                    alert("❌ The reference number has already been used. Please enter a new one.");
                } else {
                    alert(`❌ Payment failed: ${responseData.message || "An error occurred. Please try again."}`);
                }
                return;
            }
    
            alert('✅ Payment submitted successfully!');
            setFormData({ payment_for: '', reference_number: '', receipt: null, amount: '', payment_method: '' });
            setReceiptValidated(false);
            fetchPaymentData(tenantId);
    
        } catch (error) {
            console.error("Error submitting payment:", error);
            alert("❌ Server error: Please try again later.");
        }
    };
    
    
    return (
        <div ref={ref} className={`payment-container payment-background ${isCompact ? 'compact-mode' : ''}`}>

        {/* 🚀 Dashboard View */}
        {currentView === "dashboard" && (
            <div className="dashboard-container">
                <h1>Tenant Dashboard</h1>

                <div className="balance-section">
                    <div className="balance-box">
                        <p>Remaining Bill for This Month</p>
                        <h2>₱{Number(availableCreditsForMonth || 0).toFixed(2)}</h2>
                    </div>
                    <div className="balance-box due">
                        <p>Next Payment Due</p>
                        <h2>{dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "No Dues"}</h2>
                    </div>
                </div>

                {/* 🚀 Action Buttons */}
                <div className="dashboard-buttons">
                    <button className="pay-now" onClick={() => setCurrentView("payment")}>Pay Now</button>
                    <button className="my-bill" onClick={() => setCurrentView("bills")}>My Bill</button>
                    <button className="transactions" onClick={() => setCurrentView("transactions")}>Transactions</button>
                </div>
            </div>
        )}


            {currentView === "payment" && (
                <div className="payment-page">
                    <h1>Payment Dashboard</h1>
            <p>Current Width: {width}px</p>
            {isCompact && <p>Switched to Compact Mode</p>}
            <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>
            
            {warningMessage && <div className="warning-message">{warningMessage}</div>}
            {unitPrice > 0 && (
                <p>
                    Unit Price: <strong>₱{unitPrice}</strong>
                </p>
            )}



            {/* Payment Form */}
            <form className="payment-form" onSubmit={handleSubmit}>
            <label>Amount to Pay</label>
                <input
                    type="number"
                    name="amount"
                    value={tempAmount}
                    onChange={handleAmountChange} // ✅ Updates live
                    onBlur={handleAmountBlur} // ✅ Confirms final amount when user leaves the field
                />


            <label>Remaining Balance for Selected Month</label>
            <p>₱{formData.payment_for ? displayedRemainingBalance : unitPrice}</p>




            <label>Payment For</label>
                <select
                    name="payment_for"
                    value={formData.payment_for}
                    onChange={handleMonthSelection}
                    required
                >
                    <option value="">Select Payment Date</option>

                    {availableMonths.map((month, index) => (
                        <option key={index} value={month}>
                            {new Date(month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                            {balanceDue[month] > 0 ? " (Partially Paid)" : ""}
                        </option>
                    ))}
                </select>

                <label>Payment Method</label>
                    <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        required
                    >
                        <option value="">Select Payment Method</option>
                        <option value="GCash">GCash</option>
                        <option value="Cash">Cash (Please direct to Landlord)</option>
                    </select>
                <p>
                    <strong>Payment Type:</strong> {formData.payment_type || "N/A"}
                </p>

                {formData.payment_method === 'GCash' && (
                    <>
                        <label>Reference Number</label>
                        <input
                            type="text"
                            name="reference_number"
                            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                            required
                        />

                        <label>Upload Receipt</label>
                        <input
                            type="file"
                            name="receipt"
                            accept="image/png, image/jpeg, image/jpg, application/pdf"
                            onChange={(e) => handleReceiptUpload(e)}
                            required
                        />
                    </>
                )}

                {formData.payment_method === 'Cash' && (
                    <>
                        <label>Optional Proof of Payment (Image)</label>
                        <input
                            type="file"
                            name="receipt"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setFormData((prevData) => ({
                                    ...prevData,
                                    receipt: file || null,
                                    reference_number: `CASH-${Date.now()}` // auto-ref if needed
                                }));
                            }}
                        />
                    </>
                )}

                <button
                    type="submit"
                    disabled={
                        isScanning ||
                        (formData.payment_method === 'GCash' && !receiptValidated && !isScanning)
                    }
                >
                    {formData.payment_method === 'Cash'
                        ? "Submit Cash Payment"
                        : isScanning
                        ? "Scanning Receipt..."
                        : receiptValidated
                        ? "Submit Payment"
                        : "Waiting for Receipt Validation..."}
                </button>


            </form>

            {dueDate && <p>Next Payment Due Date: <strong>{dueDate}</strong></p>}
                </div>
            )}

            {/* 🚀 My Bills Page (Main Bill Page) */}
            {currentView === "bills" && (
                <div className="bills-container">
                    <h1>My Bills</h1>
                    <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>

                    {/* ✅ Navigation to separate pages */}
                    <div className="bill-navigation">
                        <button onClick={() => setCurrentBillView("toPay")}>To Pay</button>
                        <button onClick={() => setCurrentBillView("paid")}>Paid</button>
                    </div>

            {/* ✅ To Pay Section */}
            {currentBillView === "toPay" && (
                <div className="to-pay-section">
                    <h2>Months Remaining to Pay</h2>
                    {availableMonths.length > 0 ? (
                        <ul>
                            {availableMonths.map((month, index) => (
                                <li key={index}>
                                    {new Date(month).toLocaleDateString('default', { month: 'long', year: 'numeric' })} 
                                    {balanceDue[month] > 0 ? " (Partially Paid)" : " (Unpaid)"}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>All months are paid.</p>
                    )}
                </div>
            )}


                    {/* ✅ Paid Section */}
                    {currentBillView === "paid" && (
                        <div className="paid-section">
                            <h2>Months Already Paid</h2>
                            {paymentHistory.length > 0 ? (
                                <ul>
                                    {paymentHistory
                                        .filter(payment => payment.remaining_balance === 0) // Show only fully paid months
                                        .map((payment, index) => (
                                            <li key={index}>
                                                {new Date(payment.payment_period).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p>No months have been fully paid yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 🚀 Transactions Page */}
            {currentView === "transactions" && (
                <div className="transactions-container">
                    <h1>Transaction History</h1>
                    <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>

                    {paymentHistory.length > 0 ? (
                        <div className="payment-history">
                            <table>
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Amount Paid</th>
                                    <th>Remaining Balance</th>
                                    <th>Payment Type</th>
                                    <th>Payment Method</th>
                                    <th>Reference Number</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                                <tbody>
                                    {paymentHistory.map((payment, index) => (
                                        <tr key={index}>
                                            <td>
                                            {new Date(payment.created_at || payment.payment_period).toLocaleString('en-PH', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                            </td>
                                            <td>₱{payment.amount}</td>
                                            <td>₱{payment.remaining_balance}</td>
                                            <td>{payment.payment_method}</td> {/* ✅ "E-Wallet" or "Bank Transfer" */}
                                            <td>{payment.payment_type}</td> {/* ✅ "Partially Paid" or "Fully Paid" */}
                                            <td>{payment.reference_number}</td>
                                            <td>{payment.status}</td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    ) : (
                        <p>No transaction history found.</p>
                    )}
                </div>
            )}
        </div>
    );
};


export default PaymentTenant;
