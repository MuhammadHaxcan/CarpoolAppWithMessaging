import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
    const [message, setMessage] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [currentRide, setCurrentRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

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
                setCurrentRide(res.data.currentRide);
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

            {currentRide ? (
                <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px', borderRadius: '8px' }}>
                    <h3>Current Offered Ride</h3>
                    <p><strong>From:</strong> {currentRide.origin}</p>
                    <p><strong>To:</strong> {currentRide.destination}</p>
                    <p><strong>Departure:</strong> {new Date(currentRide.departureTime).toLocaleString()}</p>
                    <p><strong>Vehicle:</strong> {currentRide.make} {currentRide.model} ({currentRide.numberPlate})</p>
                    <p><strong>Seats:</strong> {currentRide.availableSeats}</p>
                    <p><strong>Price/Seat:</strong> Rs. {currentRide.pricePerSeat}</p>
                </div>
            ) : (
                <p style={{ marginTop: '20px' }}><i>No active ride currently.</i></p>
            )}

            <div style={{ marginTop: '20px' }}>
                <button onClick={() => navigate('/create-ride')}>Create Ride</button>
                <button onClick={() => navigate('/driver-profile')} style={{ marginLeft: '10px' }}>
                    View Profile / Manage Vehicles
                </button>
            </div>
        </div>
    );
}
