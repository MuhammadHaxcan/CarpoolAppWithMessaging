import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    // Form fields state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
    });

    // UI state
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [error, setError] = useState('');

    // OTP timer state
    const [countdown, setCountdown] = useState(60);
    const [canResendOtp, setCanResendOtp] = useState(false);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Start the OTP timer
    useEffect(() => {
        let timer;
        if (isOtpSent && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prevCount => {
                    if (prevCount <= 1) {
                        setCanResendOtp(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [isOtpSent, countdown]);

    // Send OTP request
    const handleSendOtp = async () => {
        // Reset states
        setError('');
        setCanResendOtp(false);

        // Validate email
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/send-otp',
                { universityEmail: formData.email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setIsOtpSent(true);
                setCountdown(60);
                setCanResendOtp(false);
            } else {
                setError(response.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error("Error details:", err.response);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
    };

    // Verify OTP request
    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            setError('Please enter the OTP.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/verify-otp', {
                universityEmail: formData.email,
                otp: formData.otp,
            });

            if (response.data.success) {
                setIsOtpVerified(true);
                setError('');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        }
    };

    // Complete registration
    const handleRegister = async () => {
        if (!isOtpVerified) {
            setError('Please verify your OTP first.');
            return;
        }

        try {
            const response = await axios.post('/api/auth/register', {
                fullName: formData.fullName,
                universityEmail: formData.email,
                phoneNumber: formData.phone,
                password: formData.password,
            });

            if (response.data.success) {
                // Show success and redirect to login
                alert('Registration successful! Please login to continue.');
                // Redirect to login page or show login form
                // window.location.href = '/login';
            } else {
                setError(response.data.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    // Reset OTP form and timer to request new OTP
    const handleResendOtp = () => {
        setFormData(prev => ({ ...prev, otp: '' }));
        handleSendOtp();
    };

    return (
        <div className="register-container">
            <h2>Register to UniRide</h2>

            {error && <div className="error-message">{error}</div>}

            {!isOtpSent ? (
                <div className="registration-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">University Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your university email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSendOtp}
                        disabled={!formData.email || !formData.fullName || !formData.phone || !formData.password}
                    >
                        Send OTP
                    </button>
                </div>
            ) : !isOtpVerified ? (
                <div className="otp-verification">
                    <h3>Enter OTP sent to {formData.email}</h3>
                    <div className="form-group">
                        <input
                            name="otp"
                            placeholder="Enter 6-digit OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                        />
                    </div>

                    <div className="otp-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleVerifyOtp}
                            disabled={!formData.otp}
                        >
                            Verify OTP
                        </button>

                        {canResendOtp ? (
                            <button
                                className="btn btn-secondary"
                                onClick={handleResendOtp}
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <div className="resend-timer">
                                Resend OTP in {countdown} seconds
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="registration-complete">
                    <h3>OTP Verified!</h3>
                    <p>You're almost done. Click the button below to complete your registration.</p>
                    <button
                        className="btn btn-success"
                        onClick={handleRegister}
                    >
                        Complete Registration
                    </button>
                </div>
            )}
        </div>
    );
}