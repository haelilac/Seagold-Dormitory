import React, { useEffect, useState } from 'react';
import './PaymentAdmin.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initSummary = () => ({
    Confirmed: 0,
    Pending: 0,
    Rejected: 0,
    Unpaid: 0,
});

const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

const PaymentAdmin = () => {
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

    const fetchTenantPayments = async (tenantId, unpaidMonth) => {
        if (!tenantId) {
            console.warn('❗ tenantId is undefined in fetchTenantPayments');
            return;
          }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/payments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allPayments = await res.json();

            console.log("🔍 All Payments:", allPayments);
            console.log("🗓️ Unpaid Month:", unpaidMonth);
    
            const isSameMonth = (a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return (
                    !isNaN(dateA) && !isNaN(dateB) &&
                    dateA.getFullYear() === dateB.getFullYear() &&
                    dateA.getMonth() === dateB.getMonth()
                );
            };
            
            const filtered = allPayments.filter(p => {
                const sameMonth = isSameMonth(p.payment_period, unpaidMonth);
                console.log('👉 Comparing:', p.payment_period, unpaidMonth, sameMonth);
                console.log('🔍 Comparing IDs:', p.user_id, tenantId, String(p.user_id) === String(tenantId));
                return (
                    p.user_id === tenantId &&
                    p.status !== 'Rejected' &&
                    sameMonth
                );
            });           
            console.log("All payment periods:", allPayments.map(p => p.payment_period));
            console.log("✅ Filtered Payments for Modal:", filtered);
    
            setSelectedTenantPayments(filtered);
            setShowModal(true);
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
                fetch(`https://seagold-laravel-production.up.railway.app/api/payments?${query}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`https://seagold-laravel-production.up.railway.app/api/unpaid-tenants?${query}`, { headers: { Authorization: `Bearer ${token}` } }),
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
                    user_id: u.user_id || u.id,  // ✅ Fallback to `id` if `user_id` is not present
                    name: u.tenant_name || u.name,  // ✅ Normalize tenant name
                    total_due: `₱${parseFloat(u.total_due).toFixed(2)}`,
                    balance: `₱${parseFloat(u.balance).toFixed(2)}`,
                    status: 'Unpaid',
                })),
                
                
            ];
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
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    useEffect(() => { fetchMergedData(); }, [filters]);

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
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenants/${id}/send-reminder`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({})
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
                                <React.Fragment key={tenant.id}>
                                    <tr>
                                        <td>{tenant.name}</td>
                                        <td>{tenant.total_due}</td>
                                        <td>{tenant.balance}</td>
                                        <td>{tenant.payment_period}</td>
                                        <td>{formatDate(tenant.payment_date)}</td>
                                        <td>{tenant.status}</td>
                                        <td>
                                            {tenant.status?.toLowerCase() === 'pending' && (
                                                <button onClick={() =>
                                                    setExpandedRow(expandedRow === tenant.id ? null : tenant.id)
                                                }>
                                                    {expandedRow === tenant.id ? 'Close' : 'Actions'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRow === tenant.id && tenant.id && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="expanded-details">
                                                    <p>Amount Given: ₱{Number(tenant.total_paid).toFixed(2)}</p>
                                                    <p>Remaining Balance: ₱{Number(tenant.remaining_balance).toFixed(2)}</p>
                                                    <p>Payment Type: {tenant.payment_type}</p>
                                                    <p>Payment Method: {tenant.payment_method}</p>
                                                    <p>Payment Date: {formatDate(tenant.payment_date)}</p>
                                                    <p>Reference Number: {tenant.reference_number}</p>
                                                    {tenant.receipt_path && (
                                                        <img src={tenant.receipt_path} alt="Receipt" className="receipt-preview" />
                                                    )}
                                                    {tenant.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(tenant.id, 'Confirmed')}>Confirm</button>
                                                            <button onClick={() => handleStatusUpdate(tenant.id, 'Rejected')}>Reject</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
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
                                    <button onClick={() => {
                                        console.log('⚠️ Calling fetchTenantPayments with:', tenant.user_id, firstDayOfMonth);
                                        if (!tenant.user_id) console.warn("⚠️ Missing user_id for tenant:", tenant);
                                        fetchTenantPayments(tenant.user_id, firstDayOfMonth);
                                        setSelectedTenantName(tenant.name);
                                    }}>View</button>
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
                        <h3>Payment History for {selectedTenantName}</h3>
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
                                            <td>{formatDate(payment.payment_date)}</td>
                                            <td>{payment.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payments made for this month.</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default PaymentAdmin;
