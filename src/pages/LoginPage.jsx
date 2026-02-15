import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Heart } from 'lucide-react';
import { sendOTP } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';

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
        <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-brand-100/50 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-sm relative z-10 flex flex-col gap-8">
                {/* Branding */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-brand-500 rounded-3xl rotate-3 flex items-center justify-center shadow-lg shadow-brand-500/30 mx-auto transform transition-transform hover:rotate-6">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold font-heading text-slate-900 tracking-tight">Nagarsevak</h1>
                        <p className="text-brand-600 font-medium">Empowering Citizens, Fixing Cities.</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-card border border-warm-200/50">
                    <h2 className="text-xl font-bold font-heading text-slate-800 mb-2">Welcome</h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Enter your mobile number to access civic services and track issues.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                Mobile Number
                            </label>
                            <div className="flex gap-3">
                                <div className="w-16 h-14 bg-warm-50 rounded-2xl flex items-center justify-center border-2 border-transparent text-slate-600 font-bold font-heading">
                                    +91
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="flex-1 h-14 px-4 rounded-2xl bg-warm-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-heading text-lg text-slate-900 placeholder:text-slate-300"
                                    placeholder="98765 43210"
                                    maxLength="10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full h-14 text-lg rounded-xl"
                            disabled={loading || phone.length !== 10}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending OTP...</span>
                                </>
                            ) : (
                                <>
                                    <span>Get OTP</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                loginDemo();
                                navigate('/home');
                                toast.success('Welcome!', { icon: '👋' });
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wider hover:underline underline-offset-4"
                        >
                            Skip Login (Demo Mode) →
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Made with <Heart className="w-3 h-3 inline text-red-400 mx-0.5" /> for our community</p>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
                        <a href="#" className="hover:text-slate-600">Privacy Policy</a>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <a href="#" className="hover:text-slate-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
