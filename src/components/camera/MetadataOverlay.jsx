import React from 'react';
import { Clock, MapPin, CheckCircle, Smartphone } from 'lucide-react';

export default function MetadataOverlay({ gps, timestamp, address }) {
    return (
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border border-white/20">
                    <MapPin size={14} className="text-blue-400" />
                    <span>{address || "Locating..."}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border border-white/20">
                    <Smartphone size={14} className="text-green-400" />
                    <span>{gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "No GPS"}</span>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-end">
                <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold border border-white/20 text-right">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-yellow-400" />
                            <span>{timestamp ? new Date(timestamp).toLocaleDateString() : 'Date'}</span>
                        </div>
                        <span className="text-[10px] opacity-80">{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Time'} IST</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
