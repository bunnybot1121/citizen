import React, { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';
import StatsGrid from '../components/community/StatsGrid';
import IssueCard from '../components/community/IssueCard';
import { supabase } from '../services/supabase';

const MOCK_ISSUES = [
    {
        id: 1,
        title: "Burst Pipe: Large Water Leakage",
        description: "Flooding service roads, causing major traffic jams. Clean water waste significant.",
        status: "In Progress",
        upvotes_count: 142,
        comments_count: 24,
        location: { address: "MG Road Metro Station" },
        photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
    },
    {
        id: 2,
        title: "Broken Street Lights (5 units)",
        description: "Entire lane near the park entrance is pitch black. Safety concern for residents.",
        status: "New Report",
        upvotes_count: 67,
        comments_count: 8,
        location: { address: "Sector 4, Central Park" },
        // photo: "https://images.unsplash.com/photo-15555" // Placeholder
    },
    {
        id: 3,
        title: "Deep Potholes on Main Exit",
        description: "Patchwork completed. Final surfacing scheduled for next weekend. Road is clear.",
        status: "Resolved",
        upvotes_count: 214,
        comments_count: 52,
        location: { address: "North Road Overpass" },
        photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"
    }
];

export default function CommunityPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real issues or use mock for now
        // In real app: fetchIssues();
        setIssues(MOCK_ISSUES);
        setLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        NagarSevak AI
                    </h1>
                    <div className="hidden md:flex gap-2">
                        {['Live Issues', 'Analytics', 'My Ward'].map(tab => (
                            <button key={tab} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by area or type..."
                            className="bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin+User" alt="Profile" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Community Action Dashboard</h2>
                        <p className="text-gray-500 mt-1">Quickly scan and act on local civic issues</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gray-600">+12 Citizens active now</span>
                    </div>
                </div>

                {/* Statistics */}
                <StatsGrid stats={{ total: 24, pending: 18, resolved: 9 }} />

                {/* Issues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}

                    {/* Skeleton Loading (Mock) */}
                    {loading && [1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                        ↻ Load More Community Issues
                    </button>
                </div>
            </div>
        </div>
    );
}
