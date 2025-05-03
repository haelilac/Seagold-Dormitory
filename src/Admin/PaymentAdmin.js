import React, { useEffect, useState } from 'react';
import './PaymentAdmin.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAuthToken } from "../utils/auth";
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useDataCache } from '../contexts/DataContext';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '865f456f0873a587bc36', 
    cluster: 'ap3',
    forceTLS: true,
    encrypted: true,
});

  

const initSummary = () => ({
    Confirmed: 0,
    Pending: 0,
    Rejected: 0,
    Unpaid: 0,
});

const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

const PaymentAdmin = () => {
    const { getCachedData: getCache, updateCache } = useDataCache();
    const [mergedData, setMergedData] = useState([]);  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: '', month: '', year: '', search: '' });
    const [expandedRow, setExpandedRow] = useState(null);
    const [paymentSummary, setPaymentSummary] = useState(initSummary());
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedTenantPayments, setSelectedTenantPayments] = useState([]);
    const [selectedTenantName, setSelectedTenantName] = useState('');
    const [selectedTenantId, setSelectedTenantId] = useState(null);
    const [selectedMonthData, setSelectedMonthData] = useState(null);
    const [showExpandedModal, setShowExpandedModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "auto"; // force scroll back on
  }, []);
    useEffect(() => {
        const channel = window.Echo.channel('admin.payments');
      
        channel.listen('.new.payment', (e) => {
          const newEntry = {
            ...e.payment,
            name: e.payment.user?.name || 'New Tenant',
            unit_code: e.payment.unit?.unit_code || 'N/A',
            total_due: `₱${parseFloat(e.payment.amount).toFixed(2)}`,
            balance: `₱${parseFloat(e.payment.remaining_balance || 0).toFixed(2)}`,
            payment_date: e.payment.created_at,
            status: e.payment.status,
          };
      
          const updated = [...getCache('payments') || [], newEntry];
          updateCache('payments', updated);
          setMergedData(updated);
        });
      
        return () => {
          channel.stopListening('.new.payment');
        };
      }, []);

    const fetchTenantPayments = async (tenantId, unpaidMonth, tenantName) => {
        if (!tenantId) {
            console.warn('❗ tenantId is undefined in fetchTenantPayments');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/payments`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const allPayments = await res.json();
    
            const isSameMonth = (a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return (
                    !isNaN(dateA) && !isNaN(dateB) &&
                    dateA.getFullYear() === dateB.getFullYear() &&
                    dateA.getMonth() === dateB.getMonth()
                );
            };
    
            const filtered = allPayments.filter(p =>
                p.user_id === tenantId &&
                p.status !== 'Rejected' &&
                isSameMonth(p.payment_period, unpaidMonth)
            );
    
            setSelectedTenantPayments(filtered);
            setSelectedTenantName(tenantName);
            setSelectedTenantId(tenantId);
            setShowModal(true);
    
            const monthData = mergedData.find(
                (entry) =>
                    String(entry.id) === String(tenantId) &&
                    isSameMonth(entry.payment_period || entry.due_date, unpaidMonth)
            );
    
            // ✅ Calculate balance BEFORE setting state
            const confirmedOnly = filtered.filter(p => p.status.toLowerCase() === 'confirmed');
            const totalPaid = confirmedOnly.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const unitPrice = parseFloat(monthData?.total_due?.replace('₱', '') || 0);
            const remaining = unitPrice - totalPaid;
    
            // ✅ Now set the full object
            setSelectedMonthData({
                ...monthData,
                balance: `₱${remaining.toFixed(2)}`
            });
        } catch (error) {
            console.error("Error fetching tenant payments:", error);
        }
    };
    
    
    const getYearsFromData = (data) => {
        const years = new Set();
        data.forEach(item => {
            const date = new Date(item.payment_date || item.due_date);
            if (!isNaN(date)) years.add(date.getFullYear());
        });
        return Array.from(years).sort();
    };

    const getPaymentStatusCounts = () => {
        const summary = initSummary();
        mergedData.forEach((item) => {
            summary[item.status] = (summary[item.status] || 0) + 1;
        });
        setPaymentSummary(summary);
        return [
            { name: 'Paid', value: summary.Confirmed },
            { name: 'Pending', value: summary.Pending },
            { name: 'Rejected', value: summary.Rejected },
            { name: 'Unpaid', value: summary.Unpaid },
        ];
    };

    const fetchMergedData = async () => {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams(filters).toString();
        try {
            setLoading(true);
            const [paymentsRes, unpaidRes] = await Promise.all([
                fetch(`https://seagold-laravel-production.up.railway.app/api/payments?${query}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } }),
                fetch(`https://seagold-laravel-production.up.railway.app/api/unpaid-tenants?${query}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } }),
            ]);
            const payments = await paymentsRes.json();
            const unpaid = await unpaidRes.json();
            const merged = [
                ...payments.map((p) => ({
                    ...p,
                    name: p.tenant_name,
                    total_due: `₱${parseFloat(p.amount).toFixed(2)}`,
                    balance: `₱${parseFloat(p.remaining_balance || 0).toFixed(2)}`,
                    payment_date: p.submitted_at,
                    remaining_months: '-',
                })),
                ...unpaid.map((u) => ({
                    ...u,
                    id: u.id || u.user_id,  // ✅ Fallback to `id` if `user_id` is not present
                    name: u.tenant_name || u.name,  // ✅ Normalize tenant name
                    total_due: `₱${parseFloat(u.total_due).toFixed(2)}`,
                    balance: `₱${parseFloat(u.balance).toFixed(2)}`,
                    status: 'Unpaid',
                })),
                
                
            ];
            updateCache('payments', merged);
            setMergedData(merged);
        } catch (err) {
            console.error('Error fetching data:', err.message);
            setError('Unable to load data.');
            setMergedData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const rows = mergedData.map(({ name, unit_code, total_due, status, due_date }) =>
            `${name},${unit_code},${total_due},${status},${due_date}`);
        const csvContent = `data:text/csv;charset=utf-8,Name,Unit,Due,Status,Due Date\n${rows.join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'payment_summary.csv');
        document.body.appendChild(link);
        link.click();
    };

    const handleStatusUpdate = async (paymentId, status) => {
        const token = localStorage.getItem('token');
        const endpoint = status === 'Confirmed'
            ? `https://seagold-laravel-production.up.railway.app/api/payments/${paymentId}/confirm`
            : `https://seagold-laravel-production.up.railway.app/api/payments/${paymentId}/reject`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(`Failed to ${status.toLowerCase()} payment`);
            alert(`Payment ${status} successfully!`);
            setExpandedRow(null);
            fetchMergedData();
        } catch (error) {
            console.error(error.message);
            alert(`Failed to ${status.toLowerCase()} payment`);
        }
    };

    useEffect(() => { getPaymentStatusCounts(); }, [mergedData]);
    useEffect(() => {
        const cached = getCache('payments');
        if (cached?.length > 0) {
          setMergedData(cached);
          setLoading(false);
        } else {
          fetchMergedData(); // only fetch if no cache
        }
      }, []);

    <button onClick={fetchMergedData}>🔄 Refresh Payments</button>

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value.padStart(2, '0') });
    };

    const groupByUnit = (data) => data.reduce((acc, tenant) => {
        const unit = tenant.unit_code || 'N/A';
        acc[unit] = acc[unit] || [];
        acc[unit].push(tenant);
        return acc;
    }, {});

    const sendReminder = async (id) => {
        if (!id) {
          console.warn("⚠️ No tenant ID provided for reminder.");
          return;
        }
      
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenants/${id}/send-reminder`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
      
          const data = await res.json();
          if (res.ok) alert("Reminder sent!");
          else alert("Failed to send reminder: " + data.message);
        } catch (error) {
          console.error("Error sending reminder:", error);
          alert("Error sending reminder.");
        }
      };
      

    const viewProfile = (id) => window.location.href = `/tenant/profile/${id}`;
    const markAsPaid = (id) => window.location.href = `/payment/form/${id}`;
    
const normalizedStatus = selectedStatus.toLowerCase();

const filteredData = selectedStatus === 'All'
    ? mergedData.filter((t) => t.status?.toLowerCase() !== 'unpaid')
    : mergedData.filter((t) => t.status?.toLowerCase() === normalizedStatus);

    const groupedData = selectedStatus !== 'Unpaid'
        ? groupByUnit(filteredData)
        : {};

    const years = getYearsFromData(mergedData);
    if (loading) return <div className="paymentadmin-spinner"></div>;
    return (
        <div className="admin-payment-container">
            <h2>Admin Payment Dashboard</h2>

            <div className="payment-filters">
                <input type="text" name="search" placeholder="Search by Tenant or Reference" value={filters.search} onChange={handleFilterChange} />
                <select name="month" value={filters.month} onChange={handleFilterChange}>
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="">All Years</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button onClick={exportToCSV}>Export CSV</button>
            </div>

            <div className="status-buttons">
                {['All', 'Confirmed', 'Pending', 'Rejected', 'Unpaid'].map((status) => (
                    <button
                    key={status}
                    className={selectedStatus === status ? 'active' : ''}
                    onClick={() => setSelectedStatus(status)}
                    >
                    {status === 'Confirmed' ? 'Paid' : status}
                    </button>
                ))}
                </div>

                {Object.keys(groupedData).map((unit) => (
  <div key={unit} className="unit-section">
    <h3>Unit {unit}</h3>
    <table className="payment-table">
      <thead>
        <tr>
          <th>Tenant</th>
          <th>Total Due</th>
          <th>Balance</th>
          <th>Payment Period</th>
          <th>Date & Time</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {groupedData[unit].map((tenant) => (
          <tr key={tenant.id}>
            <td>{tenant.name}</td>
            <td>{tenant.total_due}</td>
            <td>{tenant.balance}</td>
            <td>{tenant.payment_period}</td>
            <td>{formatDate(tenant.payment_date)}</td>
            <td>{tenant.status}</td>
            <td>
              {tenant.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => {
                    setSelectedPayment(tenant);
                    setShowExpandedModal(true);
                  }}
                >
                  Actions
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))}

            {selectedStatus === 'Unpaid' && (
                <div className="unpaid-section">
                    <h3>Unpaid Tenants</h3>
                    <table className="payment-table unpaid-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Unit</th>
                                <th>Due For (Month)</th>
                                <th>Expected Amount</th>
                                <th>Status</th>
                                <th>Last Payment</th>
                                <th>Unpaid Months</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {mergedData
                            .filter((t) => t.status === 'Unpaid')
                            .map((tenant) => {
                                console.log('🔍 Tenant Row:', tenant); // ✅ move this here
                                const firstDayOfMonth = tenant.due_date.slice(0, 7) + '-01';

                                return (
                                <tr key={tenant.user_id}>
                                    <td>{tenant.name}</td>
                                    <td>{tenant.unit_code}</td>
                                    <td>{tenant.due_date}</td>
                                    <td>{tenant.total_due}</td>
                                    <td>{new Date(tenant.due_date) < new Date() ? 'Overdue' : 'Unpaid'}</td>
                                    <td>{tenant.last_payment ? new Date(tenant.last_payment).toLocaleDateString('en-PH') : 'N/A'}</td>
                                    <td>{tenant.unpaid_months || '1'}</td>
                                    <td>
                                    <button onClick={() => sendReminder(tenant.user_id)}>Send Reminder</button>
                                    <button
                                    onClick={() => {
                                        const firstDayOfMonth = tenant.due_date.slice(0, 7) + '-01';
                                        fetchTenantPayments(tenant.id, firstDayOfMonth, tenant.name);
                                        setSelectedTenantId(tenant.id);
                                        setSelectedMonthData(tenant); // ✅ save balance info
                                    }}
                                    >
                                    View
                                    </button>
                                    <button onClick={() => markAsPaid(tenant.user_id)}>Mark as Paid</button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
            )}
            {showModal && (
                <div className="modal-overlay">
                    <div className="custom-modal-content">
                    <h3>
                        Payment History for {selectedTenantName}{' '}
                        {selectedTenantPayments[0]?.payment_period && (
                            <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>
                            – {new Date(selectedTenantPayments[0].payment_period).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        </h3>
                        <button className="close-modal" onClick={() => setShowModal(false)}>✖</button>
                        {selectedTenantPayments.length > 0 ? (
                            <table className="modal-table">
                                <thead>
                                    <tr>
                                        <th>Amount</th>
                                        <th>Payment Method</th>
                                        <th>Reference</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTenantPayments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>₱{parseFloat(payment.amount).toFixed(2)}</td>
                                            <td>{payment.payment_method}</td>
                                            <td>{payment.reference_number}</td>
                                            <td>{formatDate(payment.submitted_at || payment.payment_date)}</td>
                                            <td>{payment.status}</td>
                                        </tr>
                                    ))}
                                    {selectedMonthData && (
                                        <div className="modal-balance-info">
                                            <p><strong>Remaining Balance:</strong> {selectedMonthData.balance}</p>
                                        </div>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <p>
                            No payments made for this month.
                            {selectedTenantName && selectedTenantId && (
                                <>
                                    Send a reminder to notify <strong>{selectedTenantName}</strong>.
                                    <br />
                                    <button onClick={() => sendReminder(selectedTenantId)}>Send Reminder</button>
                                </>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            )}
{showExpandedModal && selectedPayment && (
  <div className="modal-overlay">
    <div className="custom-modal-content">
      <h3>Payment Details for {selectedPayment.name}</h3>
      <button
        className="close-modal"
        onClick={() => {
          setShowExpandedModal(false);
          setSelectedPayment(null);
        }}
      >
        ✖
      </button>

      <div className="expanded-details">
        <p><strong>Amount Given:</strong> ₱{parseFloat(selectedPayment.amount).toFixed(2)}</p>
        <p><strong>Remaining Balance:</strong> ₱{Number(selectedPayment.remaining_balance).toFixed(2)}</p>
        <p><strong>Payment Type:</strong> {selectedPayment.payment_type}</p>
        <p><strong>Payment Method:</strong> {selectedPayment.payment_method}</p>
        <p><strong>Payment Date:</strong> {formatDate(selectedPayment.payment_date)}</p>
        <p><strong>Reference Number:</strong> {selectedPayment.reference_number}</p>

        {selectedPayment.receipt_path && (
          <img
            src={selectedPayment.receipt_path}
            alt="Receipt"
            className="receipt-preview"
          />
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => handleStatusUpdate(selectedPayment.id, 'Confirmed')}>Confirm</button>
          <button onClick={() => handleStatusUpdate(selectedPayment.id, 'Rejected')}>Reject</button>
        </div>
      </div>
    </div>
  </div>
)}

        </div>
    );
};

export default PaymentAdmin;
