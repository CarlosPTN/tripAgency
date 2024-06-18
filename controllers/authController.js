const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
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

  if (!user || !(await user.correctPassword(paswword, user.password))) {
    return next(new AppError("Incorrect email or password", 400)); //if we put them together we wont give the info to the attacker what was the rootcause of the issue
  }
  // 3) If everything ok, sendd the token to client
  console.log(user);
  const token = "";
  res.status(200).json({
    status: "success",
    token,
  });
});
