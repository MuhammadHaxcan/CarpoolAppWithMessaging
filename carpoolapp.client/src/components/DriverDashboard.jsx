import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
    const [message, setMessage] = useState("");
    const [timestamp, setTimestamp] = useState("");
    const [currentRide, setCurrentRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "driver") {
            navigate("/");
            return;
        }

        const fetchDashboard = async () => {
            try {
                const res = await axios.get("/api/driverdashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setMessage(res.data.message);
                setTimestamp(res.data.timestamp);
                setCurrentRide(res.data.currentRide);
                setLoading(false);
            } catch (err) {
                console.error("Unauthorized or error fetching dashboard:", err);
                navigate("/");
            }
        };

        const fetchIncomingRequests = async () => {
            try {
                const res = await axios.get("/api/riderequest/incoming-requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Incoming Requests:", res.data); // Debugging output
                setIncomingRequests(res.data);
            } catch (err) {
                console.error("Error fetching ride requests:", err);
            }
        };

        fetchIncomingRequests();
        fetchDashboard();
    }, [navigate]);

    const handleRideRequest = async (requestId, action) => {
        const token = localStorage.getItem("token");

        try {
            const url = `/api/riderequest/${action}/${requestId}`; // Ensure correct route
            console.log("Making request to:", url); // Debugging Output

            const res = await axios.post(url, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Response:", res.data);

            // Remove the request from the UI after accepting/rejecting
            setIncomingRequests((prevRequests) =>
                prevRequests.filter((req) => req.requestId !== requestId)
            );
        } catch (err) {
            console.error(`Error ${action}ing ride request:`, err.response?.data || err.message);
        }
    };


    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div>
            <h2>Driver Dashboard</h2>
            <p>{message}</p>
            <p>
                <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}
            </p>

            {currentRide ? (
                <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px", borderRadius: "8px" }}>
                    <h3>Current Offered Ride</h3>
                    <p><strong>From:</strong> {currentRide.origin}</p>
                    <p><strong>To:</strong> {currentRide.destination}</p>
                    <p><strong>Departure:</strong> {new Date(currentRide.departureTime).toLocaleString()}</p>
                    <p><strong>Vehicle:</strong> {currentRide.make} {currentRide.model} ({currentRide.numberPlate})</p>
                    <p><strong>Seats:</strong> {currentRide.availableSeats}</p>
                    <p><strong>Price/Seat:</strong> Rs. {currentRide.pricePerSeat}</p>
                </div>
            ) : (
                <p style={{ marginTop: "20px" }}><i>No active ride currently.</i></p>
            )}

            {/* Incoming Ride Requests */}
            <div style={{ marginTop: "30px" }}>
                <h3>Incoming Ride Requests</h3>
                {incomingRequests.length > 0 ? (
                    <ul>
                        {incomingRequests.map((request) => (
                            <li key={request.requestId} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                                <p><strong>Passenger:</strong> {request.passengerName || "N/A"}</p>
                                <p><strong>Pickup:</strong> {request.pickupLocation || "N/A"}</p>
                                <p><strong>Dropoff:</strong> {request.dropoffLocation || "N/A"}</p>
                                <button onClick={() => handleRideRequest(request.requestId, "accept")} style={{ marginRight: "10px" }}>
                                    Accept
                                </button>
                                <button onClick={() => handleRideRequest(request.requestId, "reject")} style={{ background: "red", color: "white" }}>
                                    Reject
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p><i>No incoming ride requests.</i></p>
                )}
            </div>

            <div style={{ marginTop: "20px" }}>
                <button onClick={() => navigate("/create-ride")}>Create Ride</button>
                <button onClick={() => navigate("/driver-profile")} style={{ marginLeft: "10px" }}>
                    View Profile / Manage Vehicles
                </button>
            </div>
        </div>
    );
}
