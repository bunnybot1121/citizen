import React, { useState } from 'react';
import { Crown, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SubmittedIssuesList from '../components/profile/SubmittedIssuesList';
import ProfileSettings from '../components/profile/ProfileSettings';

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
            photo: "https://images.unsplash.com/photo-15555" // Placeholder
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Top Banner */}
            <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        <Crown size={20} />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">NagarSevak AI</span>
                </div>
                <div className="flex gap-4 text-sm font-medium text-gray-500">
                    <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
                    <span className="hover:text-blue-600 cursor-pointer">Public Reports</span>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img
                                src="https://ui-avatars.com/api/?name=Rahul+Deshmukh&background=random&size=128"
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                <CheckCircle size={16} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Rahul Deshmukh</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <span className="text-sm">📍 Shivajinagar, Pune</span>
                            </div>
                            <div className="flex gap-3 mt-3">
                                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Citizen ID: #PNE-402
                                </span>
                                <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    12 Total Reports
                                </span>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => navigate('/report')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        <div className="bg-white/20 p-1 rounded-full"><span className="text-lg">+</span></div>
                        Report New Issue
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: My Issues */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Submitted Issues</h2>
                            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                                {['All', 'Pending', 'Resolved'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${filter === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SubmittedIssuesList issues={filteredIssues} />
                    </div>

                    {/* Right Column: Settings */}
                    <div className="lg:col-span-1">
                        <ProfileSettings />

                        {/* Transparency Promise Card */}
                        <div className="bg-blue-600 rounded-2xl p-6 mt-6 text-white shadow-lg shadow-blue-200">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                <Crown size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Transparency Promise</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">
                                Your reports are prioritized using Nagarsevak AI's scheduling algorithm to ensure the most critical city issues are solved first.
                            </p>
                            <a href="#" className="text-xs font-bold underline hover:text-white transition-colors">
                                Learn how it works
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
