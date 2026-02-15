import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, MapPin, User } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/map', icon: MapPin, label: 'Map' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom pointer-events-none">
            <div className="glass mx-auto max-w-md rounded-2xl shadow-glass pointer-events-auto">
                <div className="grid grid-cols-4 h-16 items-center">
                    {tabs.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full h-full rounded-xl ${isActive
                                    ? 'text-brand-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute -top-1 w-1 h-1 bg-brand-500 rounded-full animate-pulse" />
                                )}
                                <Icon
                                    className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`}
                                />
                                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-0.5'}`}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
