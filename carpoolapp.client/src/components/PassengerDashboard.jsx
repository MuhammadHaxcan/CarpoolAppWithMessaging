import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [rides, setRides] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestStatuses, setRequestStatuses] = useState({}); // Track ride request status
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const passengerId = localStorage.getItem("userId"); // Retrieve PassengerId from storage

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
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const sendRideRequest = async (rideId, origin, destination) => {
        try {
            setRequestStatuses((prev) => ({ ...prev, [rideId]: "Pending" }));

            const requestBody = {
                RideId: rideId,
                PickupLocation: pickupLocation,
                DropoffLocation: dropoffLocation,
                Source: origin,
                Destination: destination,
            };

            console.log("Sending Ride Request:", requestBody);

            const res = await axios.post("/api/booking/request-ride", requestBody, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setRequestStatuses((prev) => ({ ...prev, [rideId]: "Requested" }));
                alert("Ride request sent successfully!");
            }
        } catch (error) {
            console.error("Error sending ride request:", error.response?.data || error.message);
            setRequestStatuses((prev) => ({ ...prev, [rideId]: "Failed" }));
        }
    };



    useEffect(() => {
        const fetchRideRequests = async () => {
            try {
                const res = await axios.get("/api/passengerdashboard/ride-requests", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const statusMap = {};
                res.data.forEach((request) => {
                    statusMap[request.rideId] = request.status;
                });

                setRequestStatuses(statusMap);
            } catch (err) {
                console.error("Error fetching ride requests:", err);
            }
        };

        fetchRideRequests();
    }, []);

    if (loading) return <p>Loading available rides...</p>;

    const displayRides = searchResults.length > 0 ? searchResults : rides;

    return (
        <div>
            <h2>Passenger Dashboard</h2>

            {/* Search Bar */}
            <div>
                <input
                    type="text"
                    placeholder="Search by source, destination, or route stops"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Pickup and Dropoff Locations */}
            <div>
                <input
                    type="text"
                    placeholder="Enter Pickup Location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter Dropoff Location"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                />
            </div>

            <h3>Available Rides</h3>
            {displayRides.length > 0 ? (
                displayRides.map((ride, index) => (
                    <div key={index}>
                        <p>
                            <strong>From:</strong> {ride.origin || "Unknown"} → <strong>To:</strong>{" "}
                            {ride.destination || "Unknown"}
                        </p>
                        <p>
                            <strong>Departure:</strong>{" "}
                            {ride.departureTime ? new Date(ride.departureTime).toLocaleString() : "Invalid Date"}
                        </p>
                        <p>
                            <strong>Seats:</strong> {ride.availableSeats || 0}
                        </p>
                        <p>
                            <strong>Price:</strong> {ride.pricePerSeat ? `${ride.pricePerSeat} PKR` : "N/A"}
                        </p>
                        <p>
                            <strong>Driver:</strong> {ride.driverName || "Unknown"}
                        </p>
                        <p>
                            <strong>Vehicle:</strong> {ride.vehicleModel || "Unknown"}
                        </p>

                        <p>
                            <strong>Route Stops:</strong>
                        </p>
                        {Array.isArray(ride.routeStops) && ride.routeStops.length > 0 ? (
                            <ul>
                                {ride.routeStops.map((stop, i) => (
                                    <li key={i}>{stop}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No route stops available</p>
                        )}

                        {/* Ride Request Button */}
                        <button
                            onClick={() => sendRideRequest(ride.rideId, ride.origin, ride.destination, ride.routeStops || [])}
                            disabled={requestStatuses[ride.rideId] === "Pending" || requestStatuses[ride.rideId] === "Accepted"}
                        >
                            {requestStatuses[ride.rideId] || "Send Request"}
                        </button>



                        <hr />
                    </div>
                ))
            ) : (
                <p>No available rides.</p>
            )}
        </div>
    );
}
