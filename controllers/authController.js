const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/cathcAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signInToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  //1) CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please Check Email And Password', 400));
  }
  //2) Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  //const correct = await user.correctPassword(password,user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3)If eveything ok, send token to client
  const token = signInToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Step 1 => checking whether token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  // Step 2=> verifying the token if it exist

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Step 3=> check if user still exist (token is not expired)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The User belonging to this token does not exist anymore',
        401
      )
    );
  }

  // Step 4=> Check if user changed password after the token

  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Recently Changed Password: Please Login Again', 403)
    );
  }

  // if everything ok then next() will take us to next middleware that is to protected Route
  req.user = currentUser;
  next();
});

/// ...roles makes an array of arguments
exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    /// we will check if currentUser role is included in the roles which have permission to do this operation if yes then next if not then error
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You Do Not Have Permission To Perform This Action', 401)
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //Step 1=> Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No User Found With This Email', 404));
  }

  //Step 2=> Generate random Token
  const resetToken = user.createPasswordResetToke();
  await user.save({ validateBeforeSave: false });

  //Step 3=> Send it as user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email !!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'THere was an error sending the email, Please try again later !!',
        500
      )
    );
  }
};

exports.resetPassword = (req, res, next) => {};
