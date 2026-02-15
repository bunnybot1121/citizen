import React, { useState, useRef, useEffect } from 'react';
import {
    X, MapPin, Navigation,
    CheckCircle, Info, Loader
} from 'lucide-react';
import { reverseGeocode } from '../../utils/geocoding';
import { embedMetadataOnPhoto } from '../../utils/photoMetadata';
import toast from 'react-hot-toast';

export default function EnhancedCameraCapture({ onCapture, onClose }) {
    const [stream, setStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [location, setLocation] = useState(null);
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
        startCamera();

        return () => {
            stopCamera();
        };
    }, []);

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
                        timeout: 5000,
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
                    facingMode: 'environment', // Back camera
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
                            <div className="absolute top-4 left-4 right-4 bg-yellow-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <Loader className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-medium">Getting GPS location...</span>
                            </div>
                        )}

                        {/* Location Error / Retry Overlay */}
                        {!loadingLocation && !location && (
                            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
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

                        {/* Location Info Overlay */}
                        {location && !loadingLocation && (
                            <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Navigation className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">
                                            Location Ready ✓
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {loadingAddress ? "Fetching street address..." : (address || "Address not found")}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Accuracy: ±{Math.round(location.accuracy)}m
                                        </p>
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

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pb-safe">
                <div className="p-6">
                    {!capturedPhoto ? (
                        /* Capture Controls */
                        <div className="flex items-center justify-between">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Capture Button */}
                            <button
                                onClick={capturePhoto}
                                disabled={loadingLocation}
                                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 ${loadingLocation
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                <div className="w-16 h-16 bg-white rounded-full" />
                            </button>

                            {/* Info Button */}
                            <button
                                onClick={() => toast.info('Point camera at the issue and tap capture')}
                                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <Info className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        /* Confirm/Retake Controls */
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={retakePhoto}
                                disabled={processing}
                                className="flex-1 bg-white/20 backdrop-blur-sm text-white py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
                            >
                                Retake Photo
                            </button>
                            <button
                                onClick={confirmPhoto}
                                disabled={processing}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
        </div>
    );
}
