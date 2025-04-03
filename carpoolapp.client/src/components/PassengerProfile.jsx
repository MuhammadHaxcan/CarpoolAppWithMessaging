import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerProfile() {
    const [acceptedRides, setAcceptedRides] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const fetchAcceptedRides = async () => {
            try {
                const res = await axios.get("/api/passengerdashboard/accepted-rides", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAcceptedRides(res.data);
            } catch (err) {
                console.error("Error fetching accepted rides:", err);
                navigate("/");
            }
        };

        fetchAcceptedRides();
    }, [navigate, token]);

    const handleMessageClick = (rideId) => {
        navigate(`/chat/${rideId}`); // ✅ Redirect to chat page with ride ID
    };

    return (
        <div>
            <h2>Passenger Profile</h2>
            <h3>Accepted Rides</h3>
            {acceptedRides.length > 0 ? (
                acceptedRides.map((ride, index) => (
                    <div key={index}>
                        <p><strong>From:</strong> {ride.origin} → <strong>To:</strong> {ride.destination}</p>
                        <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                        <p><strong>Seats:</strong> {ride.availableSeats}</p>
                        <p><strong>Price:</strong> {ride.pricePerSeat} PKR</p>
                        <p><strong>Driver:</strong> {ride.driverName}</p>

                        {/* ✅ Show "Message Driver" button only for accepted rides */}
                        <button onClick={() => handleMessageClick(ride.rideId)}>
                            Message Driver
                        </button>

                        <hr />
                    </div>
                ))
            ) : (
                <p>No accepted rides found.</p>
            )}
        </div>
    );
}
