const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Telemetry = require('./src/models/telemetry.model');
const DynamicTelemetry = require('./src/models/dynamicTelemetry.model');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');
    
    const count = await Telemetry.countDocuments();
    console.log('Legacy Telemetry record count:', count);
    if (count > 0) {
      const latest = await Telemetry.findOne().sort({ timestamp: -1 });
      console.log('Latest Legacy timestamp:', latest.timestamp);
    }

    const dCount = await DynamicTelemetry.countDocuments();
    console.log('Dynamic Telemetry record count:', dCount);
    if (dCount > 0) {
      const dLatest = await DynamicTelemetry.findOne().sort({ timestamp: -1 });
      console.log('Latest Dynamic timestamp:', dLatest.timestamp);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

checkData();
