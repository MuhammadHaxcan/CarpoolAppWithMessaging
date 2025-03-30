import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PassengerDashboard() {
    const [rides, setRides] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestStatuses, setRequestStatuses] = useState({});
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [rideLocationsMap, setRideLocationsMap] = useState({});
    const [customPickup, setCustomPickup] = useState(false);
    const [customDropoff, setCustomDropoff] = useState(false);

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

                const ridesData = res.data;
                setRides(ridesData);
                setLoading(false);

                // Fetch ride locations for each ride
                for (const ride of ridesData) {
                    const locationRes = await axios.get(`/api/booking/ride-locations/${ride.rideId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setRideLocationsMap(prev => ({
                        ...prev,
                        [ride.rideId]: locationRes.data.locations
                    }));
                }
            } catch (err) {
                console.error("Unauthorized or error fetching rides:", err);
                navigate("/");
            }
        };

        fetchAvailableRides();
    }, [navigate]);

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
                Destination: destination
            };

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

    const displayRides = searchResults.length > 0 ? searchResults : rides;

    if (loading) return <p>Loading available rides...</p>;

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
                displayRides.map((ride, index) => {
                    const rideLocations = rideLocationsMap[ride.rideId] || [];

                    return (
                        <div key={index}>
                            <p><strong>From:</strong> {ride.origin} → <strong>To:</strong> {ride.destination}</p>
                            <p><strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}</p>
                            <p><strong>Seats:</strong> {ride.availableSeats}</p>
                            <p><strong>Price:</strong> {ride.pricePerSeat} PKR</p>
                            <p><strong>Driver:</strong> {ride.driverName}</p>
                            <p><strong>Vehicle:</strong> {ride.vehicleModel}</p>

                            <p><strong>Route Stops:</strong></p>
                            {Array.isArray(ride.routeStops) && ride.routeStops.length > 0 ? (
                                <ul>{ride.routeStops.map((stop, i) => <li key={i}>{stop}</li>)}</ul>
                            ) : <p>No route stops available</p>}

                            {/* Pickup / Dropoff Location Selectors */}
                            <div>
                                <label>Pickup Location:</label>
                                {customPickup ? (
                                    <input
                                        type="text"
                                        placeholder="Custom pickup location"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                ) : (
                                    <select
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select pickup</option>
                                        {rideLocations.map((loc, i) => (
                                            <option key={i} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                )}
                                <button onClick={() => setCustomPickup(prev => !prev)}>
                                    {customPickup ? "Use Dropdown" : "Custom Pickup"}
                                </button>
                            </div>

                            <div>
                                <label>Dropoff Location:</label>
                                {customDropoff ? (
                                    <input
                                        type="text"
                                        placeholder="Custom dropoff location"
                                        value={dropoffLocation}
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                    />
                                ) : (
                                    <select
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select dropoff</option>
                                        {rideLocations.map((loc, i) => (
                                            <option key={i} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                )}
                                <button onClick={() => setCustomDropoff(prev => !prev)}>
                                    {customDropoff ? "Use Dropdown" : "Custom Dropoff"}
                                </button>
                            </div>

                            {/* Ride Request Button */}
                            <button
                                onClick={() => sendRideRequest(ride.rideId, ride.origin, ride.destination)}
                                disabled={requestStatuses[ride.rideId] === "Pending" || requestStatuses[ride.rideId] === "Accepted"}
                            >
                                {requestStatuses[ride.rideId] || "Send Request"}
                            </button>

                            <hr />
                        </div>
                    );
                })
            ) : (
                <p>No available rides.</p>
            )}
        </div>
    );
}
