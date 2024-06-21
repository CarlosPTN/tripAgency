const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
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

  const token = signToken(newUser._id);
  // the id is the data the payload that we want to share with jwt

  res.status(201).json({
    status: "success",
    token, // we need to add it to the response it as a token
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email
  // const password = req.body.password
  // we can do this:
  const { email, password } = req.body;
  // 1)Check if email and password exists
  // and to o that we create a new error if doesnt exists the global error middleware will pick it up and send that error back to client
  // from appError class
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2)Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select("+password"); //since both keys have the same name we can reduce to just: "email"

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401)); //if we put them together we wont give the info to the attacker what was the rootcause of the issue
  }
  // 3) If everything ok, sendd the token to client
  console.log(user);
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(token);
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! PLease login to get access", 401)
    );
  }
  // 2) Verification token, to see if the payload hasnt been manipulated by malitius 3rd party
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // console.log("hello world");
  // console.log(decoded);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist.")
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide'].role='user'
    if (!roles.includes(req.user.role)) {
      //this line permits us to catch the role variale that comes from the middleware
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = (req, res, next) => {};
exports.resetPassword = (req, res, next) => {};
