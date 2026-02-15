import React from 'react';
import { TrendingUp, Clock, CheckCircle2, Zap } from 'lucide-react';

export default function StatsGrid({ stats }) {
    const items = [
        {
            label: 'New Reports',
            value: stats.total || 0,
            trend: '+12%',
            trendColor: 'text-brand-600',
            icon: TrendingUp,
            bg: 'bg-brand-50',
            iconColor: 'text-brand-600'
        },
        {
            label: 'In Progress',
            value: stats.pending || 0,
            subtext: 'Active tasks',
            icon: Clock,
            bg: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            label: 'Resolved Today',
            value: stats.resolved || 0,
            subtext: 'Goal: 15',
            icon: CheckCircle2,
            bg: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            label: 'Avg Response',
            value: '2.4h',
            trend: 'Fast',
            trendColor: 'text-green-600',
            icon: Zap,
            bg: 'bg-purple-50',
            iconColor: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[1.25rem] border border-warm-100 shadow-soft hover:shadow-card transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        {item.trend && (
                            <span className={`text-xs font-bold ${item.trendColor} bg-white px-2 py-1 rounded-full shadow-sm border border-warm-100`}>
                                {item.trend}
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="text-3xl font-bold font-heading text-slate-900 leading-none mb-1">
                            {item.value}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
