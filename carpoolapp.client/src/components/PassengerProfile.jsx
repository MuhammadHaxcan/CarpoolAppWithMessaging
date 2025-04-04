import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PassengerProfile() {
    const [acceptedRides, setAcceptedRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'passenger') {
            navigate('/');
            return;
        }

        const fetchAcceptedRides = async () => {
            try {
                const res = await axios.get('/api/passengerprofile/accepted-rides', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAcceptedRides(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching accepted rides:', err);
                setLoading(false);
            }
        };

        fetchAcceptedRides();
    }, [navigate]);

    if (loading) return <p>Loading your profile...</p>;

    return (
        <div>
            <h2>Passenger Profile</h2>
            <h4>Your Accepted Rides</h4>

            {acceptedRides.length === 0 ? (
                <p><i>You have no accepted rides yet.</i></p>
            ) : (
                acceptedRides.map((ride, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}
                    >
                        <h4>Ride ID: {ride.rideId}</h4>
                        <p><strong>From:</strong> {ride.origin}</p>
                        <p><strong>To:</strong> {ride.destination}</p>
                        <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicle}</p>
                        <p><strong>Driver:</strong> {ride.driverName}</p>
                        <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
                        <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
                        <button
                            onClick={() => navigate(`/chat/${ride.rideId}`)}
                            style={{ marginTop: "10px" }}
                        >
                            Go to Messages
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
