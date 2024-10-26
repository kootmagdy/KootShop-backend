const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    // 5od aly anta 3awzo bs
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt, // remove it when it setup [testing only]
    role: req.body.role, // change it to different route for admins only [testing only]
  });

  createSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError(`Please provide email and password!`, 400));
  }
  //2) check if user exits && password is correct
  const user = await User.findOne({ email }).select("+password"); // select here to append password field in response here
  // user here is a doc and we create instance method for all docs
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password!`, 401));
  }
  //after this check remove the password
  user.password = undefined;
  //3) if everything is ok, sned token to client
  createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting the token and check if it's there exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(`You are not logged in! Please log in to get access`, 401)
    );
  }

  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3) Check if user is still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        `the user belonging to this token does no longer exist ! Please log in to get access`,
        401
      )
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    // iat means initaited at -> return the time token created
    return next(
      new AppError(`User recently changed password!, please login again.`, 401)
    );
  }

  // GRANT ACCCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  // AUTHORIZATION
  //to pass arguments should return a new middle ware function
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perfrom this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) GET USER BASED ON POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  //2) GENERATE RANDOM reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // save to db

  //3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forget your password,please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    //reset both token and expires
    user.PasswordResetExpires = undefined;
    user.PasswordResetToken = undefined;
    await user.save({ validateBeforeSave: false }); // save to db
    return next(
      new AppError(
        `There was an error sending the email.  Try again later! ${err}`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  }); // also check if token is not expire

  //2) if token not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetExpires = undefined;
  user.PasswordResetToken = undefined;
  await user.save(); // save to db but here we want to validate

  //3) update changePasswordAt property for the user
  //4) Log the user in, send JWT
  createSendToken(user,200,res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  const user = await User.findById(req.user.id).select("+password");

  //2) check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError(`Your current password is worng.`, 401));
  }

  //3) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // tp use validation

  //4) Log user in, send jwt
  createSendToken(user,200,res);
});

