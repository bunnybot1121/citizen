import React from 'react';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, ArrowUp } from 'lucide-react';

export default function IssueCard({ issue }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-yellow-500 text-white';
            case 'Resolved': return 'bg-green-500 text-white';
            case 'New Report': return 'bg-red-500 text-white';
            case 'High Alert': return 'bg-red-600 text-white animate-pulse';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={issue.photo || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getStatusColor(issue.status)}`}>
                        {issue.status}
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white text-xs font-bold drop-shadow-md flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {issue.location?.address || "Unknown Location"}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {issue.title}
                    </h3>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-blue-600">{issue.upvotes_count || 0}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Upvotes</span>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {issue.description}
                </p>

                {/* Metadata */}
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <MessageCircle size={14} />
                        {issue.comments_count || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <Clock size={14} />
                        {/* {issue.created_at ? formatDistanceToNow(new Date(issue.created_at)) : '2h ago'} */}
                        2h ago
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        {/* <Pencil size={16} /> */}
                        Update
                    </button>
                    <button className="flex-1 bg-white text-gray-700 border border-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        {/* <Bell size={16} /> */}
                        Follow
                    </button>
                </div>
            </div>
        </div>
    );
}
