const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    user,
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

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Step 1 => checking whether token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
    console.log(err);
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

exports.resetPassword = async (req, res, next) => {
  // Step 1 => Get user Based On the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(hashedToken);
  // Step 2 => If token has not expired, and there is user, set the new password

  if (!user) {
    return next(new AppError('Token is Invalid or has expired', 400));
  }
  // changind the user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // saving all these changes in mongoDB
  await user.save();

  // Step 3 => Update changedPasswordAt property for the user

  // Step 4 => Log the user in, send JWT
  createSendToken(user, 200, res);
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Step 1 => Get user From the collection

  const user = await User.findById(req.user.id).select('+password');
  // Step 2 => Check If Posted Current Password Is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  // Step 3 => If Yes , Then update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdandUpdate wont be used cause it wont use validor neither going to do the encrypting of the new Password
  // Step 4 => Log User in , Send JWT
  createSendToken(user, 200, res);
});

/// NO ERRORS ONLY FOR RENDERED PAGES
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // Step 1=> verifying the token if it exist

    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // Step 2=> check if user still exist (token is not expired)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // Step 3=> Check if user changed password after the token

    if (await currentUser.changePasswordAfter(decoded.iat)) {
      return next();
    }

    // There is logged in user
    res.locals.user = currentUser;
    return next();
  }
  next();
});
