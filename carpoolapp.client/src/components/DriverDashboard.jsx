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

        const fetchData = async () => {
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

                setRidesWithRequests(ridesWithAccepted);
                setTimestamp(timestamp);
                setLoading(false);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                setLoading(false);
            }
        };

        fetchData();
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

    const formatRoute = (origin, stops, destination) => {
        let parsedStops = [];
        try {
            parsedStops = typeof stops === "string" ? JSON.parse(stops) : stops || [];
        } catch {
            parsedStops = [];
        }
        const fullRoute = [origin, ...parsedStops, destination];
        return fullRoute.join(" → ");
    };

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <h2>Driver Dashboard</h2>
            <p><strong>Last Updated:</strong> {new Date(timestamp).toLocaleString()}</p>

            <h3>Your Rides & Incoming Requests</h3>
            {ridesWithRequests.length === 0 ? (
                <p><i>No rides offered yet.</i></p>
            ) : (
                ridesWithRequests.map((ride) => (
                    <div
                        key={ride.rideId}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "16px",
                            marginBottom: "24px"
                        }}
                    >
                        <h4>Ride ID: {ride.rideId}</h4>
                        <p><strong>Route:</strong> {formatRoute(ride.origin, ride.routestops, ride.destination)}</p>
                        <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicle}</p>
                        <p><strong>Seats Available:</strong> {ride.availableSeats}</p>
                        <p><strong>Price per Seat:</strong> Rs. {ride.pricePerSeat}</p>
                        <button
                            onClick={() => navigate(`/chat/${ride.rideId}`)}
                            style={{
                                marginTop: "10px",
                                padding: "8px 12px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Go to Messages
                        </button>

                        <h5>Accepted Passengers</h5>
                        {ride.acceptedPassengers?.length > 0 ? (
                            ride.acceptedPassengers.map((passenger) => (
                                <div
                                    key={passenger.requestId}
                                    style={{
                                        borderBottom: "1px solid #eee",
                                        paddingBottom: "8px",
                                        marginBottom: "8px"
                                    }}
                                >
                                    <p><strong>Name:</strong> {passenger.passengerName}</p>
                                    <p><strong>Pickup:</strong> {passenger.pickupLocation}</p>
                                    <p><strong>Dropoff:</strong> {passenger.dropoffLocation}</p>
                                </div>
                            ))
                        ) : (
                            <p><i>No accepted passengers yet.</i></p>
                        )}

                        <h5>Incoming Requests</h5>
                        {ride.requests?.length === 0 ? (
                            <p><i>No pending requests.</i></p>
                        ) : (
                            ride.requests.map((req) => (
                                <div
                                    key={req.requestId}
                                    style={{
                                        marginTop: "10px",
                                        padding: "10px",
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: "4px"
                                    }}
                                >
                                    <p><strong>Passenger:</strong> {req.passengerName}</p>
                                    <p><strong>Pickup:</strong> {req.pickupLocation}</p>
                                    <p><strong>Dropoff:</strong> {req.dropoffLocation}</p>
                                    <button
                                        onClick={() => handleRideRequest(req.requestId, "accept")}
                                        style={{ marginRight: "10px" }}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRideRequest(req.requestId, "reject")}
                                        style={{ background: "red", color: "white" }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ))
            )}

            <div style={{ marginTop: "30px", display: "flex", gap: "12px" }}>
                <button onClick={() => navigate("/create-ride")}>Create Ride</button>
                <button onClick={() => navigate("/driver-profile")}>View Profile / Manage Vehicles</button>
            </div>
        </div>
    );
}
