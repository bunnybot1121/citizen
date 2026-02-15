import React, { useState } from 'react';
import { Globe, Phone, Mail, MessageSquare, Bell } from 'lucide-react';

export default function ProfileSettings() {
    const [notifications, setNotifications] = useState({
        sms: true,
        app: true
    });

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="p-2 bg-blue-50 rounded-lg text-blue-600"><Globe size={20} /></span>
                <h3 className="font-bold text-gray-900">Profile Settings</h3>
            </div>

            <div className="space-y-6">
                {/* Language */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Language</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                    </select>
                </div>

                {/* Contact Details */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contact Details</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                    <p className="font-medium">+91 98765 43210</p>
                                </div>
                            </div>
                            <button className="text-blue-600 text-xs font-bold">Edit</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                    <p className="font-medium">rahul.d@example.com</p>
                                </div>
                            </div>
                            <button className="text-blue-600 text-xs font-bold">Edit</button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notifications</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-700">SMS Alerts</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications.sms} onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-700">App Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications.app} onChange={() => setNotifications({ ...notifications, app: !notifications.app })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button className="w-full border border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
                        Update Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
