import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
    const [timestamp, setTimestamp] = useState("");
    const [ridesWithRequests, setRidesWithRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "driver") {
            navigate("/");
            return;
        }

        const fetchRidesAndRequests = async () => {
            try {
                const res = await axios.get("/api/driverdashboard/rides-with-requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const rides = res.data.result;
                const timestamp = res.data.timestamp;

                const ridesWithAccepted = await Promise.all(
                    rides.map(async (ride) => {
                        const acceptedRes = await axios.get(
                            `/api/ridemanagement/accepted-passengers/${ride.rideId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        return {
                            ...ride,
                            acceptedPassengers: acceptedRes.data,
                        };
                    })
                );

                setTimestamp(timestamp);
                setRidesWithRequests(ridesWithAccepted);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching rides and accepted passengers:", err);
                setLoading(false);
            }
        };

        fetchRidesAndRequests();
    }, [navigate]);

    const handleRideRequest = async (requestId, action) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`/api/riderequest/${action}/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setRidesWithRequests(prev =>
                prev.map(ride => ({
                    ...ride,
                    requests: ride.requests.filter(req => req.requestId !== requestId)
                }))
            );
        } catch (err) {
            console.error(`Error ${action}ing request:`, err.response?.data || err.message);
        }
    };

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div>
            <h2>Driver Dashboard</h2>
            <p><strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}</p>

            <h3>Your Rides & Incoming Requests</h3>
            {ridesWithRequests.length === 0 ? (
                <p><i>No rides offered yet.</i></p>
            ) : (
                ridesWithRequests.map((ride) => (
                    <div key={ride.rideId} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
                        <h4>Ride ID: {ride.rideId}</h4>
                        <p><strong>From:</strong> {ride.origin}</p>
                        <p><strong>To:</strong> {ride.destination}</p>
                        <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicle}</p>
                        <p><strong>Seats:</strong> {ride.availableSeats}</p>
                        <p><strong>Price/Seat:</strong> Rs. {ride.pricePerSeat}</p>

                        <h5>Accepted Passengers</h5>
                        {ride.acceptedPassengers?.length > 0 ? (
                            ride.acceptedPassengers.map((passenger) => (
                                <div key={passenger.requestId} style={{ borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                                    <p><strong>Passenger:</strong> {passenger.passengerName}</p>
                                    <p><strong>Pickup:</strong> {passenger.pickupLocation}</p>
                                    <p><strong>Dropoff:</strong> {passenger.dropoffLocation}</p>
                                </div>
                            ))
                        ) : (
                            <p><i>No accepted passengers yet.</i></p>
                        )}

                        <h5 style={{ marginTop: "15px" }}>Incoming Requests</h5>
                        {ride.requests.length === 0 ? (
                            <p><i>No pending requests for this ride.</i></p>
                        ) : (
                            ride.requests.map(req => (
                                <div key={req.requestId} style={{ borderTop: "1px solid #eee", paddingTop: "10px", marginTop: "10px" }}>
                                    <p><strong>Passenger:</strong> {req.passengerName}</p>
                                    <p><strong>Pickup:</strong> {req.pickupLocation}</p>
                                    <p><strong>Dropoff:</strong> {req.dropoffLocation}</p>
                                    <button onClick={() => handleRideRequest(req.requestId, "accept")} style={{ marginRight: "10px" }}>
                                        Accept
                                    </button>
                                    <button onClick={() => handleRideRequest(req.requestId, "reject")} style={{ background: "red", color: "white" }}>
                                        Reject
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ))
            )}

            <div style={{ marginTop: "20px" }}>
                <button onClick={() => navigate("/create-ride")}>Create Ride</button>
                <button onClick={() => navigate("/driver-profile")} style={{ marginLeft: "10px" }}>
                    View Profile / Manage Vehicles
                </button>
            </div>
        </div>
    );
}
