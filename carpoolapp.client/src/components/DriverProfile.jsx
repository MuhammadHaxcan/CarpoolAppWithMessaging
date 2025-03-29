import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DriverProfile() {
    const [vehicles, setVehicles] = useState([]);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [numberPlate, setNumberPlate] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!token || role !== 'driver') {
            navigate('/');
            return;
        }

        fetchVehicles();
    }, [navigate]);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('/api/driver/profile/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vehicles:', err);

            navigate('/');
        }
    };

    const handleAddVehicle = async () => {
        if (!make.trim() || !model.trim() || !numberPlate.trim()) {
            alert('All fields are required!');
            return;
        }

        console.log('Sending Data:', { make, model, numberPlate });

        try {
            const response = await axios.post('/api/driver/profile/vehicle', {
                make,
                model,
                numberPlate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Response:', response.data);

            setMake('');
            setModel('');
            setNumberPlate('');
            fetchVehicles(); // Refresh list
        } catch (err) {
            console.error('Error Response:', err.response?.data);
            alert(err.response?.data?.message || 'Failed to add vehicle.');
        }
    };



    return (
        <div>
            <h2>Driver Profile</h2>

            <h3>Your Vehicles</h3>
            {loading ? (
                <p>Loading vehicles...</p>
            ) : (
                <ul>
                    {vehicles.map(v => (
                        <li key={v.vehicleId}>
                            {`${v.make} ${v.model} - ${v.numberPlate}`}
                        </li>
                    ))}

                </ul>
            )}

            <h3>Add New Vehicle</h3>
            <input
                placeholder="Make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
            />
            <input
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
            />
            <input
                placeholder="Number Plate"
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
            />
            <button onClick={handleAddVehicle}>Add Vehicle</button>
        </div>
    );
}
