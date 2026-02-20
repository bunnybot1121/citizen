import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, X, AlertTriangle, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { supabase } from '../services/supabase';

// ── Fix Leaflet default icon paths (Vite asset handling) ──────────────────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// ── Custom coloured issue pin ─────────────────────────────────────────────────
function makeIssueIcon(status) {
    const colors = {
        new: '#f59e0b',
        pending: '#f59e0b',
        in_progress: '#3b82f6',
        resolved: '#22c55e',
    };
    const bg = colors[status] || '#64748b';

    return L.divIcon({
        className: '',
        html: `
            <div style="
                width:28px;height:28px;border-radius:50% 50% 50% 0;
                background:${bg};border:3px solid white;
                box-shadow:0 2px 8px rgba(0,0,0,0.25);
                transform:rotate(-45deg);
            "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
    });
}

// ── Custom "you are here" icon ────────────────────────────────────────────────
const meIcon = L.divIcon({
    className: '',
    html: `
        <div style="width:20px;height:20px;border-radius:50%;
            background:#3b82f6;border:3px solid white;
            box-shadow:0 2px 8px rgba(59,130,246,0.5);">
        </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// ── Helper: fly to a new location ────────────────────────────────────────────
function FlyTo({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 15, { duration: 1.2 });
        }
    }, [target, map]);
    return null;
}

// ── Status helpers ────────────────────────────────────────────────────────────
const statusConfig = {
    new: { label: 'New', bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    in_progress: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function MapPage() {
    const [userPos, setUserPos] = useState(null);       // [lat, lng]
    const [accuracy, setAccuracy] = useState(null);
    const [flyTarget, setFlyTarget] = useState(null);
    const [issues, setIssues] = useState([]);
    const [selected, setSelected] = useState(null);     // issue shown in bottom sheet
    const [locError, setLocError] = useState(null);
    const watchRef = useRef(null);

    // ── Fetch issues from Supabase ────────────────────────────────────────────
    useEffect(() => {
        async function fetchIssues() {
            try {
                const { data, error } = await supabase
                    .from('issues')
                    .select('id, description, issue_type, status, latitude, longitude, photo_url, location_address, created_at')
                    .not('latitude', 'is', null)
                    .not('longitude', 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;
                setIssues(data || []);
            } catch (err) {
                console.warn('Could not load issues:', err.message);
            }
        }
        fetchIssues();
    }, []);

    // ── Watch GPS ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocError('Geolocation is not supported by your browser.');
            return;
        }

        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy: acc } = pos.coords;
                setUserPos([latitude, longitude]);
                setAccuracy(acc);
                setLocError(null);
                // Auto-fly on first fix only
                setFlyTarget(prev => prev ? prev : [latitude, longitude]);
            },
            (err) => {
                setLocError('Could not get your location. Please allow location access.');
                console.warn('Geolocation error:', err.message);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );

        return () => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        };
    }, []);

    const centerOnMe = () => {
        if (userPos) setFlyTarget([...userPos]);
    };

    const defaultCenter = userPos || [18.5204, 73.8567]; // Pune as fallback
    const defaultZoom = userPos ? 15 : 12;

    return (
        <div className="relative h-[calc(100dvh-7rem)] w-full overflow-hidden">
            {/* ── Map ───────────────────────────────────────────────────────── */}
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                zoomControl={false}
                className="h-full w-full"
                style={{ zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />

                <FlyTo target={flyTarget} />

                {/* User location */}
                {userPos && (
                    <>
                        <Circle
                            center={userPos}
                            radius={accuracy || 30}
                            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1 }}
                        />
                        <Marker position={userPos} icon={meIcon}>
                            <Popup>
                                <span className="font-semibold text-brand-600">You are here</span>
                                {accuracy && <span className="text-xs text-slate-500 block">±{Math.round(accuracy)} m</span>}
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* Issue pins */}
                {issues.map(issue => (
                    <Marker
                        key={issue.id}
                        position={[issue.latitude, issue.longitude]}
                        icon={makeIssueIcon(issue.status)}
                        eventHandlers={{ click: () => setSelected(issue) }}
                    />
                ))}
            </MapContainer>

            {/* ── Top bar ────────────────────────────────────────────────────── */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-soft border border-white/50 pointer-events-auto">
                    <h1 className="text-sm font-bold font-heading text-slate-800 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-brand-500" />
                        City Issues Map
                    </h1>
                    <p className="text-[10px] text-slate-400 font-medium">{issues.length} reports nearby</p>
                </div>

                {/* Legend */}
                <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-soft border border-white/50 text-[10px] font-semibold space-y-1 pointer-events-auto">
                    {[['#f59e0b', 'Pending'], ['#3b82f6', 'In Progress'], ['#22c55e', 'Resolved']].map(([color, label]) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                            <span className="text-slate-600">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Locate me button ──────────────────────────────────────────── */}
            <button
                onClick={centerOnMe}
                disabled={!userPos}
                className="absolute bottom-6 right-4 z-10 w-12 h-12 bg-brand-500 text-white rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center hover:bg-brand-600 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
                title="Centre on my location"
            >
                <LocateFixed className="w-5 h-5" />
            </button>

            {/* ── Location error toast ──────────────────────────────────────── */}
            {locError && (
                <div className="absolute top-20 left-4 right-4 z-10 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3 shadow-soft">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-snug">{locError}</p>
                </div>
            )}

            {/* ── Issue bottom sheet ────────────────────────────────────────── */}
            {selected && (
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-none">
                    <div className="bg-white rounded-[2rem] shadow-2xl pointer-events-auto overflow-hidden max-w-md mx-auto">
                        {selected.photo_url && (
                            <img
                                src={selected.photo_url}
                                alt="Issue"
                                className="w-full h-36 object-cover"
                            />
                        )}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 pr-3">
                                    {/* Status badge */}
                                    {(() => {
                                        const cfg = statusConfig[selected.status] || statusConfig.new;
                                        const Icon = cfg.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2 ${cfg.bg} ${cfg.text}`}>
                                                <Icon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        );
                                    })()}
                                    <h3 className="font-bold text-slate-800 font-heading leading-snug line-clamp-2">
                                        {selected.description?.split('\n')[0] || selected.issue_type}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 text-xs text-slate-500">
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-semibold capitalize">
                                    {selected.issue_type?.replace(/_/g, ' ')}
                                </span>
                                {selected.location_address && (
                                    <span className="flex-1 truncate leading-5">{selected.location_address}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
