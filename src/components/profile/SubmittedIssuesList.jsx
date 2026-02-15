import React from 'react';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubmittedIssuesList({ issues }) {
    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (issues.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-warm-200 border-dashed">
                <p className="text-slate-400 font-medium">No reports found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {issues.map(issue => (
                <div
                    key={issue.id}
                    className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-warm-100 flex gap-5 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
                    onClick={() => navigate(`/issue/${issue.id}`)}
                >
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                        {issue.photo ? (
                            <img
                                src={issue.photo}
                                alt={issue.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider text-center p-2">
                                No Image
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                                    #{issue.id?.substring(0, 8) || 'REP-000'}
                                </span>
                                <h3 className="text-base font-bold font-heading text-slate-900 mt-1 truncate pr-4 line-clamp-1 group-hover:text-brand-700 transition-colors">
                                    {issue.title}
                                </h3>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(issue.status)}`}>
                                {issue.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {issue.updated_at ? 'Updated recently' : '2 days ago'}
                            </span>
                            {/* <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {issue.location?.address || 'Shivajinagar'}
                            </span> */}
                        </div>

                        <div className="flex justify-between items-end mt-auto pt-2">
                            <div className="flex -space-x-2">
                                {/* Avatars placeholder if needed */}
                            </div>
                            <button className="text-brand-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Track Status <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
