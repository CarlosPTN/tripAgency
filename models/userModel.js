const mongoose = require("mongoose");
const dotenv = require("dotenv");
const validator = require("validator");

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
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: true,
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide your password"],
  },
}); //the second parameter of the  schema is the object of the option non persistent shecma
// and now the model:

const User = mongoose.model("User", userSchema);

module.exports = User;
