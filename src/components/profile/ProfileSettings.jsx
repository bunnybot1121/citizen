import React, { useState } from 'react';
import { Globe, Phone, Mail, MessageSquare, Bell, ChevronRight } from 'lucide-react';
import { Button } from '../ui';

export default function ProfileSettings() {
    const [notifications, setNotifications] = useState({
        sms: true,
        app: true
    });

    return (
        <div className="space-y-6">
            {/* Language */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Language</label>
                <div className="relative">
                    <select className="w-full appearance-none bg-warm-50 border-2 border-transparent hover:border-warm-200 focus:border-brand-300 focus:bg-white rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none transition-all cursor-pointer">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            {/* Contact Details */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contact Details</label>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-warm-50 rounded-2xl border border-transparent hover:border-warm-200 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm group-hover:text-brand-600 transition-colors">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Phone</p>
                                <p className="font-bold text-slate-700 text-sm">+91 98765 43210</p>
                            </div>
                        </div>
                        <button className="text-brand-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-warm-50 rounded-2xl border border-transparent hover:border-warm-200 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm group-hover:text-brand-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email</p>
                                <p className="font-bold text-slate-700 text-sm">rahul.d@example.com</p>
                            </div>
                        </div>
                        <button className="text-brand-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Notifications</label>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                                <MessageSquare size={18} />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">SMS Alerts</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.sms} onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                                <Bell size={18} />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">App Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.app} onChange={() => setNotifications({ ...notifications, app: !notifications.app })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Button variant="outline" className="w-full border-brand-200 text-brand-700 hover:bg-brand-50">
                    Update Preferences
                </Button>
            </div>
        </div>
    );
}
