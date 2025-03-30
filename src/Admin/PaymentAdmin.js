import React, { useEffect, useState } from 'react';
import './PaymentAdmin.css';

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
                                                <p>Payment Date: {tenant.payment_date}</p>
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
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default PaymentAdmin;
