import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Loader, Clock, Activity, CheckCircle2, AlertCircle, Camera, User } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Input, Button } from '../components/ui';

export default function TrackPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [trackingNo, setTrackingNo] = useState(id ? `CTZ-${id.substring(0,8).toUpperCase()}` : '');
    const [loading, setLoading] = useState(false);
    const [issue, setIssue] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            handleSearch({ preventDefault: () => {} }, id);
        }
    }, [id]);

    const handleSearch = async (e, directId = null) => {
        e?.preventDefault();
        const searchId = directId || trackingNo;
        if (!searchId.trim()) return;

        setLoading(true);
        setError('');
        setIssue(null);
        try {
            const stripped = searchId.replace(/^ctz-/i, '').trim();
            
            let query = supabase.from('issues').select('*').limit(1);
            if (stripped.length === 36) {
                query = query.eq('id', stripped);
            } else {
                // Generate uuid range for prefix
                const prefix = stripped.toLowerCase().replace(/[^a-f0-9]/g, '');
                if (prefix.length > 0) {
                    const startHex = prefix.padEnd(32, '0');
                    const endHex = prefix.padEnd(32, 'f');
                    
                    const formatUuid = (hex) => `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
                    
                    query = query.gte('id', formatUuid(startHex)).lte('id', formatUuid(endHex));
                } else {
                    setError('Invalid tracking number format.');
                    setLoading(false);
                    return;
                }
            }
            
            const { data, error: fetchError } = await query;

            if (fetchError || !data || data.length === 0) {
                setError('Failed to fetch tracking details. Please try again.');
                setLoading(false);
                return;
            }

            setIssue(data[0]);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const StatusStep = ({ icon: Icon, title, active, current, isLast }) => (
        <div className="flex items-start">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    active 
                        ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30' 
                        : current 
                            ? 'bg-brand-50 border-brand-500 text-brand-600' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>
                {!isLast && (
                    <div className={`w-0.5 h-12 transition-all duration-500 ${active && !current ? 'bg-brand-500' : 'bg-slate-200'}`} />
                )}
            </div>
            <div className="ml-4 mt-2">
                <h4 className={`font-bold font-heading transition-colors ${active || current ? 'text-slate-900' : 'text-slate-400'}`}>
                    {title}
                </h4>
            </div>
        </div>
    );

    const isResolved = issue && ['resolved', 'done', 'closed'].includes(issue.status?.toLowerCase());
    const beforePhoto = issue?.before_photo_url || issue?.photo_url;
    const afterPhoto = issue?.after_photo_url;
    const showPhotos = isResolved && (beforePhoto || afterPhoto);

    return (
        <div className="min-h-screen bg-warm-50/50 pb-24">
            {/* Header */}
            <div className="px-6 py-6 pb-4 flex items-center gap-4 sticky top-0 bg-warm-50/80 backdrop-blur-md z-30">
                <button 
                    onClick={() => navigate('/home')}
                    className="w-10 h-10 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-warm-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 font-heading">Track Issue</h1>
                </div>
            </div>

            <div className="px-6 max-w-lg mx-auto">
                <form onSubmit={handleSearch} className="mb-8 mt-4">
                    <div className="relative">
                        <Input 
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                            placeholder="Enter Tracking No. (e.g. CTZ-XXXX)"
                            className="pl-14 py-6 bg-white shadow-soft font-mono font-bold text-lg h-16 rounded-2xl"
                        />
                        <Search className="w-6 h-6 text-brand-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={loading || !trackingNo.trim()} 
                        className="w-full mt-4 h-14 rounded-full text-lg shadow-xl shadow-brand-500/20"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Track Status'}
                    </Button>
                </form>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-in fade-in zoom-in-95 duration-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {issue && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] p-6 shadow-card border border-warm-200 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5">
                                <Search className="w-48 h-48 text-brand-900 transform rotate-45 translate-x-12 -translate-y-12" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
                                    {issue.issue_type?.replace('_', ' ') || 'Issue'}
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading mb-2 line-clamp-2">
                                    {issue.description?.split('\n')[0] || 'Reported Issue'}
                                </h2>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        CTZ-{issue.id.substring(0, 8).toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        • Reported on {new Date(issue.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="space-y-0 border-t border-warm-100 pt-6">
                                    <StatusStep 
                                        icon={Clock} 
                                        title="Reported & Pending" 
                                        active={true} 
                                        current={['new', 'pending'].includes(issue.status?.toLowerCase()) && !issue.assigned_worker_id} 
                                    />
                                    <StatusStep 
                                        icon={User} 
                                        title="Assigned to Field Staff" 
                                        active={!!issue.assigned_worker_id || ['in_progress', 'in-progress', 'resolved', 'done', 'closed'].includes(issue.status?.toLowerCase())} 
                                        current={issue.assigned_worker_id && !['in_progress', 'in-progress', 'resolved', 'done', 'closed'].includes(issue.status?.toLowerCase())} 
                                    />
                                    <StatusStep 
                                        icon={Activity} 
                                        title="In Progress (Processing)" 
                                        active={['in_progress', 'in-progress', 'resolved', 'done', 'closed'].includes(issue.status?.toLowerCase())} 
                                        current={['in_progress', 'in-progress'].includes(issue.status?.toLowerCase())} 
                                    />
                                    <StatusStep 
                                        icon={CheckCircle2} 
                                        title="Resolved" 
                                        active={isResolved} 
                                        current={isResolved} 
                                        isLast={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {showPhotos && (
                            <div className="bg-white rounded-[2rem] p-6 shadow-card border border-warm-200 animate-in fade-in zoom-in-95 duration-500 delay-150">
                                <h3 className="font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                                        <Camera className="w-4 h-4 text-brand-500" />
                                    </div>
                                    Photo Verification
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {beforePhoto && (
                                        <div className="flex flex-col gap-2 relative group">
                                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-inner relative">
                                                <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                            </div>
                                            <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Before
                                            </p>
                                        </div>
                                    )}
                                    {afterPhoto ? (
                                        <div className="flex flex-col gap-2 relative group">
                                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-inner relative">
                                                <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                            </div>
                                            <p className="text-center text-xs font-bold text-green-600 uppercase tracking-wider flex items-center justify-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> After
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                                <Camera className="w-6 h-6 opacity-50 mb-2" />
                                                <span className="text-[10px] font-bold uppercase">Pending</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
