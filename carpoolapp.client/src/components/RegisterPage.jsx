import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            const res = await axios.post('/api/Auth/register', {
                fullName,
                universityEmail: email,
                phoneNumber: phone,
                password
            });

            if (res.data.success) {
                alert(res.data.message); // shows: "User registered successfully."
            } else {
                alert(res.data.message); // fallback just in case
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed.');
        }
    };


    return (
        <div>
            <h2>Register to UniRide</h2>
            <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input placeholder="University Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Sign Up</button>
        </div>
    );
}
