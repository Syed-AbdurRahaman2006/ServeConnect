import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { MapPin, X } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const { updateLocation } = useAuthStore();

  if (!isOpen) return null;

  // Use imported key or empty string if not defined
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleLocationSuccess = async (lat, lng, locationName) => {
    try {
      setLoading(true);
      await updateLocation([lng, lat]);
      localStorage.setItem('userLocation', JSON.stringify({ lat, lng }));
      localStorage.setItem('locationName', locationName);
      
      // Trigger a storage event to update the Navbar/other components
      window.dispatchEvent(new Event('storage'));
      
      if (onSave) onSave({ lat, lng, name: locationName });
      setLoading(false);
      onClose();
    } catch (err) {
      toast.error('Failed to save location to profile');
      setLoading(false);
    }
  };

  const getAutoLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setDenied(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`);
          const data = await res.json();
          let city = 'Live Tracked Target';
          
          if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results.find(r => r.types.includes('locality')) || data.results[0];
            const cityComponent = result.address_components.find(c => c.types.includes('locality'));
            if (cityComponent) city = cityComponent.long_name;
            else city = result.formatted_address.split(',')[0];
          }
          await handleLocationSuccess(latitude, longitude, city);
        } catch (err) {
          // Fallback if GMaps fails
          await handleLocationSuccess(latitude, longitude, 'Live Tracked Target');
        }
      },
      (error) => {
        toast.error('Location generic permission denied');
        setDenied(true);
        setLoading(false);
      }
    );
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(manualLocation)}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await res.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const lat = data.results[0].geometry.location.lat;
        const lng = data.results[0].geometry.location.lng;
        
        let city = manualLocation;
        const cityComponent = data.results[0].address_components.find(c => c.types.includes('locality'));
        if (cityComponent) {
          city = cityComponent.long_name;
        } else {
          city = data.results[0].formatted_address.split(',')[0];
        }
        
        await handleLocationSuccess(lat, lng, city);
      } else {
        toast.error('Invalid location. Please enter a valid city.');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Invalid location. Please enter a valid city.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-slide-up">
        {denied && (
          <button onClick={onClose} className="absolute top-4 right-4 text-surface-400 hover:text-surface-700">
            <X size={20} />
          </button>
        )}
        
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <MapPin size={32} />
        </div>
        
        {!denied ? (
          <>
            <h2 className="text-2xl font-bold text-center text-surface-900 mb-2">Set Your Location</h2>
            <p className="text-center text-surface-500 mb-8 font-medium">We need your location to find the best local services and providers.</p>
            
            <button 
              onClick={getAutoLocation} 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 mb-3 shadow-sm"
            >
              {loading ? 'Locating...' : 'Allow Auto-Detect'}
            </button>
            <button 
              onClick={() => setDenied(true)}
              className="w-full bg-surface-100 text-surface-700 font-bold py-3.5 rounded-xl hover:bg-surface-200 transition"
            >
              Add location manually
            </button>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleManualSubmit(e); }} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-surface-900 mb-2">Manual Location</h2>
            <p className="text-center text-surface-500 mb-6 font-medium">Enter your city or area explicitly.</p>
            
            <div>
              <label className="block text-sm font-bold text-surface-700 mb-2">Enter your city or area</label>
              <input 
                type="text" 
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-surface-900"
                required
              />
            </div>
            <button 
              type="button"
              onClick={handleManualSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm pointer-events-auto"
            >
              {loading ? 'Searching Area...' : 'Save Location'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
