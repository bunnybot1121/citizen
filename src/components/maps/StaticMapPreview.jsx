import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to update map center when coordinates change
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function StaticMapPreview({ lat, lng, zoom = 15, className = "h-full w-full" }) {
    // Determine map URL based on theme (optional, using standard OSM for now)
    // Dark mode maps can be used if needed, but standard is clearer for small previews

    if (!lat || !lng) return <div className="bg-slate-200 h-full w-full animate-pulse" />;

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            boxZoom={false}
            keyboard={false}
            className={className}
            style={{ height: '100%', width: '100%', pointerEvents: 'none' }} // Ensure no interaction
        >
            <ChangeView center={[lat, lng]} zoom={zoom} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} />
        </MapContainer>
    );
}
