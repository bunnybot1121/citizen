import React from 'react';
import { MessageCircle, Clock, MapPin, ThumbsUp, Share2 } from 'lucide-react';
import { Button } from '../ui';

export default function IssueCard({ issue, viewMode = 'grid' }) {
    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'New Report': return 'bg-brand-100 text-brand-700 border-brand-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-soft flex gap-4 items-center hover:shadow-md transition-all group">
                <img
                    src={issue.photo || "https://source.unsplash.com/random/800x600/?city,road"}
                    alt={issue.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(issue.status)}`}>
                            {issue.status}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 2h ago
                        </span>
                    </div>
                    <h3 className="font-bold font-heading text-slate-900 truncate">{issue.title}</h3>
                    <p className="text-xs text-slate-500 truncate mb-2">{issue.location?.address}</p>

                    <div className="flex items-center gap-4 text-slate-400">
                        <button className="flex items-center gap-1 text-xs font-bold hover:text-brand-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" /> {issue.upvotes_count}
                        </button>
                        <button className="flex items-center gap-1 text-xs font-bold hover:text-brand-600 transition-colors">
                            <MessageCircle className="w-4 h-4" /> {issue.comments_count}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden border border-warm-200/50 shadow-soft hover:shadow-card transition-all duration-300 group flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden group">
                <img
                    src={issue.photo || "https://source.unsplash.com/random/800x600/?city,road"}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border ${getStatusStyle(issue.status)} bg-white/95 backdrop-blur-sm`}>
                        {issue.status}
                    </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-end">
                    <div className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{issue.location?.address || "Unknown Location"}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold font-heading text-slate-900 leading-snug line-clamp-2">
                        {issue.title}
                    </h3>
                </div>

                <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                    {issue.description}
                </p>

                {/* Footer Actions */}
                <div className="border-t border-warm-100 pt-4 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 transition-colors group/btn">
                            <div className="p-1.5 rounded-full bg-slate-50 group-hover/btn:bg-brand-50 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold">{issue.upvotes_count}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-brand-600 transition-colors group/btn">
                            <div className="p-1.5 rounded-full bg-slate-50 group-hover/btn:bg-brand-50 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold">{issue.comments_count}</span>
                        </button>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
