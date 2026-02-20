import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { verifyOTP, sendOTP } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../components/ui';

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
        <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-brand-100/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Login</span>
                </button>

                {/* Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-card border border-warm-200/50">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
                            <Shield className="w-8 h-8 text-brand-600" />
                        </div>
                        <h1 className="text-2xl font-bold font-heading text-slate-900 mb-2">Verify OTP</h1>
                        <p className="text-slate-500 text-sm">
                            We sent a 6-digit code to<br />
                            <span className="font-bold text-slate-800">{phone}</span>
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex gap-1.5 justify-center w-full">
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
                                    className="flex-1 max-w-[2.75rem] h-14 text-center text-2xl font-heading font-bold bg-warm-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 caret-brand-500"
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={() => handleVerify()}
                                disabled={loading || otp.some(d => d === '')}
                                size="lg"
                                className="w-full h-14 rounded-xl text-lg shadow-lg shadow-brand-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify & Continue</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-slate-400 text-sm font-medium">
                                        Resend code in <span className="text-brand-600">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        className="text-brand-600 font-bold text-sm hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
