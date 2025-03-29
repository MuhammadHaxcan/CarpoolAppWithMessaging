import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [rides, setRides] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
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

    // Debounced search effect
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setSearchResults([]);
                return;
            }

            const fetchSearchResults = async () => {
                try {
                    const res = await axios.get(`/api/ridesearch/search?query=${encodeURIComponent(searchTerm.trim())}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setSearchResults(res.data);
                } catch (err) {
                    console.error("Error searching for rides:", err);
                    setSearchResults([]);
                }
            };

            fetchSearchResults();
        }, 300); // delay in ms

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    if (loading) return <p>Loading available rides...</p>;

    const displayRides = searchResults.length > 0 ? searchResults : rides;

    return (
        <div>
            <h2>Passenger Dashboard</h2>

            <div>
                <input
                    type="text"
                    placeholder="Search by source, destination, or route stops"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <h3>Available Rides</h3>
            {displayRides.length > 0 ? (
                displayRides.map((ride, index) => (
                    <div key={index}>
                        <p><strong>From:</strong> {ride.origin || "Unknown"} → <strong>To:</strong> {ride.destination || "Unknown"}</p>
                        <p><strong>Departure:</strong> {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : "Invalid Date"}</p>
                        <p><strong>Seats:</strong> {ride.availableSeats || 0}</p>
                        <p><strong>Price:</strong> {ride.pricePerSeat ? `${ride.pricePerSeat} PKR` : "N/A"}</p>
                        <p><strong>Driver:</strong> {ride.driverName || "Unknown"}</p>
                        <p><strong>Vehicle:</strong> {ride.vehicleModel || "Unknown"}</p>

                        <p><strong>Route Stops:</strong></p>
                        {Array.isArray(ride.routeStops) && ride.routeStops.length > 0 ? (
                            <ul>
                                {ride.routeStops.map((stop, i) => (
                                    <li key={i}>{stop}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No route stops available</p>
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
