import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { verifyOTP, sendOTP } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function OTPPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const phone = location.state?.phone;

    useEffect(() => {
        if (!phone) navigate('/login');
    }, [phone, navigate]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when complete
        if (newOtp.every(d => d !== '') && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code = null) => {
        const otpCode = code || otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter complete OTP');
            return;
        }

        setLoading(true);

        try {
            const { citizen } = await verifyOTP(phone, otpCode);
            await login(citizen);
            toast.success('Login successful!');
            navigate('/home', { replace: true });
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await sendOTP(phone);
            toast.success('OTP resent successfully!');
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                        <button
                            onClick={() => navigate('/login')}
                            className="mb-4 flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                        <div className="text-center">
                            <Shield className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
                            <p className="text-blue-100">
                                Enter the 6-digit code sent to<br />
                                <span className="font-semibold">{phone}</span>
                            </p>
                        </div>
                    </div>

                    {/* OTP Input */}
                    <div className="p-8">
                        <div className="flex gap-3 justify-center mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => handleVerify()}
                            disabled={loading || otp.some(d => d === '')}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Verify & Continue'
                            )}
                        </button>

                        <div className="mt-6 text-center">
                            {resendTimer > 0 ? (
                                <p className="text-gray-600">
                                    Resend OTP in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
