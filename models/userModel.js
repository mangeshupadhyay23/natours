const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
  },
  email: {
    type: String,
    required: [true, 'Please Provide Your Email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please Provide A Valid Email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please Create A Password'],
    minlength: [8, 'A password must have at least 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Your Password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Confirm Password does not match actual password',
    },
  },
});

userSchema.pre('save', async function (next) {
  //only run if password is not modified that is hasing is not done
  if (!this.isModified('password')) return next();

  // bcrypt algo for encrypting or hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirm password and dont store it
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
