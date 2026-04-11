const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Telemetry = require('./backend/src/models/telemetry.model');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const count = await Telemetry.countDocuments();
    console.log(`Total telemetry records: ${count}`);
    
    const latest = await Telemetry.find().sort({ timestamp: -1 }).limit(5);
    console.log('Latest 5 records:', JSON.stringify(latest, null, 2));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkData();
