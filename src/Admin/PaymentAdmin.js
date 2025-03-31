import React, { useEffect, useState } from 'react';
import './PaymentAdmin.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PaymentAdmin = () => {
    const [mergedData, setMergedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        month: '',
        year: '',
        search: '',
    });
    const [expandedRow, setExpandedRow] = useState(null);
    const [explanation, setExplanation] = useState('');

    const getPaymentStatusCounts = () => {
        const summary = {
            Confirmed: 0,
            Pending: 0,
            Rejected: 0,
            Unpaid: 0,
        };
    
        mergedData.forEach((item) => {
            if (item.status === "Confirmed") summary.Confirmed += 1;
            else if (item.status === "Pending") summary.Pending += 1;
            else if (item.status === "Rejected") summary.Rejected += 1;
            else if (item.status === "Unpaid") summary.Unpaid += 1;
        });
    
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
                fetch(`https://seagold-laravel-production.up.railway.app/api/payments?${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`https://seagold-laravel-production.up.railway.app/api/unpaid-tenants?${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
            const unpaidData = unpaidRes.ok ? await unpaidRes.json() : [];

            const payments = Array.isArray(paymentsData) ? paymentsData : [];

            const merged = [
                ...payments.map((p) => ({
                    id: p.id,
                    user_id: p.user_id,
                    name: p.tenant_name,
                    unit_code: p.unit_code || 'N/A',
                    total_due: `₱${parseFloat(p.amount).toFixed(2)}`,
                    balance: `₱${parseFloat(p.remaining_balance || 0).toFixed(2)}`,
                    due_date: p.payment_period || 'N/A',
                    status: p.status,
                    receipt_path: p.receipt_path || null,
                    payment_type: p.payment_type,
                    payment_method: p.payment_method,
                    reference_number: p.reference_number,
                    payment_date: p.submitted_at,
                    remaining_balance: p.remaining_balance,
                    total_paid: p.amount,
                    remaining_months: '-', // Optional
                    payment_period: p.payment_period
                })),
                ...unpaidData.map((u) => ({
                    id: null,  // No payment ID
                    user_id: u.id,
                    name: u.name,
                    unit_code: u.unit_code || 'N/A',
                    total_due: `₱${parseFloat(u.total_due).toFixed(2)}`,
                    balance: `₱${parseFloat(u.balance).toFixed(2)}`,
                    due_date: u.due_date || 'N/A',
                    status: u.status,
                    receipt_path: null,
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

    const handleStatusUpdate = async (paymentId, status) => {
        const token = localStorage.getItem('token');
        try {
            const endpoint =
            status === 'Confirmed'
                ? `https://seagold-laravel-production.up.railway.app/api/payments/${paymentId}/confirm`
                : `https://seagold-laravel-production.up.railway.app/api/payments/reject/${paymentId}`;
        
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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

    useEffect(() => {
        fetchMergedData();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value.padStart(2, '0') });
    };

    const groupByUnit = (data) => {
        return data.reduce((acc, tenant) => {
            const unit = tenant.unit_code || 'N/A';
            if (!acc[unit]) acc[unit] = [];
            acc[unit].push(tenant);
            return acc;
        }, {});
    };

    const groupedData = groupByUnit(mergedData);
    const sendReminder = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://seagold-laravel-production.up.railway.app/api/tenants/${id}/send-reminder`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (res.ok) {
                alert("Reminder sent!");
            } else {
                alert("Failed to send reminder.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error sending reminder.");
        }
    };
    
    const viewProfile = (id) => {
        // If using React Router
        window.location.href = `/tenant/profile/${id}`;
    };
    
    const markAsPaid = (id) => {
        // Redirect to payment form
        window.location.href = `/payment/form/${id}`;
    };
    
    return (
        
        <div className="admin-payment-container">
            <h2>Admin Payment Dashboard</h2>

            {/* Filters */}
            <div className="payment-filters">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by Tenant or Reference"
                    value={filters.search}
                    onChange={handleFilterChange}
                />
                <select name="month" value={filters.month} onChange={handleFilterChange}>
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Unpaid">Unpaid</option>
                </select>
            </div>

            {/* Table */}
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
                                        <td>
                                        {tenant.payment_date
                                            ? new Date(tenant.payment_date).toLocaleString('en-PH', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })
                                            : 'N/A'}
                                        </td>
                                        <td>{tenant.status}</td>
                                        <td>{tenant.status}</td>
                                        <td>
                                            {tenant.status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={() =>
                                                        setExpandedRow(expandedRow === tenant.id ? null : tenant.id)
                                                    }
                                                >
                                                    {expandedRow === tenant.id ? 'Close' : 'Actions'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRow === tenant.id && (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="expanded-details">
                                                <p>Amount Given: ₱{!isNaN(Number(tenant.total_paid)) ? Number(tenant.total_paid).toFixed(2) : '0.00'}</p>
                                                <p>Remaining Balance: ₱{!isNaN(Number(tenant.remaining_balance)) ? Number(tenant.remaining_balance).toFixed(2) : '0.00'}</p>
                                                <p>Payment Type: {tenant.payment_type}</p>
                                                <p>Payment Method: {tenant.payment_method}</p>
                                                <p>
                                                    Payment Date:{" "}
                                                    {tenant.payment_date
                                                        ? new Date(tenant.payment_date).toLocaleString('en-PH', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })
                                                        : "N/A"}
                                                    </p>
                                                <p>Payment Period: {tenant.payment_period}</p>
                                                <p>Reference Number: {tenant.reference_number}</p>


                                                    {tenant.receipt_path && (
                                                        <img
                                                            src={tenant.receipt_path}
                                                            alt="Receipt"
                                                            className="receipt-preview"
                                                        />
                                                    )}
                                                    {tenant.status?.toLowerCase() === 'pending' && tenant.id && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(tenant.id, 'Confirmed')}>Confirm</button>
                                                        <button onClick={() => handleStatusUpdate(tenant.id, 'Rejected')}>Reject</button>
                                                    </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {/* === Unpaid Tenants Table === */}
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
                                                    .map((tenant) => (
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
                                                                <button onClick={() => viewProfile(tenant.user_id)}>View</button>
                                                                <button onClick={() => markAsPaid(tenant.user_id)}>Mark as Paid</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            <div className="payment-badges">
                <span className="badge unpaid">
                    Unpaid: {mergedData.filter(d => d.status === 'Unpaid').length} tenants
                </span>
                <span className="badge pending">
                    Pending Confirmations: {mergedData.filter(d => d.status === 'Pending').length}
                </span>
            </div>

            <div className="chart-summary">
                <span className="badge unpaid">Unpaid: {summary.Unpaid} tenants</span>
                <span className="badge pending">Pending Confirmations: {summary.Pending}</span>
            </div>

            <div className="chart-container" style={{ width: '100%', height: 300 }}>
                <h3>Payment Status Overview</h3>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={getPaymentStatusCounts()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            <Cell fill="#4CAF50" /> {/* Paid - Green */}
                            <Cell fill="#FFC107" /> {/* Pending - Yellow */}
                            <Cell fill="#F44336" /> {/* Rejected - Red */}
                            <Cell fill="#9E9E9E" /> {/* Unpaid - Gray */}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default PaymentAdmin;
