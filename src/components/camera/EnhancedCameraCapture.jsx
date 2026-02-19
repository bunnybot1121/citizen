import React, { useState, useRef, useEffect } from 'react';
import {
    X, MapPin, Navigation,
    CheckCircle, Info, Loader, RefreshCw, Camera
} from 'lucide-react';
import { reverseGeocode } from '../../utils/geocoding';
import { embedMetadataOnPhoto } from '../../utils/photoMetadata';
import toast from 'react-hot-toast';

export default function EnhancedCameraCapture({ onCapture, onClose }) {
    const [stream, setStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
    const [address, setAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Get location on mount
    useEffect(() => {
        getLocation();
    }, []);

    useEffect(() => {
        // Restart camera when facingMode changes
        const restart = async () => {
            stopCamera();
            await startCamera();
        };
        restart();

        return () => {
            stopCamera();
        };
    }, [facingMode]);

    const getLocation = async () => {
        setLoadingLocation(true);
        setLoadingAddress(false);
        setLocationError(null);

        if (!navigator.geolocation) {
            const msg = 'Geolocation not supported by this browser';
            setLocationError(msg);
            toast.error(msg);
            setLoadingLocation(false);
            return;
        }

        const getPosition = (options) => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        };

        try {
            let position;

            // Strategy: Cached -> Fresh High -> Fresh Low
            try {
                // Step 1: Try Cached High Accuracy (very fast)
                // If the user moved significantly in 30s, this might be slightly off, but
                // for reporting issues, 30s old data is usually fine and much faster.
                position = await getPosition({
                    enableHighAccuracy: true,
                    timeout: 2000,
                    maximumAge: 60000 // Accept positions up to 60s old
                });
            } catch (err) {
                console.log('Cached location failed/expired, trying fresh fix...', err);

                try {
                    // Step 2: Force Fresh High Accuracy
                    position = await getPosition({
                        enableHighAccuracy: true,
                        timeout: 15000, // Increased to 15s for better fix
                        maximumAge: 0
                    });
                } catch (err2) {
                    console.warn('High accuracy GPS failed, falling back to low accuracy', err2);

                    // Step 3: Fallback to Low Accuracy (Cell/Wifi)
                    position = await getPosition({
                        enableHighAccuracy: false,
                        timeout: 10000, // Give more time for network location
                        maximumAge: 0
                    });
                }
            }

            const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                timestamp: new Date(position.timestamp)
            };

            setLocation(locationData);
            setLoadingLocation(false);

            // Fetch address in background
            setLoadingAddress(true);
            try {
                const addressText = await reverseGeocode(
                    locationData.latitude,
                    locationData.longitude
                );
                setAddress(addressText);
            } catch (addrErr) {
                console.error('Address fetch failed', addrErr);
            } finally {
                setLoadingAddress(false);
            }

        } catch (error) {
            console.error('Location error:', error);

            let errorMessage = 'Failed to get location.';
            if (error.code === 1) errorMessage = 'Location permission denied. Please enable it in browser settings.';
            else if (error.code === 2) errorMessage = 'Location unavailable. Check GPS/Network.';
            else if (error.code === 3) errorMessage = 'Location request timed out. Move to an open area.';

            // Secure Context Warning
            if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                errorMessage += ' (Secure Context Required: Use HTTPS or localhost)';
            }

            setLocationError(errorMessage);
            toast.error(errorMessage);
            setLoadingLocation(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            toast.error('Failed to access camera');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const capturePhoto = () => {
        if (!location) {
            toast.error('Waiting for GPS location...');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            // Set canvas size to video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data
            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedPhoto(photoDataUrl);

            // Stop camera to save battery
            stopCamera();
        }
    };

    const confirmPhoto = async () => {
        if (!capturedPhoto || !location) return;

        setProcessing(true);

        try {
            // Embed metadata on photo
            const photoWithMetadata = await embedMetadataOnPhoto(
                capturedPhoto,
                {
                    location,
                    address,
                    timestamp: new Date(),
                    deviceInfo: {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform
                    }
                }
            );

            // Return to parent
            onCapture({
                photo: photoWithMetadata,
                location,
                address,
                metadata: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                    altitude: location.altitude,
                    capturedAt: new Date().toISOString(),
                    address
                }
            });

            toast.success('Photo captured with location data!');
        } catch (error) {
            console.error('Photo processing error:', error);
            toast.error('Failed to process photo');
        } finally {
            setProcessing(false);
        }
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Camera View or Photo Preview */}
            <div className="relative w-full h-full">
                {!capturedPhoto ? (
                    <>
                        {/* Live Camera Feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* GPS Loading Overlay */}
                        {loadingLocation && (
                            <div className="absolute top-16 left-4 right-4 bg-yellow-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 z-40">
                                <Loader className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-medium">Getting GPS location...</span>
                            </div>
                        )}

                        {/* Location Error / Retry Overlay */}
                        {!loadingLocation && !location && (
                            <div className="absolute top-16 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 z-40">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        <span className="text-sm font-medium">Location failed</span>
                                    </div>
                                    <button
                                        onClick={getLocation}
                                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        RETRY
                                    </button>
                                </div>
                                {/* Detailed Error Message for Debugging */}
                                <p className="text-xs text-white/80">
                                    {locationError || "Check GPS settings & permissions"}
                                </p>
                            </div>
                        )}

                        {/* Location Info Pill */}
                        {location && !loadingLocation && (
                            <div className="absolute top-16 left-0 right-0 flex justify-center z-40 px-4 animate-in fade-in slide-in-from-top-4">
                                <div className="bg-black/70 backdrop-blur-md text-white rounded-xl pl-3 pr-4 py-2.5 flex items-start gap-3 shadow-lg border border-white/10 max-w-sm w-full">
                                    <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <Navigation className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0 text-left flex-1">
                                        {/* Primary: first 2 address parts (most specific) */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold leading-tight">
                                                {loadingAddress
                                                    ? 'Fetching address...'
                                                    : address
                                                        ? address.split(',').slice(0, 2).join(',').trim()
                                                        : 'Location found'}
                                            </span>
                                            <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                                                ±{Math.round(location.accuracy)}m
                                            </span>
                                        </div>
                                        {/* Secondary: remaining address parts */}
                                        {address && address.split(',').length > 2 && (
                                            <span className="text-[11px] text-white/60 leading-tight mt-0.5 truncate">
                                                {address.split(',').slice(2).join(',').trim()}
                                            </span>
                                        )}
                                        {/* Coordinates */}
                                        <span className="text-[10px] text-white/50 font-mono mt-1">
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Camera Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border border-white" />
                                ))}
                            </div>
                        </div>

                    </>
                ) : (
                    <>
                        {/* Captured Photo Preview */}
                        <img
                            src={capturedPhoto}
                            alt="Captured"
                            className="w-full h-full object-contain bg-black"
                        />

                        {/* Processing Overlay */}
                        {processing && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <div className="bg-white rounded-2xl p-8 text-center">
                                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="font-semibold text-gray-900">
                                        Adding Location Data...
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Embedding GPS coordinates and timestamp
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Bottom Controls - Lifted up to clear BottomNav */}
            <div className="absolute bottom-20 left-0 right-0 p-6 z-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                {!capturedPhoto ? (
                    /* Capture Controls */
                    <div className="flex items-center justify-between max-w-sm mx-auto">
                        {/* Gallery / Info Button */}
                        <button
                            onClick={() => toast.info('Point camera at the issue and tap capture')}
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
                        >
                            <Info className="w-5 h-5 opacity-90" />
                        </button>

                        {/* Capture Button */}
                        <div className="relative group">
                            <button
                                onClick={capturePhoto}
                                disabled={loadingLocation}
                                className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center transition-all duration-300 ${loadingLocation
                                    ? 'border-gray-500 opacity-50 cursor-not-allowed'
                                    : 'border-white hover:border-gray-200 active:scale-95'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full transition-all duration-300 ${loadingLocation
                                    ? 'bg-gray-500'
                                    : 'bg-white group-active:scale-90 group-hover:scale-[0.95]'
                                    }`} />
                            </button>
                        </div>

                        {/* Camera Toggle Button */}
                        <button
                            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
                        >
                            <RefreshCw className="w-5 h-5 opacity-90" />
                        </button>
                    </div>
                ) : (
                    /* Confirm/Retake Controls */
                    <div className="flex items-center justify-center gap-4 pb-4">
                        <button
                            onClick={retakePhoto}
                            disabled={processing}
                            className="flex-1 bg-white/20 backdrop-blur-md text-white py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
                        >
                            Retake
                        </button>
                        <button
                            onClick={confirmPhoto}
                            disabled={processing}
                            className="flex-1 bg-blue-600/90 backdrop-blur-md text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {processing ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Use Photo</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Close Button - Moved to Top Left for better accessibility */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
    );
}
