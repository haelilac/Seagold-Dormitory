import React, { useState, useEffect } from 'react';
import './PaymentTenant.css';
import { useResizeDetector } from 'react-resize-detector';
import { getAuthToken } from "../utils/auth";
import { useDataCache } from '../contexts/DataContext';
import Select from 'react-select';

const normalized = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};


const PaymentTenant = () => {

    const { getCachedData, updateCache } = useDataCache();
    const getPaymentLabel = (date) => {
      const normalizedDate = normalized(date);
      if (balanceDue[normalizedDate] > 0 && paymentHistory.some(p => normalized(p.payment_period) === normalizedDate && p.amount > 0)) {
        return " (Partially Paid)";
      
      } else if (balanceDue[normalizedDate] > 0) {
        return " (Unpaid)";
      }
      return "";
    };
    
    const [isCompact, setIsCompact] = useState(false);
    const [currentView, setCurrentView] = useState("dashboard");
    const [currentBillView, setCurrentBillView] = useState("bills");
    const [formData, setFormData] = useState({
        payment_for: [],
        payment_type: '',
        reference_number: '',
        receipt: null,            // ← actual file for Laravel
        receipt_url: '',          // ← Cloudinary-validated URL for display
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
    const cachedPayments = tenantId ? getCachedData(`payments-${tenantId}`) : null;
    const [dataLoaded, setDataLoaded] = useState(false);
    const [balanceDue, setBalanceDue] = useState({}); // Track remaining balances
    const [availableCredits, setAvailableCredits] = useState(0);
    const [paymentDue, setPaymentDue] = useState(0);
    const [totalUnpaidAmount, setTotalUnpaidAmount] = useState(0);
    const [showTransactions, setShowTransactions] = useState(false);
    const [billingDetails, setBillingDetails] = useState([]);
    const [receiptValidated, setReceiptValidated] = useState(false); // Track receipt validation
    const [firstPartialMonth, setFirstPartialMonth] = useState(null);
    const [loading, setLoading] = useState(true);
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
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);

    const calculateTotalUnpaidAmount = () => {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      let total = 0;
      for (const [rawMonth, amount] of Object.entries(balanceDue)) {
        const month = normalized(rawMonth); // normalize "2025-06-01" → "2025-06"
        if (month <= currentYearMonth && amount > 0) {
          total += amount;
        }
      }
      return total;
    };


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
    

    const [tempAmount, setTempAmount] = useState(""); 
    const [confirmedAmount, setConfirmedAmount] = useState(0); 
    const [displayedRemainingBalance, setDisplayedRemainingBalance] = useState(unitPrice);

const handleAmountChange = (e) => {
  const enteredAmount = parseFloat(e.target.value) || 0;
  setTempAmount(e.target.value);

  const selectedMonths = formData.payment_for;

  const totalBalance = Array.isArray(selectedMonths)
    ? selectedMonths.reduce((sum, month) => {
        const balance = balanceDue[month] !== undefined ? balanceDue[month] : unitPrice;
        return sum + balance;
      }, 0)
    : (balanceDue[selectedMonths] || unitPrice);

  // Prevent partial payments for non-monthly
  if (formData.stay_type && formData.stay_type !== 'monthly' && enteredAmount < totalBalance) {
    setWarningMessage("⚠️ Partial payments are only allowed for monthly stay type.");
    setFormData((prevData) => ({
      ...prevData,
      amount: '',
      payment_type: '',
    }));
    setTempAmount('');
    setDisplayedRemainingBalance(totalBalance);
    return;
  }

  if (enteredAmount > totalBalance) {
    setWarningMessage("⚠️ You've entered more than the remaining balance.");
  } else {
    setWarningMessage('');
  }

  const newRemaining = Math.max(0, totalBalance - enteredAmount);
  const newType = formData.stay_type === 'monthly' && newRemaining > 0 ? 'Partially Paid' : 'Fully Paid';

  setFormData((prevData) => ({
    ...prevData,
    amount: enteredAmount,
    payment_type: newType,
  }));
  setDisplayedRemainingBalance(newRemaining);
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
        setTotalUnpaidAmount(calculateTotalUnpaidAmount());
    }, [balanceDue, availableMonths]);

    const fetchUserAndPayment = async () => {
        // Skip re-fetch if already loaded
        if (dataLoaded) return;
      
        setLoading(true);
        try {
          const res = await fetch('https://seagold-laravel-production.up.railway.app/api/auth/user', {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              Accept: 'application/json',
            },
          });
      
          const user = await res.json();
          setTenantId(user.id);
      
          const cached = getCachedData(`payments-${user.id}`);
          if (cached) {
            applyPaymentData(cached);
          } else {
            const paymentRes = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenant-payments/${user.id}`, {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
      
            if (!paymentRes.ok) {
              const errorData = await paymentRes.json();
              throw new Error(errorData.error || 'Failed to fetch payments');
            }
            const paymentData = await paymentRes.json();
            updateCache(`payments-${user.id}`, paymentData);
            applyPaymentData(paymentData);
          }
      
          setDataLoaded(true);
      
        } catch (err) {
          console.error("❌ Error loading tenant or payment data:", err);
        } finally {
          setLoading(false);
        }
      };
    useEffect(() => {
        fetchUserAndPayment();
      }, []);
    
    
    const applyPaymentData = (data) => {
      setUnitPrice(data.unit_price || 0);
      setPaymentHistory(data.payments || []);
      setDueDate(data.due_date);
      setCheckInDate(data.check_in_date);
      setDuration(data.duration);
      setBalanceDue(
        Object.fromEntries(
          Object.entries(data.unpaid_balances || {}).map(([key, val]) => [
            normalized(key), parseFloat(val)
          ])
        )
      );

      // 🛠️ Set stay_type
      setFormData((prev) => ({
        ...prev,
        stay_type: data.stay_type || 'monthly',
      }));

      // 🛠️ Delay calling generatePaymentPeriods until unitPrice is available
      // Wrap in a timeout to ensure state is updated first
      setTimeout(() => {
        generatePaymentPeriods(data.check_in_date, data.duration, data.stay_type, data.payments, data.unit_price);
      }, 0);
    };

    
    const generatePaymentPeriods = (startDate, duration, stayType, payments, unitPrice) => {
        const periods = [];
        const checkIn = new Date(startDate);

        let start;
        if (stayType === 'monthly') {
          start = new Date(checkIn);
          start.setMonth(start.getMonth() + 1); // Start 1 month after check-in
          start.setDate(checkIn.getDate());     // Keep the same day (e.g., 23)
        } else {
          start = new Date(checkIn); // No change for non-monthly
        }
        // Generate payment periods based on stayType
        for (let i = 0; i < duration; i++) {
            const paymentDate = new Date(start);
    
            // Handle each stay type differently
            switch (stayType) {
                case 'daily':
                    paymentDate.setDate(start.getDate() + i);  // Increment by day for daily
                    break;
                case 'weekly':
                    paymentDate.setDate(start.getDate() + i * 7);  // Increment by week for weekly
                    break;
                case 'half-month':
                    paymentDate.setDate(start.getDate() + i * 15);  // Increment by half-month (15 days)
                    break;
                case 'monthly':
                    paymentDate.setMonth(start.getMonth() + i);  // Increment by month for monthly
                    break;
                default:
                    paymentDate.setDate(start.getDate() + i);  // Default to daily if unknown stay_type
                    break;
            }
    
            const formattedDate = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

            periods.push(formattedDate);
        }
    
        console.log('Generated Periods:', periods);
    
        // Separate fully paid, partially paid, and unpaid periods
        const periodStatus = {};

        payments.forEach((p) => {
          if ((p.status || '').toLowerCase() !== 'confirmed') return;
          const fullDate = new Date(p.payment_period); // Ex: 2025-04-23
          const monthKey = normalized(fullDate.toISOString()); // → 2025-04

          if (!periodStatus[monthKey]) {
              periodStatus[monthKey] = { amountPaid: 0, remainingBalance: unitPrice };
          }

          periodStatus[monthKey].amountPaid += parseFloat(p.amount);
          periodStatus[monthKey].remainingBalance = Math.max(0, unitPrice - periodStatus[monthKey].amountPaid);
        });
    
        let unpaidPeriods = [];
        let partiallyPaidPeriods = [];
        let firstPartiallyPaid = null;
    
        periods.forEach((period) => {
            if (periodStatus[period]) {
                if (periodStatus[period].remainingBalance > 0) {
                    partiallyPaidPeriods.push(period);
                    if (!firstPartiallyPaid) firstPartiallyPaid = period; // Track first partially paid period
                }
            } else {
                unpaidPeriods.push(period);
            }
        });
    
        const allUnpaidPeriods = periods.filter(period => {
            const status = periodStatus[period];
        
            if (!status) return true; // fully unpaid
            if (status.remainingBalance > 0) return true; // partially paid
            return false; // fully paid
        });
        
        setAvailableMonths(allUnpaidPeriods);
        const earliestWithBalance = periods.find(period => {
          return periodStatus[period]?.remainingBalance > 0 || !periodStatus[period];
        });
        setFirstPartialMonth(earliestWithBalance);
    };
    
    
    const [isScanning, setIsScanning] = useState(false); // Track scanning state

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
    
        if (!file) {
            alert("❌ Please select a receipt file.");
            return;
        }
    
        const selectedMethod = formData.payment_method;
    
        if (selectedMethod === 'Cash') {
            setFormData((prevData) => ({
                ...prevData,
                receipt: file,
                reference_number: `CASH-${Date.now()}`,
            }));
            setReceiptValidated(true);
            console.log("💰 Cash selected — skipping validation.");
            return;
        }
    
        setIsScanning(true);
        setReceiptValidated(false);
    
        try {
            const requestData = new FormData();
            requestData.append('receipt', file); // ✅ send file to FastAPI
            requestData.append('user_reference', formData.reference_number.trim());
            requestData.append('user_amount', formData.amount.toString().replace(/,/g, ''));
    
            const getOcrApiUrl = () => {
                return 'https://seagold-python-production.up.railway.app/validate-payment-receipt/';
            };
    
            const response = await fetch(getOcrApiUrl(), {
                method: 'POST',
                body: requestData,
            });
    
            const result = await response.json();
    
            if (response.ok && result.match === true) {
                alert("✅ Receipt validated successfully!");
                setReceiptValidated(true);
    
                // ✅ Save both file and URL
                setFormData((prev) => ({
                    ...prev,
                    receipt_url: result.receipt_url, // <--- for Laravel fallback or display
                    receipt: file,                   // <--- for Laravel Cloudinary upload
                }));
            } else {
                alert(result.message || "❌ Error processing receipt.");
            }
    
        } catch (error) {
            console.error("❌ Error validating receipt:", error);
            alert("❌ Server error while validating receipt.");
        } finally {
            setIsScanning(false);
        }
    };
    

      const handleMonthSelection = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);

        setFormData((prevData) => ({
          ...prevData,
          payment_for: selected,
        }));

        const totalRemaining = selected.reduce((sum, month) => {
          const balance = balanceDue[month] !== undefined ? balanceDue[month] : unitPrice;
          return sum + balance;
        }, 0);

        setDisplayedRemainingBalance(totalRemaining);
        setTempAmount("");  // reset amount input
      };
      
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize(); // call once
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // 🚫 Guard checks
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
          formData.payment_for.includes(normalized(payment.payment_period)) &&
          payment.status === "Pending"
      );
    
      if (hasPendingPaymentForMonth) {
        alert("⚠️ You already have a pending payment for this month.");
        return;
      }
    
      // 🧾 Prepare request
      const requestData = new FormData();
      requestData.append('amount', formData.amount);
      requestData.append('payment_method', formData.payment_method);
      requestData.append('payment_type', formData.payment_type);
      requestData.append('reference_number', formData.reference_number);
      const checkInDay = new Date(checkInDate).getDate().toString().padStart(2, '0');
      formData.payment_for.forEach((month) => {
        requestData.append('payment_for[]', `${month}-${checkInDay}`);
      });
      
      // ✅ Only attach if there's a file
      if (formData.receipt instanceof File) {
        requestData.append('receipt', formData.receipt);
      }
      
      requestData.append('receipt_url', formData.receipt_url);
      requestData.append('duration', duration);
      requestData.append('stay_type', formData.stay_type);
    
      try {
        const response = await fetch('https://seagold-laravel-production.up.railway.app/api/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: 'application/json' 
          },
          body: requestData
        });
    
        const contentType = response.headers.get("content-type");
    
        // 🧠 Detect if JSON
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
    
          if (!response.ok) {
            if (data.details?.includes("reference number has already been used")) {
              alert("❌ The reference number has already been used.");
            } else {
              alert(`❌ Payment failed: ${data.message || "Unknown error."}`);
            }
            return;
          }
    
          // ✅ Success
          alert('✅ Payment submitted successfully!');
          setFormData({
            payment_for: '',
            reference_number: '',
            receipt: null,
            amount: '',
            payment_method: ''
          });
          setReceiptValidated(false);
          await fetchUserAndPayment();
    
        } else {
          // 💥 Unexpected response format
          const raw = await response.text();
          console.error("❌ Server returned non-JSON:", raw);
          alert("❌ Unexpected server response. Please try again later.");
        }
    
      } catch (error) {
        console.error("❌ Network/server error:", error);
        alert("❌ Server error: Please try again later.");
      }
    };
    
    useEffect(() => {
      if (!formData.payment_for && availableMonths.length > 0) {
        setFormData((prev) => ({ ...prev, payment_for: availableMonths[0] }));
      }
    }, [availableMonths]);

    if (loading) {
        return <div className="payment-tenant-spinner"></div>;
      }
    
      return (
        <div
          ref={ref}
          className={`payment-container payment-background ${isCompact ? 'compact-mode' : ''}`}
        >
          {currentView === 'dashboard' && (
            <div className="dashboard-container">
              <h1>Payment Dashboard</h1>
              <div className="dashboard-buttons">
                <button className={`tab-button ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Payment Dashboard</button>
                <button className={`tab-button ${currentView === 'payment' ? 'active' : ''}`} onClick={() => setCurrentView('payment')}>Pay Now</button>
                <button className={`tab-button ${currentView === 'bills' ? 'active' : ''}`} onClick={() => setCurrentView('bills')}>My Bills</button>
                <button className={`tab-button ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>Transactions</button>
              </div>
              <div className="balance-section">
                <div className="balance-box overdue">
                    <p>Total Unpaid Bills</p>
                    <h2>₱{Number(totalUnpaidAmount || 0).toFixed(2)}</h2>
                  </div>
                <div className="balance-box">
                  <p>Remaining Bill for This Month</p>
                  <h2>₱{Number(availableCreditsForMonth || 0).toFixed(2)}</h2>
                </div>
                <div className="balance-box due">
                  <p>Next Payment Due</p>
                    <h2>
                      {firstPartialMonth && checkInDate ? new Date(`${firstPartialMonth}-${new Date(checkInDate).getDate()}`).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'No Dues'}
                    </h2>
                </div>
              </div>
            </div>
          )}
      
          {currentView === 'payment' && (
            <div className="dashboard-container">
              <h1>Payment Dashboard</h1>
              <div className="payment-page-hearder">
                <h2>Pay Now</h2>
                <div className="dashboard-buttons">
                  <button className={`tab-button ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Payment Dashboard</button>
                  <button className={`tab-button ${currentView === 'payment' ? 'active' : ''}`} onClick={() => setCurrentView('payment')}>Pay Now</button>
                  <button className={`tab-button ${currentView === 'bills' ? 'active' : ''}`} onClick={() => setCurrentView('bills')}>My Bills</button>
                  <button className={`tab-button ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>Transactions</button>
                </div>
              </div>
              {!firstPartialMonth ? (
                <p style={{ textAlign: 'center', padding: '1rem' }}>
                  🎉 All your payments are complete! No dues remaining.
                </p>
              ) : (
                <div className="payment-page">
                  {isCompact && <p>Switched to Compact Mode</p>}
                  {warningMessage && <div className="warning-message">{warningMessage}</div>}
                  {unitPrice > 0 && <p>Unit Price: ₱{unitPrice}</p>}
                  <form className="payment-form" onSubmit={handleSubmit}>
                    <label>Amount to Pay</label>
                    <input
                      type="number"
                      name="amount"
                      disabled={!formData.payment_for} value={tempAmount} onChange={handleAmountChange} onBlur={handleAmountBlur} />
                    <label>Remaining Balance for Selected Month</label>
                    <p>₱{Number(displayedRemainingBalance).toFixed(2)}</p>
                      <label>Payment For</label>
                      <Select
                        isMulti
                        name="payment_for"
                        options={availableMonths.map((month) => ({
                          value: month,
                          label: new Date(month + '-01').toLocaleDateString('default', {
                            month: 'long',
                            year: 'numeric',
                            day: 'numeric'
                          }) + getPaymentLabel(month)
                        }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={availableMonths
                          .map((month) => ({
                            value: month,
                            label: new Date(month + '-01').toLocaleDateString('default', {
                              month: 'long',
                              year: 'numeric',
                              day: 'numeric'
                            }) + getPaymentLabel(month)
                          }))
                          .filter(option => formData.payment_for.includes(option.value))
                        }
                        onChange={(selectedOptions) => {
                          const selectedValues = selectedOptions.map(opt => opt.value);
                          setFormData((prevData) => ({
                            ...prevData,
                            payment_for: selectedValues,
                          }));

                          const totalRemaining = selectedValues.reduce((sum, month) => {
                            const balance = balanceDue[month] !== undefined ? parseFloat(balanceDue[month]) : parseFloat(unitPrice);
                            return sum + (isNaN(balance) ? 0 : balance);
                          }, 0);
                          console.log("💡 balanceDue keys:", Object.keys(balanceDue));
                          console.log("🧾 Selected months:", selectedValues);
                          setDisplayedRemainingBalance(totalRemaining);
                          setTempAmount('');
                        }}
                      />
                    <label>Payment Method</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      required>
                      <option value="">Select Payment Method</option>
                      <option value="GCash">GCash</option>
                      <option value="Cash">Cash (Please direct to Landlord)</option>
                    </select>
                    <label><strong>Payment Type:</strong> {formData.payment_type || 'N/A'}</label>
                    {formData.payment_method === 'GCash' && (
                      <>
                        <label>Reference Number</label>
                        <input type="text" name="reference_number" onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} required />
                        <label>Upload Receipt</label>
                        <input type="file" name="receipt" accept="image/png, image/jpeg, image/jpg, application/pdf" onChange={handleReceiptUpload} required />
                      </>
                    )}
                    {formData.payment_method === 'Cash' && (
                      <>
                        <label>Optional Proof of Payment (Image)</label>
                        <input type="file" name="receipt" accept="image/png, image/jpeg, image/jpg" onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData(prevData => ({
                            ...prevData,
                            receipt: file || null,
                            reference_number: `CASH-${Date.now()}`
                          }));
                        }} />
                      </>
                    )}
                  <button
                    className="submit-payment-button"
                    type="submit"
                    disabled={isScanning || (formData.payment_method === 'GCash' && !receiptValidated && !isScanning)}
                  >
                    {formData.payment_method === 'Cash' && isScanning ? (
                      <>
                        <span className="spinner"></span> Submitting Cash...
                      </>
                    ) : formData.payment_method === 'Cash' ? (
                      'Submit Cash Payment'
                    ) : isScanning ? (
                      'Scanning Receipt...'
                    ) : receiptValidated ? (
                      'Submit Payment'
                    ) : (
                      'Waiting for Receipt Validation...'
                    )}
                  </button>
                  </form>
                  {dueDate && <p>Next Payment Due Date: {dueDate}</p>}
                </div>
              )}
            </div>
          )}
      
          {/* My Bills Page */}
          {currentView === 'bills' && (
            <div className="dashboard-container">
              <h1>Payment Dashboard</h1>
              <div className="bills-container">
                <h2>My Bills</h2>
                <div className="dashboard-buttons">
                  <button className={`tab-button ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Payment Dashboard</button>
                  <button className={`tab-button ${currentView === 'payment' ? 'active' : ''}`} onClick={() => setCurrentView('payment')}>Pay Now</button>
                  <button className={`tab-button ${currentView === 'bills' ? 'active' : ''}`} onClick={() => setCurrentView('bills')}>My Bills</button>
                  <button className={`tab-button ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>Transactions</button>
                </div>
                <div className="bill-sections-grid">
                  <div className="to-pay-section">
                    <h2>Months Remaining to Pay</h2>
                    {availableMonths.length > 0 ? (
                      <ul>
                        {availableMonths.map((month, index) => (
                          <li key={index}>
                            {new Date(month + "-01").toLocaleDateString('default', {

                              weekday: 'long', month: 'long', year: 'numeric'
                            })}{getPaymentLabel(month)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>All months are paid.</p>
                    )}
                  </div>
                  <div className="paid-section">
                    <h2>Months Already Paid</h2>
                    {paymentHistory.length > 0 ? (
                      <ul>
                        {paymentHistory.filter(p => p.remaining_balance === 0).map((payment, index) => (
                          <li key={index}>
                            {new Date(payment.payment_period).toLocaleDateString('default', {
                              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No months have been fully paid yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      
          {/* Transactions Page */}
          {currentView === 'transactions' && (
            <div className="dashboard-container">
              <h1>Payment Dashboard</h1>
              <div className="transactions-container">
                <h2>Transaction History</h2>
                <div className="transaction-dashboard-buttons">
                  <button className={`tab-button ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Payment Dashboard</button>
                  <button className={`tab-button ${currentView === 'payment' ? 'active' : ''}`} onClick={() => setCurrentView('payment')}>Pay Now</button>
                  <button className={`tab-button ${currentView === 'bills' ? 'active' : ''}`} onClick={() => setCurrentView('bills')}>My Bills</button>
                  <button className={`tab-button ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>Transactions</button>
                </div>
                {paymentHistory.length > 0 ? (
                  <div className="payment-history">
                    {isMobile ? (
                      <table><tbody>
                        {paymentHistory.map((p, i) => (
                          <React.Fragment key={i}>
                            <tr><td>Date & Time</td><td>{new Date(p.created_at || p.payment_period).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>
                            <tr><td>Amount Paid</td><td>₱{p.amount}</td></tr>
                            <tr><td>Remaining Balance</td><td>₱{p.remaining_balance}</td></tr>
                            <tr><td>Payment Type</td><td>{p.payment_type}</td></tr>
                            <tr><td>Payment Method</td><td>{p.payment_method}</td></tr>
                            <tr><td>Reference Number</td><td>{p.reference_number}</td></tr>
                            <tr><td>Paid For</td><td>{new Date(p.payment_period).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</td></tr>
                            <tr><td>Status</td><td><span style={{ backgroundColor: p.status.toLowerCase() === 'pending' ? '#bf9e1b' : '#366e39', color: 'white', padding: '4px 8px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.status}</span></td></tr>
                          </React.Fragment>
                        ))}
                      </tbody></table>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Date & Time</th><th>Amount Paid</th><th>Remaining Balance</th><th>Payment Type</th><th>Payment Method</th><th>Reference Number</th><th>Paid For</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((p, i) => (
                            <tr key={i}>
                              <td>{new Date(p.created_at || p.payment_period).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                              <td>₱{p.amount}</td>
                              <td>₱{p.remaining_balance}</td>
                              <td>{p.payment_type}</td>
                              <td>{p.payment_method}</td>
                              <td>{p.reference_number}</td>
                              <td>{new Date(p.payment_period).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                              <td><span style={{ backgroundColor: p.status.toLowerCase() === 'pending' ? '#bf9e1b' : '#366e39', color: 'white', padding: '4px 8px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ) : (
                  <p>No transaction history found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };


export default PaymentTenant;
