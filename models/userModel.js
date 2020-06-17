const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 2000; //To make sure that passwordChanged after is always set before issuing JWT token
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
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
  // passwordChangedAt=> time at which password was last changed
  // JWTTimeStamp=> time at which entered token was generated
  if (this.passwordChangedAt) {
    // TO CHANGE FORMAT FROM ACTUAL TIME => TIMESTAMP
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }

  //False means password is not changed
  return false;
};

userSchema.methods.createPasswordResetToke = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
