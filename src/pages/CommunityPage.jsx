import React, { useEffect, useState } from 'react';
import { Search, Bell, Filter, Grid, List as ListIcon } from 'lucide-react';
import StatsGrid from '../components/community/StatsGrid';
import IssueCard from '../components/community/IssueCard';
import { supabase } from '../services/supabase';
import { Button, Input } from '../components/ui';

export default function CommunityPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        async function fetchIssues() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('issues')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (error) throw error;

                // Map DB columns to what IssueCard expects
                const mapped = (data || []).map(issue => ({
                    id: issue.id,
                    title: issue.description?.split('\n')[0] || issue.issue_type,
                    description: issue.description || '',
                    status: issue.status === 'new' ? 'New Report'
                        : issue.status === 'in_progress' ? 'In Progress'
                            : issue.status === 'resolved' ? 'Resolved'
                                : issue.status,
                    upvotes_count: issue.upvotes_count || 0,
                    comments_count: issue.comments_count || 0,
                    location: { address: issue.location_address || 'Unknown location' },
                    photo: issue.photo_url,
                    author: { name: issue.citizen_name || 'Citizen' },
                    created_at: issue.created_at,
                }));

                setIssues(mapped);
            } catch (err) {
                console.error('Failed to fetch issues:', err);
                // Fall back to empty list
                setIssues([]);
            } finally {
                setLoading(false);
            }
        }

        fetchIssues();
    }, []);


    return (
        <div className="min-h-screen bg-warm-100 pb-24">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-warm-100/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                        Community
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white border border-warm-200 flex items-center justify-center text-slate-600 hover:bg-warm-50 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=Citizen&background=E07A5F&color=fff`} alt="Profile" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-8">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search issues by area, type..."
                            className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-warm-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-soft"
                        />
                    </div>
                    <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-warm-200 shadow-soft w-fit">
                        {['All', 'Trending', 'Near Me'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-brand-100 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-warm-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Statistics */}
                <StatsGrid stats={{ total: 1240, pending: 85, resolved: 1155 }} />

                {/* Issues Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-heading text-slate-900">Top Reports</h2>
                        <div className="flex gap-2 text-slate-400">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'hover:bg-warm-200'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'hover:bg-warm-200'}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {issues.map(issue => (
                            <IssueCard key={issue.id} issue={issue} viewMode={viewMode} />
                        ))}

                        {/* Skeleton Loading (Mock) */}
                        {loading && [1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse"></div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Button variant="outline" className="bg-white border-warm-200 text-slate-600 hover:bg-warm-50">
                            Load More Reports
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
