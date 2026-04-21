import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Navigation, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

/**
 * LocationFetchButton — A standalone button that quickly fetches & saves user location
 * using IP-based geolocation (respects VPN) with GPS fallback.
 * 
 * Props:
 *  - variant: 'user' | 'provider' — changes color theme
 *  - compact: boolean — if true, shows a minimal inline button
 *  - onLocationFetched: (coords) => void — callback after location is saved
 */
const LocationFetchButton = ({ variant = 'user', compact = false, onLocationFetched }) => {
  const [status, setStatus] = useState('idle'); // idle | detecting | saving | done | error
  const [locationName, setLocationName] = useState(null);
  const { updateLocation } = useAuthStore();

  const handleCoordsReceived = async (lat, lng, city) => {
    setStatus('saving');
    try {
      // Save to backend + localStorage
      await updateLocation([lng, lat]);
      localStorage.setItem('userLocation', JSON.stringify({ lat, lng, city }));
      localStorage.setItem('locationName', city);
      window.dispatchEvent(new Event('storage'));

      setLocationName(city);
      setStatus('done');
      toast.success(`📍 Location set to ${city}`);

      if (onLocationFetched) {
        onLocationFetched({ lat, lng, name: city, city, address: city });
      }

      // Reset to idle after 4 seconds
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      toast.error('Failed to save location. Try again.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleClick = async () => {
    setStatus('detecting');
    setLocationName(null);

    try {
      // Primary: IP-based geolocation (respects VPN)
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      
      if (ipData.latitude && ipData.longitude) {
        const city = ipData.city || ipData.region || ipData.country_name || 'Your Location';
        await handleCoordsReceived(ipData.latitude, ipData.longitude, city);
        return;
      }
    } catch (ipError) {
      console.warn('IP geolocation failed, falling back to GPS:', ipError);
    }

    // Fallback: GPS-based geolocation
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
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

        await handleCoordsReceived(latitude, longitude, city);
      },
      (error) => {
        console.error('GPS geolocation failed:', error);
        setStatus('error');
        toast.error('Failed to detect location. Please try again.');
        setTimeout(() => setStatus('idle'), 3000);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Theme config
  const colors = variant === 'provider' 
    ? {
        idle: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/20 hover:shadow-violet-500/30',
        detecting: 'bg-violet-600',
        saving: 'bg-violet-600',
        done: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        error: 'bg-red-500 hover:bg-red-600',
      }
    : {
        idle: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/20 hover:shadow-indigo-500/30',
        detecting: 'bg-indigo-600',
        saving: 'bg-indigo-600',
        done: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        error: 'bg-red-500 hover:bg-red-600',
      };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={status === 'detecting' || status === 'saving'}
        className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed ${colors[status]}`}
      >
        {status === 'idle' && <><Navigation size={15} className="group-hover:animate-pulse" /> Fetch Location</>}
        {status === 'detecting' && <><Loader2 size={15} className="animate-spin" /> Detecting...</>}
        {status === 'saving' && <><Loader2 size={15} className="animate-spin" /> Saving...</>}
        {status === 'done' && <><CheckCircle2 size={15} /> {locationName}</>}
        {status === 'error' && <><RefreshCw size={15} /> Retry</>}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={status === 'detecting' || status === 'saving'}
        className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed ${colors[status]}`}
      >
        {status === 'idle' && (
          <>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Navigation size={18} />
            </div>
            <div className="text-left">
              <span className="block text-sm leading-tight">Fetch My Location</span>
              <span className="block text-xs text-white/70 font-medium">Auto-detect via GPS</span>
            </div>
          </>
        )}
        {status === 'detecting' && (
          <>
            <Loader2 size={22} className="animate-spin" />
            <div className="text-left">
              <span className="block text-sm leading-tight">Detecting Location...</span>
              <span className="block text-xs text-white/70 font-medium">Please allow browser access</span>
            </div>
          </>
        )}
        {status === 'saving' && (
          <>
            <Loader2 size={22} className="animate-spin" />
            <div className="text-left">
              <span className="block text-sm leading-tight">Saving Location...</span>
              <span className="block text-xs text-white/70 font-medium">Almost done</span>
            </div>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle2 size={22} />
            <div className="text-left">
              <span className="block text-sm leading-tight">📍 {locationName}</span>
              <span className="block text-xs text-white/70 font-medium">Location saved successfully</span>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <RefreshCw size={22} />
            <div className="text-left">
              <span className="block text-sm leading-tight">Try Again</span>
              <span className="block text-xs text-white/70 font-medium">Location fetch failed</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
};

export default LocationFetchButton;
