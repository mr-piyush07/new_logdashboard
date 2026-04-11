const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Helper method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create a static method to initialize a default admin if none exists
userSchema.statics.initDefaultAdmin = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    console.log('No users found. Creating default admin user admin@example.com / Admin123');
    await this.create({
      email: 'admin@example.com',
      password: 'Admin123'
    });
  }
};

module.exports = mongoose.model('User', userSchema);
