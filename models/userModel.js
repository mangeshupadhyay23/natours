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
    select: false, //so that wont be visible to user
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
  passwordChangedAt: {
    type: Date,
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

//instance Method : it will be availavle with all user documents (here we are already importing user document whose mail matches entered ID)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(Date(this.passwordChangedAt), Date(JWTTimestamp));
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
