import React, { useEffect, useState } from 'react';
import { Search, Bell, Filter, Grid, List as ListIcon } from 'lucide-react';
import StatsGrid from '../components/community/StatsGrid';
import IssueCard from '../components/community/IssueCard';
import { supabase } from '../services/supabase';
import { Button, Input } from '../components/ui';

const MOCK_ISSUES = [
    {
        id: 1,
        title: "Burst Pipe: Large Water Leakage",
        description: "Flooding service roads, causing major traffic jams. Clean water waste significant.",
        status: "In Progress",
        upvotes_count: 142,
        comments_count: 24,
        location: { address: "MG Road Metro Station" },
        photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
        author: { name: "Ravi Kumar" },
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        title: "Broken Street Lights (5 units)",
        description: "Entire lane near the park entrance is pitch black. Safety concern for residents.",
        status: "New Report",
        upvotes_count: 67,
        comments_count: 8,
        location: { address: "Sector 4, Central Park" },
        author: { name: "Anjali Singh" },
        created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        title: "Deep Potholes on Main Exit",
        description: "Patchwork completed. Final surfacing scheduled for next weekend. Road is clear.",
        status: "Resolved",
        upvotes_count: 214,
        comments_count: 52,
        location: { address: "North Road Overpass" },
        photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80",
        author: { name: "Vikram Malhotra" },
        created_at: new Date(Date.now() - 172800000).toISOString()
    }
];

export default function CommunityPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        // Fetch real issues or use mock for now
        setIssues(MOCK_ISSUES);
        setLoading(false);
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
