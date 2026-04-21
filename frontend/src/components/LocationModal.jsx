import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { MapPin, X, Navigation, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [detectedCity, setDetectedCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const { updateLocation } = useAuthStore();

  if (!isOpen) return null;

  const handleDetectClick = async () => {
    setDetecting(true);
    setGeoError(null);
    setDetectedCity(null);
    setCoords(null);

    try {
      // Primary: IP-based geolocation (respects VPN)
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      
      if (ipData.latitude && ipData.longitude) {
        const city = ipData.city || ipData.region || ipData.country_name || 'Your Location';
        setCoords({ latitude: ipData.latitude, longitude: ipData.longitude });
        setDetectedCity(city);
        setDetecting(false);
        return;
      }
    } catch (ipError) {
      console.warn('IP geolocation failed, falling back to GPS:', ipError);
    }

    // Fallback: GPS-based geolocation
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode with Nominatim
        let city = 'Your Location';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          city = addr.city || addr.town || addr.village || addr.county || addr.state || 'Your Location';
        } catch {
          // Keep fallback
        }

        setCoords({ latitude, longitude, accuracy: position.coords.accuracy });
        setDetectedCity(city);
        setDetecting(false);
      },
      (error) => {
        console.error('GPS geolocation failed:', error);
        setGeoError('Location permission denied. Enable it in your browser settings.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveDetected = async () => {
    if (!coords) return;
    setSaving(true);
    try {
      const city = detectedCity || 'Your Location';
      await updateLocation([coords.longitude, coords.latitude]);
      localStorage.setItem('userLocation', JSON.stringify({ lat: coords.latitude, lng: coords.longitude, city }));
      localStorage.setItem('locationName', city);
      window.dispatchEvent(new Event('storage'));
      if (onSave) onSave({ lat: coords.latitude, lng: coords.longitude, name: city });
      toast.success(`📍 Location set to ${city}`);
      onClose();
    } catch {
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const city = data[0].display_name.split(',')[0] || manualLocation;
        await updateLocation([lng, lat]);
        localStorage.setItem('userLocation', JSON.stringify({ lat, lng, city }));
        localStorage.setItem('locationName', city);
        window.dispatchEvent(new Event('storage'));
        if (onSave) onSave({ lat, lng, name: city });
        toast.success(`📍 Location set to ${city}`);
        onClose();
      } else {
        toast.error('Could not find that location. Try a different city.');
      }
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-surface-400 hover:text-surface-700 transition-colors p-1 rounded-lg hover:bg-surface-100">
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-500/25">
          <MapPin size={32} />
        </div>

        {!manualMode ? (
          <>
            <h2 className="text-2xl font-black text-center text-surface-900 mb-2">Set Your Location</h2>
            <p className="text-center text-surface-500 mb-8 font-medium">
              We need your location to find the best local services and providers near you.
            </p>

            {/* Detect Location Button */}
            {!coords && !detecting && (
              <button
                onClick={handleDetectClick}
                disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-3 mb-4 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                <Navigation size={20} />
                <span>Detect My Location</span>
              </button>
            )}

            {/* Detecting state */}
            {detecting && (
              <div className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 mb-4">
                <Loader2 size={20} className="animate-spin" />
                <span>Detecting Location...</span>
              </div>
            )}

            {/* Error message */}
            {geoError && !coords && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">{geoError}</p>
                  <p className="text-xs text-amber-600 mt-1">You can enter your location manually below.</p>
                </div>
              </div>
            )}

            {/* Detected Location Card */}
            {coords && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-5 animate-slide-up">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-sm">Location Detected!</h3>
                    <p className="text-emerald-700 font-bold text-lg">{detectedCity || 'Your Location'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 rounded-xl p-2.5 text-center">
                    <span className="text-emerald-500 font-bold block mb-0.5">Latitude</span>
                    <span className="text-emerald-900 font-black">{coords.latitude.toFixed(4)}</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2.5 text-center">
                    <span className="text-emerald-500 font-bold block mb-0.5">Longitude</span>
                    <span className="text-emerald-900 font-black">{coords.longitude.toFixed(4)}</span>
                  </div>
                </div>
                {coords.accuracy && (
                  <p className="text-xs text-emerald-600 font-medium mt-2 text-center">
                    Accuracy: ±{Math.round(coords.accuracy)}m
                  </p>
                )}
              </div>
            )}

            {/* Save / Confirm button */}
            {coords && (
              <button
                onClick={handleSaveDetected}
                disabled={saving}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 mb-4 shadow-md shadow-emerald-500/20 disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle2 size={18} /> Confirm & Save Location</>
                )}
              </button>
            )}

            {/* Re-detect button */}
            {coords && (
              <button
                onClick={handleDetectClick}
                className="w-full text-indigo-600 font-bold py-2 rounded-xl hover:bg-indigo-50 transition-all text-sm mb-3"
              >
                🔄 Re-detect Location
              </button>
            )}

            {/* Manual entry toggle */}
            <button
              onClick={() => setManualMode(true)}
              className="w-full bg-surface-100 text-surface-700 font-bold py-3.5 rounded-2xl hover:bg-surface-200 transition-all text-sm"
            >
              Enter location manually instead
            </button>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <h2 className="text-2xl font-black text-center text-surface-900 mb-2">Manual Location</h2>
            <p className="text-center text-surface-500 mb-6 font-medium">Enter your city or area name.</p>

            <div>
              <label className="block text-sm font-bold text-surface-700 mb-2">City or Area</label>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-surface-900"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3.5 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Searching...</>
              ) : (
                <><MapPin size={18} /> Save Location</>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setManualMode(false); setManualLocation(''); }}
              className="w-full text-surface-600 font-bold py-2 rounded-xl hover:bg-surface-100 transition-all text-sm"
            >
              ← Back to auto-detect
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
