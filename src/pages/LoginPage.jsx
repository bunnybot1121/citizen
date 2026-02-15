import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { sendOTP } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginDemo } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);

        try {
            await sendOTP('+91' + phone);
            toast.success('OTP sent successfully!');
            navigate('/verify-otp', { state: { phone: '+91' + phone } });
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Shield className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Nagarsevak</h1>
                        <p className="text-blue-100">Citizen Reporting Platform</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                        <p className="text-gray-600 mb-6">
                            Enter your mobile number to continue
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Number
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-semibold">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                                        placeholder="98765 43210"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Sending OTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send OTP</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    loginDemo();
                                    navigate('/home');
                                    toast.success('Entered Demo Mode');
                                }}
                                className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
                            >
                                Skip Login (Demo Mode) →
                            </button>
                        </div>

                        <div className="mt-8 text-center text-sm text-gray-600">
                            <p>By continuing, you agree to our</p>
                            <div className="mt-1 space-x-2">
                                <a href="/terms" className="text-blue-600 hover:underline font-medium">Terms</a>
                                <span>·</span>
                                <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
