import React, { useState } from 'react';
import { Crown, LogOut, CheckCircle2, Shield, Settings, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SubmittedIssuesList from '../components/profile/SubmittedIssuesList';
import ProfileSettings from '../components/profile/ProfileSettings';
import { Button } from '../components/ui';

export default function ProfilePage() {
    const { citizen, logout } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All'); // All, Pending, Resolved

    // Mock Issues
    const myIssues = [
        {
            id: 'REP-8902',
            title: "Deep Pothole on Main Road Junction",
            status: "Pending",
            photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80",
            updated_at: new Date().toISOString()
        },
        {
            id: 'REP-8841',
            title: "Broken Streetlight (No. 42)",
            status: "Resolved",
            photo: null
        },
        {
            id: 'REP-8722',
            title: "Major Water Pipe Leakage",
            status: "Resolved",
            photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
        }
    ];

    const filteredIssues = filter === 'All' ? myIssues : myIssues.filter(i => i.status === filter);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-warm-100 pb-24">
            {/* Profile Header */}
            <div className="bg-white pb-8 pt-20 px-4 sm:px-6 rounded-b-[3rem] shadow-soft border-b border-warm-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-600 to-brand-700 pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center md:flex-row md:items-end gap-4 md:gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden relative bg-slate-200">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${citizen?.name || 'Citizen'}&background=random&size=200`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Citizen">
                                <CheckCircle2 size={16} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-1">{citizen?.name || 'Rahul Deshmukh'}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-4">
                                <MapPin size={16} />
                                <span className="text-sm font-medium">Shivajinagar, Pune</span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-brand-100 flex items-center gap-2">
                                    <Shield size={14} />
                                    Citizen ID: #PNE-402
                                </div>
                                <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200">
                                    {myIssues.length} Reports Submitted
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center w-full md:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-warm-200 text-slate-600 bg-white shadow-sm"
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <LogOut size={16} />
                                <span className="hidden md:inline">Logout</span>
                            </Button>
                            <Button onClick={() => navigate('/report')} size="lg" className="rounded-xl shadow-lg shadow-brand-500/20">
                                New Report
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: My Issues */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold font-heading text-slate-900">My Reports</h2>
                            <div className="bg-white p-1 rounded-xl shadow-sm border border-warm-200 flex">
                                {['All', 'Pending', 'Resolved'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === tab ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:bg-warm-50'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SubmittedIssuesList issues={filteredIssues} />
                    </div>

                    {/* Right Column: Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Transparency Promise Card */}
                        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                                <Crown size={24} className="text-white" />
                            </div>
                            <h3 className="font-bold font-heading text-xl mb-2">Citizen Promise</h3>
                            <p className="text-brand-50 text-sm leading-relaxed mb-6">
                                Your reports are prioritized using our AI algorithm to ensure critical city issues are solved first.
                            </p>
                            <button className="text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
                                View Leaderboard
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-warm-200/50">
                            <h3 className="font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-slate-400" />
                                Settings
                            </h3>
                            <ProfileSettings />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
