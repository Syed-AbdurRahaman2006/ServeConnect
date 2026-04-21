const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const fs = require('fs');
require('dotenv').config();

async function checkGeo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serveconnect');
    let out = "Checking availability:\n";
    
    const allServices = await Service.find({});
    allServices.forEach((s) => {
        out += ` - Service ${s.title} : availability = ${s.availability}\n`;
    });
    
    fs.writeFileSync('out-avail.txt', out, 'utf8');
  } catch(err) {
    console.error(err.message);
  } finally {
    mongoose.connection.close();
  }
}
checkGeo();
