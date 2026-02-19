import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Send, Loader, ArrowLeft, Image as ImageIcon, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import EnhancedCameraCapture from '../components/camera/EnhancedCameraCapture';
import StaticMapPreview from '../components/maps/StaticMapPreview';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';

const SECTORS = [
    { id: 'water', name: 'Water Supply', icon: '💧' },
    { id: 'drainage', name: 'Sewerage & Drainage', icon: '🕳️' },
    { id: 'roads', name: 'Roads & Works', icon: '🚧' },
    { id: 'lights', name: 'Street Lighting', icon: '💡' },
    { id: 'waste', name: 'Garbage & Waste', icon: '🗑️' },
    { id: 'sanitation', name: 'Public Sanitation', icon: '🚽' },
    { id: 'parks', name: 'Parks & Greenery', icon: '🌳' }
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
            // Step 1: Convert data URL to Blob
            let photoBlob;
            try {
                const res = await fetch(photoData.photo);
                photoBlob = await res.blob();
            } catch (err) {
                toast.error(`Photo error: ${err.message}`);
                return;
            }

            // Step 2: Upload photo
            toast.loading('Uploading photo...', { id: 'submit' });
            let photoUrl;
            try {
                const { issueService: svc } = await import('../services/issueService');
                photoUrl = await svc.uploadPhoto(photoBlob, citizen?.id || 'anonymous');
            } catch (err) {
                toast.error(`Upload failed: ${err.message}`, { id: 'submit' });
                return;
            }

            // Step 3: Insert into database
            toast.loading('Saving report...', { id: 'submit' });
            const { supabase } = await import('../services/supabase');
            const { data, error } = await supabase
                .from('issues')
                .insert({
                    citizen_id: citizen?.id && /^[0-9a-f-]{36}$/i.test(citizen.id) ? citizen.id : null,
                    citizen_name: citizen?.name,
                    citizen_phone: citizen?.phone,
                    issue_type: sector,
                    description: title ? `${title}\n\n${description}` : description,
                    location_address: photoData.address,
                    latitude: photoData.location?.latitude,
                    longitude: photoData.location?.longitude,
                    photo_url: photoUrl,
                    priority: 'medium',
                    ai_priority_score: 50,
                    status: 'new'
                })
                .select()
                .single();

            if (error) {
                toast.error(`DB error: ${error.message}`, { id: 'submit' });
                return;
            }

            toast.success('Issue reported successfully!', { id: 'submit' });
            navigate('/home');

        } catch (error) {
            toast.error(`Error: ${error.message || 'Unknown error'}`, { id: 'submit' });
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
        <div className="min-h-screen pb-24 relative">
            {/* Header */}
            <div className="px-6 py-6 pb-4 flex items-center gap-4 sticky top-0 bg-warm-100/80 backdrop-blur-md z-30">
                <button
                    onClick={() => navigate('/home')}
                    className="w-10 h-10 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-warm-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 font-heading">New Report</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 space-y-8 max-w-lg mx-auto">
                {/* 1. Evidence Card */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-700 font-heading">
                            1. Evidence
                        </label>
                        {photoData && (
                            <span className="text-xs font-medium text-secondary-600 bg-secondary-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Photo Attached
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        {!photoData ? (
                            <button
                                type="button"
                                onClick={() => setShowCamera(true)}
                                className="w-full aspect-[16/10] rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100/50 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer active:scale-[0.99]"
                            >
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-brand-500/10 group-hover:scale-110 transition-transform duration-300">
                                    <Camera className="w-8 h-8 text-brand-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-brand-900 font-heading">Take Photo</p>
                                    <p className="text-xs text-brand-600 mt-1 font-medium">GPS location will be auto-tagged</p>
                                </div>
                            </button>
                        ) : (
                            <div className="relative group overflow-hidden rounded-3xl shadow-card border border-white/50">
                                <img
                                    src={photoData.photo}
                                    alt="Captured"
                                    className="w-full aspect-[16/10] object-cover"
                                />

                                {/* Verified Overlay */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden shadow-lg border border-white/30 shrink-0">
                                            <StaticMapPreview
                                                lat={photoData.location?.latitude}
                                                lng={photoData.location?.longitude}
                                                zoom={13}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-300">Location Verified</span>
                                            </div>

                                            <p className="text-xs font-medium leading-tight line-clamp-1 opacity-90">
                                                {photoData.address || "Fetching address..."}
                                            </p>
                                            <p className="text-[10px] font-mono opacity-60 mt-0.5">
                                                {photoData.location?.latitude?.toFixed(4)}, {photoData.location?.longitude?.toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowCamera(true)}
                                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/20"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Category Selection */}
                <section>
                    <label className="text-sm font-bold text-slate-700 font-heading mb-3 block">
                        2. Select Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {SECTORS.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSector(s.id)}
                                className={`p-4 rounded-2xl text-left transition-all border-2 flex flex-col gap-2 ${sector === s.id
                                    ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm'
                                    : 'border-transparent bg-white text-slate-600 hover:bg-white/80 has-[:hover]:border-warm-200 shadow-soft'
                                    }`}
                            >
                                <span className="text-2xl">{s.icon}</span>
                                <span className={`text-xs font-bold ${sector === s.id ? 'text-brand-700' : 'text-slate-700'}`}>
                                    {s.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. Details */}
                <section>
                    <label className="text-sm font-bold text-slate-700 font-heading mb-3 block">
                        3. Add Details
                    </label>
                    <div className="space-y-4">
                        <Input
                            placeholder="Descriptive Title (e.g. Broken streetlight)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white border-none shadow-soft"
                        />

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-200 outline-none text-sm font-body transition-all placeholder:text-slate-400 shadow-soft resize-none"
                            placeholder="Add any specific details to help the team locate and fix this issue..."
                        />
                    </div>
                </section>

                {/* Submit Action */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={submitting || !photoData || !sector}
                        variant={(!photoData || !sector) ? "ghost" : "primary"}
                        size="lg"
                        className={`w-full h-14 rounded-full text-lg shadow-xl ${(!photoData || !sector) ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'shadow-brand-500/30'}`}
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Submitting Report...</span>
                            </>
                        ) : (
                            <>
                                <span>Submit Report</span>
                                <Send className="w-5 h-5 ml-1" />
                            </>
                        )}
                    </Button>
                    <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
                        By submitting, you certify that this information is accurate.<br />
                        False reporting may lead to account suspension.
                    </p>
                </div>
            </form>
        </div>
    );
}
