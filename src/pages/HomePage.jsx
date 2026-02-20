
// Redesigned HomePage with Warm Civic Theme
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, MapPin, Plus, AlertTriangle, ArrowRight, Clock, CheckCircle2, FileText, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Card, Button } from '../components/ui';
import NotificationDrawer, { useNotifications } from '../components/NotificationDrawer';

export default function HomePage() {
    const { citizen } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [notifOpen, setNotifOpen] = useState(false);
    const { notifications, unreadCount, markAllRead } = useNotifications();

    useEffect(() => {
        if (citizen) {
            loadData();
        }
    }, [citizen]);

    const loadData = async () => {
        try {
            const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!isSupabaseConfigured) {
                console.warn('Supabase not configured, using mock data');
                setMyIssues(MOCK_ISSUES);
                setStats({ total: 12, pending: 5, resolved: 7 });
                return;
            }

            const { data: issues, error: fetchError } = await supabase
                .from('issues')
                .select('*')
                .eq('citizen_id', citizen.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (fetchError) throw fetchError;

            setMyIssues(issues || []);

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

    const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }) => (
        <div className={`p-4 rounded-3xl ${bgClass} border border-transparent shadow-sm flex flex-col items-center justify-center gap-1 flex-1 min-w-0`}>
            <div className={`p-2 rounded-full ${colorClass} bg-white/60 mb-1`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800 font-heading">{value}</span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen pb-24 px-4 pt-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
                        Namaste,<br />
                        <span className="text-brand-600">{citizen?.name?.split(' ')[0] || 'Citizen'}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <button
                        onClick={() => setNotifOpen(true)}
                        aria-label="Open notifications"
                        className="relative w-12 h-12 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-warm-50 transition-colors active:scale-95"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {/* Profile */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-12 h-12 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-warm-50 transition-colors"
                    >
                        <span className="text-xl">👤</span>
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
                <StatCard
                    label="Active"
                    value={stats.pending}
                    icon={Clock}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-100/50"
                />
                <StatCard
                    label="Fixed"
                    value={stats.resolved}
                    icon={CheckCircle2}
                    colorClass="text-secondary-600"
                    bgClass="bg-secondary-100/50"
                />
                <StatCard
                    label="Total"
                    value={stats.total}
                    icon={FileText}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50"
                />
            </div>

            {/* Hero Action */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/report')}
                    className="w-full relative overflow-hidden group bg-brand-500 text-white rounded-[2rem] p-8 shadow-xl shadow-brand-500/20 text-left transition-transform active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 p-0 opacity-10 pointer-events-none">
                        <Camera className="w-48 h-48 transform rotate-12 translate-x-12 -translate-y-8" />
                    </div>

                    <div className="relative z-10 flex flex-col items-start">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold font-heading leading-tight mb-2">
                            Report an<br />Issue
                        </h3>
                        <p className="text-brand-50 text-sm font-medium mb-6 max-w-[200px] leading-relaxed">
                            See something wrong? Snap a photo and let's fix it together.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-white text-brand-600 px-6 py-3 rounded-full text-sm font-bold shadow-sm group-hover:bg-brand-50 transition-colors">
                            Start Report <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Explore Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 font-heading flex items-center gap-2">
                        <span>Explore</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-sm font-normal text-slate-400">Services</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            onClick={() => navigate('/community')}
                            className="bg-white border-none shadow-soft hover:shadow-card transition-all active:scale-[0.98] cursor-pointer flex flex-col items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 font-heading">Community</h3>
                                <p className="text-xs text-slate-500 mt-1">Join discussions</p>
                            </div>
                        </Card>
                        <Card
                            onClick={() => navigate('/map')}
                            className="bg-white border-none shadow-soft hover:shadow-card transition-all active:scale-[0.98] cursor-pointer flex flex-col items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 font-heading">City Map</h3>
                                <p className="text-xs text-slate-500 mt-1">View issues nearby</p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Recent Activities */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 font-heading">Recent Updates</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                            View All
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {myIssues.map(issue => (
                            <div
                                key={issue.id}
                                onClick={() => navigate(`/issue/${issue.id}`)}
                                className="group bg-white p-4 rounded-3xl shadow-soft border border-transparent hover:border-warm-200 flex gap-4 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={issue.photo || 'https://placehold.co/100x100'}
                                        alt="Issue"
                                        className="w-20 h-20 rounded-2xl object-cover bg-surface-100 shadow-inner"
                                    />
                                    <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white ${issue.status === 'resolved' ? 'bg-secondary-100 text-secondary-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {issue.status}
                                    </div>
                                </div>
                                <div className="flex-1 py-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                            {issue.sector}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 font-heading line-clamp-1 mt-2 mb-1 group-hover:text-brand-600 transition-colors">
                                        {issue.title}
                                    </h3>

                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            {issue.upvotes_count || 0} Supports
                                        </div>
                                    </div>
                                </div>
                                <div className="self-center text-slate-300">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Toast / Config Warning */}
            {(!import.meta.env.VITE_SUPABASE_URL || error) && (
                <div className="fixed bottom-24 left-6 right-6 z-50 animate-float pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border-l-4 border-l-amber-500 shadow-xl pointer-events-auto">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">Connection Issues</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Using offline demo mode. Some features may be limited.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Drawer */}
            <NotificationDrawer
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                markAllRead={markAllRead}
            />
        </div>
    );
}

// Helper for Mock Data (re-import or define if needed)
