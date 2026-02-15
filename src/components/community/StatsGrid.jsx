import React from 'react';
import { TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react';

export default function StatsGrid({ stats }) {
    const items = [
        {
            label: 'New Reports',
            value: stats.total || 0,
            trend: '+12%',
            trendColor: 'text-green-600',
            icon: TrendingUp,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            label: 'In Progress',
            value: stats.pending || 0,
            subtext: 'Active tasks',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            label: 'Resolved Today',
            value: stats.resolved || 0,
            subtext: 'Goal: 15',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600'
        },
        {
            label: 'Avg Response',
            value: '2.4h',
            trend: 'Fast',
            trendColor: 'text-green-600',
            icon: Zap,
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                        {/* <div className={`p-2 rounded-lg ${item.color}`}>
                            <item.icon size={16} />
                        </div> */}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                        {item.trend && (
                            <span className={`text-xs font-bold ${item.trendColor}`}>
                                {item.trend}
                            </span>
                        )}
                    </div>
                    {item.subtext && (
                        <p className="text-xs text-gray-400 mt-1">{item.subtext}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
