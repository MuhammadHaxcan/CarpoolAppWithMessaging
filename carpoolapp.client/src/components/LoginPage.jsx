import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // import navigate

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('driver');

    const navigate = useNavigate(); // initialize

    const handleLogin = async () => {
        try {
            const res = await axios.post('/api/auth/login', {
                universityEmail: email,
                password: password,
                role: role
            });

            alert(res.data.message);

            localStorage.setItem('userId', res.data.userId);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('token', res.data.token); // store JWT token

            if (res.data.role === 'driver') {
                navigate('/driver-dashboard');
            } else {
                alert('Passenger login is not yet implemented.');
            }

        } catch (err) {
            console.error("Login error:", err);

            alert(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <div>
            <h2>Login to UniRide</h2>
            <input
                placeholder="University Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div>
                <label>
                    <input
                        type="radio"
                        value="driver"
                        checked={role === 'driver'}
                        onChange={() => setRole('driver')}
                    /> Driver
                </label>
                <label>
                    <input
                        type="radio"
                        value="passenger"
                        checked={role === 'passenger'}
                        onChange={() => setRole('passenger')}
                    /> Passenger
                </label>
            </div>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
