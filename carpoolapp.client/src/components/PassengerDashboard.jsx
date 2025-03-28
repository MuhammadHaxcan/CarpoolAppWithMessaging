import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [rides, setRides] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "passenger") {
            navigate("/");
            return;
        }

        const fetchAvailableRides = async () => {
            try {
                const res = await axios.get("/api/passengerdashboard/available-rides", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setRides(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Unauthorized or error fetching rides:", err);
                navigate("/");
            }
        };

        fetchAvailableRides();
    }, [navigate]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(`/api/ridesearch/search?query=${searchTerm.trim()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSearchResults(res.data);
        } catch (err) {
            console.error("Error searching for rides:", err);
            setSearchResults([]);
        }
    };

    if (loading) return <p>Loading available rides...</p>;

    const displayRides = searchResults.length > 0 ? searchResults : rides;

    return (
        <div style={{ color: "white", background: "#222", padding: "20px", borderRadius: "10px" }}>
            <h2>Passenger Dashboard</h2>

            {/* Unified Search Box */}
            <div>
                <input
                    type="text"
                    placeholder="Search by source, destination, or route stops"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: "10px", width: "70%", marginRight: "10px" }}
                />
                <button onClick={handleSearch} style={{ padding: "10px", cursor: "pointer" }}>Search</button>
            </div>

            <h3>Available Rides</h3>
            {displayRides.length > 0 ? (
                displayRides.map((ride, index) => (
                    <div key={index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
                        <strong>From:</strong> {ride.origin || "Unknown"} → <strong>To:</strong> {ride.destination || "Unknown"} <br />
                        <strong>Departure:</strong> {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : "Invalid Date"} <br />
                        <strong>Seats:</strong> {ride.availableSeats || 0} | <strong>Price:</strong> {ride.pricePerSeat ? `$${ride.pricePerSeat} USD` : "N/A USD"} <br />
                        <strong>Driver:</strong> {ride.driverName || "Unknown"} | <strong>Vehicle:</strong> {ride.vehicleModel || "Unknown"} <br />

                        {/* Route Stops Display */}
                        <strong>Route Stops:</strong>
                        {Array.isArray(ride.routeStops) && ride.routeStops.length > 0 ? (
                            <ul style={{ listStyleType: "circle", marginLeft: "20px" }}>
                                {ride.routeStops.map((stop, i) => (
                                    <li key={i}>{stop}</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ marginLeft: "20px", color: "gray" }}>No route stops available</p>
                        )}

                        <hr />
                    </div>
                ))
            ) : (
                <p>No available rides.</p>
            )}
        </div>
    );
}
