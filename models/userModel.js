const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "An user must have a name"],
    unique: true, // this is not a validator
  },
  slug: String,
  email: {
    type: String,
    required: [true, "An user has a mail"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: true,
    minLength: 8,
    select: false, //automatially won't show in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide your password"],
    validate: {
      // This only works on Create and Save!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
}); //the second parameter of the  schema is the object of the option non persistent shecma
// and now the model:

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // hash the password witht he cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // in an instance method it points to the actual document
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 //here we add the base 10
    );

    console.log(changedTimestamp, JWTTimestamp);
    return changedTimestamp > JWTTimestamp; //100<200
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
