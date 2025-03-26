import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
    const [message, setMessage] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // Redirect if not authenticated or wrong role
        if (!token || role !== 'driver') {
            navigate('/');
            return;
        }

        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/api/driverdashboard', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessage(res.data.message);
                setTimestamp(res.data.timestamp);
                setLoading(false);
            } catch (err) {
                console.error('Unauthorized or error fetching dashboard:', err);
                navigate('/');
            }
        };

        fetchDashboard();
    }, [navigate]);

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div>
            <h2>Driver Dashboard</h2>
            <p>{message}</p>
            <p><strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}</p>
        </div>
    );
}
