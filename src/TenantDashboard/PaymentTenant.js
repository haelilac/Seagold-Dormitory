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
    encrypted: true, // To ensure WebSocket connection is encrypted
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
    const [balanceDue, setBalanceDue] = useState({});
    const [availableCredits, setAvailableCredits] = useState(0);
    const [paymentDue, setPaymentDue] = useState(0);
    const [showTransactions, setShowTransactions] = useState(false);
    const [billingDetails, setBillingDetails] = useState([]);
    const [receiptValidated, setReceiptValidated] = useState(false);

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

    // Fetch user data on component mount
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

                if (user.id) {
                    setTenantId(user.id);
                    fetchPaymentData(user.id);
                } else {
                    console.error('User data not found.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    // Subscription to Pusher channels after tenantId is set
    useEffect(() => {
        if (tenantId) {
            window.Echo.channel(`tenant-reminder.${tenantId}`)
                .listen('.payment.reminder', (data) => {
                    alert(data.message);
                })
                .listen('.payment.rejected', () => {
                    alert("❌ Your previous payment was rejected.");
                    fetchPaymentData(tenantId); // Re-fetch updated data
                });
        }
    }, [tenantId]);

    const fetchPaymentData = async (id) => {
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenant-payments/${id}`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });

            if (!res.ok) throw new Error('Failed to fetch payment data.');

            const data = await res.json();
            setUnitPrice(data.unit_price || 0);
            setPaymentHistory(data.payments || []);
            setDueDate(data.due_date);
            setCheckInDate(data.check_in_date);
            setDuration(data.duration);
            setBalanceDue(data.unpaid_balances || {});
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
                    if (!firstPartiallyPaid) firstPartiallyPaid = month;
                }
            } else {
                unpaidMonths.push(month);
            }
        });

        const limitedMonths = [];
        for (let month of months) {
            const status = monthStatus[month];

            if (status && status.remainingBalance > 0) {
                limitedMonths.push(month);
                break;
            }

            if (!status) {
                limitedMonths.push(month);
                break;
            }
        }

        setAvailableMonths(limitedMonths);
        setFirstPartialMonth(limitedMonths[0]);
    };

    const handleAmountChange = (e) => {
        const enteredAmount = parseFloat(e.target.value) || 0;
        setFormData((prevData) => ({
            ...prevData,
            amount: enteredAmount,
            payment_type: enteredAmount < unitPrice ? 'Partially Paid' : 'Fully Paid',
        }));
    };

    const handleAmountBlur = () => {
        setConfirmedAmount(parseFloat(formData.amount) || 0);
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert("❌ Please select a receipt file.");
            return;
        }

        setFormData((prevData) => ({ ...prevData, receipt: file }));

        if (formData.payment_method === 'GCash') {
            setReceiptValidated(false);
            await validateReceipt(file);
        }
    };

    const validateReceipt = async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("receipt", file);
        formDataUpload.append("user_reference", formData.reference_number);
        formDataUpload.append("user_amount", formData.amount);

        try {
            const response = await fetch("https://seagold-laravel-production.up.railway.app/api/validate-receipt", {
                method: "POST",
                body: formDataUpload,
            });

            const result = await response.json();

            if (response.ok && result.match) {
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.payment_for) {
            alert('❌ Please select a payment period.');
            return;
        }

        const hasPendingPaymentForMonth = paymentHistory.some(
            (payment) => payment.payment_period === formData.payment_for && payment.status === "Pending"
        );

        if (hasPendingPaymentForMonth) {
            alert("⚠️ You already have a pending payment for this month.");
            return;
        }

        const requestData = new FormData();
        requestData.append('amount', formData.amount);
        requestData.append('payment_method', formData.payment_method);
        requestData.append('payment_type', formData.payment_type);
        requestData.append('reference_number', formData.reference_number);
        requestData.append('payment_for', formData.payment_for);
        requestData.append('receipt', formData.receipt);

        try {
            const response = await fetch('https://seagold-laravel-production.up.railway.app/api/payments', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}` },
                body: requestData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                alert(`❌ Payment failed: ${responseData.message || "An error occurred. Please try again."}`);
                return;
            }

            alert('✅ Payment submitted successfully!');
            setFormData({ payment_for: '', reference_number: '', receipt: null, amount: '', payment_method: '' });
            fetchPaymentData(tenantId);

        } catch (error) {
            console.error("❌ Error submitting payment:", error);
            alert("❌ Server error: Please try again later.");
        }
    };

    return (
        <div ref={ref} className={`payment-container payment-background ${isCompact ? 'compact-mode' : ''}`}>
            {/* Add your component UI here */}
        </div>
    );
};

export default PaymentTenant;
