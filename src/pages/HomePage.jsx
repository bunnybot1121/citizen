import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, MapPin, Plus, AlertTriangle, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function HomePage() {
    const { citizen } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (citizen) {
            loadData();
        }
    }, [citizen]);

    const loadData = async () => {
        try {
            // Check if Supabase is configured
            const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!isSupabaseConfigured) {
                console.warn('Supabase not configured, using mock data');
                // Use mock data immediately
                setMyIssues(MOCK_ISSUES);
                setStats({ total: 12, pending: 5, resolved: 7 });
                return;
            }

            // Get my issues
            const { data: issues, error: fetchError } = await supabase
                .from('issues')
                .select('*')
                .eq('citizen_id', citizen.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (fetchError) throw fetchError;

            setMyIssues(issues || []);

            // Calculate stats (Mock logic if no data yet, or real aggregation)
            if (issues) {
                setStats({
                    total: issues.length,
                    pending: issues.filter(i => i.status === 'pending').length,
                    resolved: issues.filter(i => i.status === 'resolved').length,
                });
            }
        } catch (error) {
            console.error('Load data error:', error);
            setError(error.message);
            // Fallback to mocks on error so UI doesn't break
            setMyIssues(MOCK_ISSUES);
            setStats({ total: 12, pending: 5, resolved: 7 });
        } finally {
            setLoading(false);
        }
    };

    const MOCK_ISSUES = [
        {
            id: 'mock-1',
            title: "Overflowing Garbage Bin",
            sector: "Solid Waste Management",
            status: "pending",
            upvotes_count: 5,
            comments_count: 2,
            photo: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80",
            created_at: new Date().toISOString()
        },
        {
            id: 'mock-2',
            title: "Pothole on Main Road",
            sector: "Roads",
            status: "resolved",
            upvotes_count: 12,
            comments_count: 4,
            photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80",
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    const StatCard = ({ label, value, icon: Icon, color, bg }) => (
        <div className={`p-4 rounded-2xl ${bg} border border-white/50 shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`p-2 rounded-full ${color} bg-white/50 mb-1`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Sticky Header with Glass effect */}
            <header className="sticky top-0 z-40 glass px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                        Nagarsevak
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Welcome, {citizen?.name?.split(' ')[0] || 'Citizen'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center text-slate-600"
                >
                    <span className="text-lg">👤</span>
                </button>
            </header>

            <div className="px-6 py-6 space-y-8">
                {/* Hero / Quick Stats */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard
                            label="Total"
                            value={stats.total}
                            icon={FileText}
                            color="text-brand-600"
                            bg="bg-brand-50"
                        />
                        <StatCard
                            label="Pending"
                            value={stats.pending}
                            icon={Clock}
                            color="text-amber-500"
                            bg="bg-amber-50"
                        />
                        <StatCard
                            label="Fixed"
                            value={stats.resolved}
                            icon={CheckCircle2}
                            color="text-emerald-500"
                            bg="bg-emerald-50"
                        />
                    </div>
                </div>

                {/* Primary Action */}
                <button
                    onClick={() => navigate('/report')}
                    className="w-full relative overflow-hidden group bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 shadow-xl shadow-brand-500/30 text-white text-left transition-transform active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Camera className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">Report Issue</h3>
                        <p className="text-brand-100 text-sm mt-1 mb-4 max-w-[200px]">
                            Spot a problem? Snap a photo and let us know.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                            Start Report <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>

                {/* Explore Grid */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Explore</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/community')}
                            className="p-5 rounded-2xl bg-white border border-surface-200 shadow-sm flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-700">Community</span>
                        </button>
                        <button
                            onClick={() => navigate('/map')}
                            className="p-5 rounded-2xl bg-white border border-surface-200 shadow-sm flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-700">Map View</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activities */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Recent Updates</h2>
                        <button onClick={() => navigate('/profile')} className="text-brand-600 text-sm font-semibold">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {myIssues.map(issue => (
                            <div
                                key={issue.id}
                                onClick={() => navigate(`/issue/${issue.id}`)}
                                className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm flex gap-4 active:scale-[0.98] transition-all"
                            >
                                <img
                                    src={issue.photo || 'https://placehold.co/100x100'}
                                    alt="Issue"
                                    className="w-20 h-20 rounded-xl object-cover bg-surface-100"
                                />
                                <div className="flex-1 py-1">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {issue.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 line-clamp-1 mt-1">{issue.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{issue.sector}</p>

                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            👍 {issue.upvotes_count || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            💬 {issue.comments_count || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Toast / Config Warning */}
            {(!import.meta.env.VITE_SUPABASE_URL || error) && (
                <div className="fixed bottom-24 left-4 right-4 z-50 animate-float">
                    <div className="glass-card p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-amber-500">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">Connection Issues</p>
                            <p className="text-[10px] text-slate-500">Using offline demo mode</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper for Mock Data (re-import or define if needed)
import { FileText } from 'lucide-react'; 
