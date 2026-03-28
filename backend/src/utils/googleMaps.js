const { googleMapsApiKey } = require('../config/env');

/**
 * Calculates accurate driving distance and time using Google Maps Distance Matrix API
 * @param {Array} origin - [longitude, latitude]
 * @param {Array} destinations - Array of [longitude, latitude] combinations
 * @returns {Array|null} Array of { distance, duration } objects or null if failed
 */
const getDistanceMatrix = async (origin, destinations) => {
  if (!googleMapsApiKey) return null;
  if (!origin || !destinations || destinations.length === 0) return null;

  try {
    // Google Maps API expects format: "lat,lng" for coordinates
    const originStr = `${origin[1]},${origin[0]}`;
    const destStr = destinations
      .map((dest) => `${dest[1]},${dest[0]}`)
      .join('|');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&key=${googleMapsApiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK') {
      return data.rows[0].elements; // Array of { distance, duration, status } corresponding to destinations
    }
    
    console.warn('⚠️ Google Maps API Error:', data.error_message || data.status);
    return null;
  } catch (error) {
    console.warn('⚠️ Google Maps Request Failed:', error.message);
    return null;
  }
};

module.exports = { getDistanceMatrix };
