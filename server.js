const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

process.on("uncaughtException", (err) => {
  console.log(err.message, err.name);
  console.log("Uncaught Exception! 💥 SHUTTING down...");
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: "./config.env" });
const app = require("./app.js");

// console.log(app.get('env'));
// this will get the variable environment in which we are

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// console.log(process.env);

// here we connect to the mongodb
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // THIS IS ONE YOU SHOULD INCLDE WHICH WILL GIVE YOU THE NAME AND MESSAGE AS EXPECTED!!!
  }) // The options (useNewUrlParser, useCreateIndex, useFindAndModify) are configurations to avoid deprecation warnings from Mongoose.
  .then((con) => {
    // console.log(con.connections);
    console.log("DB connection Sucessful!!");
  });
// .catch((error) => console.log("ERROR!"));
// down here we have a schema

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  console.log("Unhandler REJECTION! 💥 SHUTTING down...");

  // the 2 lines below will save the errors in a log.txt file
  const now = new Date(Date.now());
  fs.appendFileSync("./log.txt", `${now.toUTCString()} - ${err}\n`, "utf-8");

  server.close(() => {
    //we give the server time to finish all the request that are still pending or being handled at the time, and only after that, the server is then basically killed, all right?
    process.exit(1); // and usually in prod we have another handler to restart our app to not have the app blcoked in this state
  });
  // process.exit(1); VERY ABRUPT !!!
});

const port = process.env.PORT || 8090;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
