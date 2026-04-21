// Import mongoose (used to connect and interact with MongoDB)
const mongoose = require('mongoose');

// Import Service model (represents services collection in DB)
const Service = require('./src/models/Service');

// Import fs module (used to write output to file)
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

// Async function to check geo (location-based) queries
async function checkGeo() {
  try {
    // Connect to MongoDB using connection string
    await mongoose.connect('mongodb+srv://syed:syed2006@cluster0.zevfoxt.mongodb.net/serve');

    // Initialize output string
    let out = "Connected directly to MongoDB\n";
    
    // Get all collections from database
    const collections = await mongoose.connection.db.collections();

    // Find 'services' collection
    const serviceCol = collections.find(c => c.collectionName === 'services');

    // If services collection exists
    if (serviceCol) {
      // Get indexes (important for geo queries)
      const indexes = await serviceCol.indexes();

      // Add indexes info to output
      out += "Indexes on Services: " + JSON.stringify(indexes, null, 2) + "\n";
    }

    // Fetch all services from database
    const allServices = await Service.find({});

    // Add total count of services
    out += `Total services in DB: ${allServices.length}\n`;
    
    // If there are services
    if (allServices.length > 0) {

      // Show location of first service
      out += "Sample service location: " + JSON.stringify(allServices[0].location) + "\n";

      // Define reference coordinates (Bangalore)
      const lon = 77.5946;
      const lat = 12.9716;
      
      // Geo query: find services near given location
      const geoServices = await Service.find({
        location: {
          $near: { // MongoDB operator for nearest locations
            $geometry: { type: 'Point', coordinates: [lon, lat] }, // GeoJSON format
            $maxDistance: 50000, // max distance in meters (50km)
          }
        }
      });

      // Add count of nearby services
      out += `Services within 50km of [${lon}, ${lat}]: ${geoServices.length}\n`;
      
      // Calculate approximate distances manually
      out += "Distances of all services from user:\n";

      // Loop through all services
      allServices.forEach((s) => {

        // Check if location exists
        if(s.location && s.location.coordinates) {

          // Extract service coordinates
          const sLon = s.location.coordinates[0];
          const sLat = s.location.coordinates[1];

          // Calculate difference
          const dLon = sLon - lon;
          const dLat = sLat - lat;

          // Calculate approximate distance (1 degree ≈ 111 km)
          const dist = Math.sqrt(dLon * dLon + dLat * dLat) * 111;

          // Add distance info to output
          out += ` - Service ${s.title}: [${sLon}, ${sLat}] approx ${dist.toFixed(2)} km away\n`;
        }
      });
    }

    // Write output to file (UTF-8 format)
    fs.writeFileSync('out-utf8.txt', out, 'utf8');

  } catch(err) {
    // Handle errors
    console.error(err.message);

  } finally {
    // Close MongoDB connection (always runs)
    mongoose.connection.close();
  }
}

// Call the function
checkGeo();