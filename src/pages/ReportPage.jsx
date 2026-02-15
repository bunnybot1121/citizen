import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Send, Loader, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import EnhancedCameraCapture from '../components/camera/EnhancedCameraCapture';
import StaticMapPreview from '../components/maps/StaticMapPreview';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const SECTORS = [
    'Water Supply',
    'Sewerage & Drainage',
    'Roads & Public Works',
    'Street Lighting',
    'Solid Waste Management',
    'Public Sanitation',
    'Parks & Green Areas'
];



export default function ReportPage() {
    const [showCamera, setShowCamera] = useState(false);
    const [photoData, setPhotoData] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sector, setSector] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { citizen } = useAuth();
    const navigate = useNavigate();

    const handlePhotoCapture = (data) => {
        setPhotoData(data);
        setShowCamera(false);
        toast.success('Photo captured with location!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photoData) {
            toast.error('Please capture a photo');
            return;
        }

        if (!sector) {
            toast.error('Please select a sector');
            return;
        }

        setSubmitting(true);

        try {
            // Upload photo to Supabase Storage
            const photoFileName = `${citizen.id}_${Date.now()}.jpg`;

            // Convert data URL to Blob
            const res = await fetch(photoData.photo);
            const photoBlob = await res.blob();

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('issue-photos')
                .upload(photoFileName, photoBlob, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600'
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('issue-photos')
                .getPublicUrl(photoFileName);

            // Create issue with metadata
            const { data: issue, error: issueError } = await supabase
                .from('issues')
                .insert({
                    citizen_id: citizen.id,
                    title: title || 'Issue Report',
                    description,
                    sector,
                    priority: 'medium',
                    severity: 'medium',
                    photo: publicUrl,
                    location: photoData.address,
                    photo_metadata: {
                        coordinates: {
                            lat: photoData.location.latitude,
                            lng: photoData.location.longitude,
                            accuracy: photoData.location.accuracy,
                            altitude: photoData.location.altitude
                        },
                        address: photoData.address,
                        capturedAt: photoData.metadata.capturedAt,
                        deviceInfo: photoData.metadata.deviceInfo
                    },
                    photo_timestamp: photoData.metadata.capturedAt,
                    location_verified: true,
                    status: 'pending'
                })
                .select()
                .single();

            if (issueError) throw issueError;

            toast.success('Issue reported successfully!');
            navigate('/home');

        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    if (showCamera) {
        return (
            <EnhancedCameraCapture
                onCapture={handlePhotoCapture}
                onClose={() => setShowCamera(false)}
            />
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="px-6 py-6 pb-2 flex items-center gap-4">
                <button
                    onClick={() => navigate('/home')}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900">New Report</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Photo Capture Area */}
                <div className="relative">
                    {!photoData ? (
                        <button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 hover:bg-brand-50 transition-colors flex flex-col items-center justify-center gap-4 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-brand-100 group-hover:scale-110 transition-transform">
                                <Camera className="w-8 h-8 text-brand-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-brand-900">Take Evidence Photo</p>
                                <p className="text-xs text-brand-500 mt-1">Location auto-tagged</p>
                            </div>
                        </button>
                    ) : (
                        <div className="relative group overflow-hidden rounded-3xl shadow-lg">
                            <img
                                src={photoData.photo}
                                alt="Captured"
                                className="w-full aspect-[4/3] object-cover"
                            />

                            {/* Nagar GPS Map Camera Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 text-white">
                                <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/30 relative z-10">
                                        <StaticMapPreview
                                            lat={photoData.location?.latitude}
                                            lng={photoData.location?.longitude}
                                            zoom={15}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Camera className="w-3 h-3 text-brand-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Nagar GPS Camera</span>
                                        </div>

                                        <p className="text-xs font-semibold leading-tight line-clamp-2 text-white">
                                            {photoData.address || "Fetching location..."}
                                        </p>

                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-300 font-mono mt-1 opacity-80">
                                            <span>{photoData.location?.latitude?.toFixed(5)}, {photoData.location?.longitude?.toFixed(5)}</span>
                                            <span className="border-l border-white/20 pl-2">
                                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCamera(true)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {SECTORS.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSector(s)}
                                    className={`p-3 rounded-xl text-xs font-medium text-left transition-all border ${sector === s
                                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                            Details
                        </label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm font-medium transition-all placeholder:text-slate-400"
                                placeholder="Short Title (e.g. Broken Light)"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm font-medium transition-all resize-none placeholder:text-slate-400"
                                placeholder="Describe the issue..."
                            />
                        </div>
                    </div>


                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={submitting || !photoData || !sector}
                    className="w-full bg-brand-600 text-white h-14 rounded-2xl font-bold text-lg hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>Submit Report</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
