import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, BellRing, AlertTriangle, Info, CheckCircle, Megaphone } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

// Matches admin's NOTIFICATION_TYPES: info | warning | critical | success
const TYPE_META = {
    info: { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Info' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-100', text: 'text-amber-600', label: 'Warning' },
    critical: { icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-600', label: 'Critical' },
    success: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-600', label: 'Resolved' },
};

function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META['info'];
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
    const { citizen } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            // Admin stores target = 'all' for broadcast notifications
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setNotifications(data);
                const readIds = JSON.parse(localStorage.getItem('nagarsevak_read_notifs') || '[]');
                setUnreadCount(data.filter(n => !readIds.includes(n.id)).length);
            }
        } catch (err) {
            console.error('Notification fetch error', err);
        }
    };

    useEffect(() => {
        if (!citizen) return;
        fetchNotifications();

        // Real-time subscription — listen for new inserts
        const channel = supabase
            .channel('citizen-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [citizen]);

    const markAllRead = () => {
        const ids = notifications.map(n => n.id);
        localStorage.setItem('nagarsevak_read_notifs', JSON.stringify(ids));
        setUnreadCount(0);
    };

    return { notifications, unreadCount, markAllRead };
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
export default function NotificationDrawer({ open, onClose, notifications, unreadCount, markAllRead }) {
    const drawerRef = useRef(null);

    // Close on outside tap
    useEffect(() => {
        if (!open) return;
        const handle = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handle);
        document.addEventListener('touchstart', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, [open, onClose]);

    // Mark as read when opened
    useEffect(() => {
        if (open && unreadCount > 0) markAllRead();
    }, [open]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-[85vw] max-w-sm z-[100] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-label="Notifications"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700">No notifications yet</p>
                                <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
                            </div>
                        </div>
                    ) : (
                        notifications.map(notif => {
                            const meta = getTypeMeta(notif.type);
                            const Icon = meta.icon;
                            return (
                                <div
                                    key={notif.id}
                                    className="flex gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`shrink-0 w-9 h-9 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center mt-0.5`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-slate-900 leading-snug">{notif.title}</p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                                                {timeAgo(notif.created_at)}
                                            </span>
                                        </div>
                                        {/* Admin uses 'message' column, not 'body' */}
                                        {(notif.message || notif.body) && (
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {notif.message || notif.body}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${meta.bg} ${meta.text}`}>
                                                {meta.label}
                                            </span>
                                            {notif.sector && (
                                                <span className="text-[10px] text-slate-400">• {notif.sector}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
