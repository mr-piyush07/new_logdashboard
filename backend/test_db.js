const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Connecting to:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('SUCCESS: DB connected');
    const User = require('./src/models/user.model');
    const count = await User.countDocuments();
    console.log('SUCCESS: User count:', count);
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: DB connection error:', err.message);
    process.exit(1);
  });
