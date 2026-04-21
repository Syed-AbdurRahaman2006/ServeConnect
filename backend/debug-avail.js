const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const fs = require('fs');
require('dotenv').config();

async function checkGeo() {
  try {
    await mongoose.connect('mongodb+srv://syed:syed2006@cluster0.zevfoxt.mongodb.net/serve');
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
