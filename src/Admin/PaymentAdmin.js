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
                fetch(`http://localhost:8000/api/payments?${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:8000/api/unpaid-tenants?${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { data: [] };
            const unpaidData = unpaidRes.ok ? await unpaidRes.json() : [];

            const payments = Array.isArray(paymentsData.data) ? paymentsData.data : [];
            const unpaid = Array.isArray(unpaidData) ? unpaidData : [];

            const merged = [
                ...payments.map((p) => ({
                    id: p.id,
                    user_id: p.user_id,
                    name: p.tenant_name,
                    unit_code: p.unit_code || 'N/A',
                    total_due: `₱${parseFloat(p.amount).toFixed(2)}`,
                    balance: '₱0.00',
                    due_date: '-',
                    status: p.status,
                    receipt_path: p.receipt_path || null,
                })),
                ...unpaid.map((u) => ({
                    id: u.id,
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

    const handleStatusUpdate = async (user_id, status) => {
        const token = localStorage.getItem('token');
    
        try {
            const endpoint =
                status === 'Confirmed'
                    ? `http://localhost:8000/api/payments/confirm/${user_id}`
                    : `http://localhost:8000/api/payments/reject/${user_id}`;
    
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

    // Group tenants by unit
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
                                <th>Due Date</th>
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
                                        <td>{tenant.due_date}</td>
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
                                                    <p>Amount Given: ₱{(tenant.total_paid || 0).toFixed(2)}</p>
                                                    <p>Payment Type: {tenant.payment_type}</p>
                                                    <p>Payment Date: {tenant.payment_date}</p>
                                                    <p>Reference Number: {tenant.reference_number}</p>
                                                    <p>Remaining Months: {tenant.remaining_months}</p>
                                                    <p>Remaining Balance: ₱{(tenant.remaining_balance || 0).toFixed(2)}</p>
                                                    {tenant.receipt_path && (
                                                        <>
                                                            {console.log('Image Path:', tenant.receipt_path)} {/* Log the receipt path */}
                                                            <img
                                                                src={`${tenant.receipt_path}`} // Explicitly using the full path
                                                                alt="Receipt"
                                                                className="receipt-preview"
                                                            />
                                                        </>
                                                    )}




                                                    {/* Confirm and Reject Buttons */}
                                                    {tenant.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusUpdate(tenant.user_id, 'Confirmed')
                                                            }
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusUpdate(tenant.user_id, 'Rejected')
                                                            }
                                                        >
                                                            Reject
                                                        </button>
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
