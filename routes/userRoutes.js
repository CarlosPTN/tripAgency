"use strict";
const fs = require("fs");
const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

// we cannot fecth from signup, catch data it doesnt make much sense,
router.post("/signup", authController.signup);
router.post("/login", authController.login);

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "err",
    message: "this route is not yet defined",
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: "err",
    message: "this route is not yet defined",
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: "err",
    message: "this route is not yet defined",
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "err",
    message: "this route is not yet defined",
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "err",
    message: "this route is not yet defined",
  });
};

// app.use('/api/v1/users', userRouter); //this is called mounting the router

router.route("/").get(userController.getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
