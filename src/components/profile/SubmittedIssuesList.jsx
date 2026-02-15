import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubmittedIssuesList({ issues }) {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {issues.map(issue => (
                <div key={issue.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/issue/${issue.id}`)}>
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                            src={issue.photo || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">ID: #{issue.id?.substring(0, 8) || 'REP-8902'}</span>
                                <h3 className="text-lg font-bold text-gray-900 mt-1">{issue.title}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${issue.status === 'Resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {issue.status === 'Resolved' ? '● Resolved' : '● Pending'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                            <Clock size={14} />
                            <span>Last updated {issue.updated_at ? 'recently' : '2 hours ago'}</span>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                {/* Mock avatars */}
                            </div>
                            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                Track Progress →
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
