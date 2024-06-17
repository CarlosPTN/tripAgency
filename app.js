const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// 1) /Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // the variable comes from the
  // "console.log(process.env);" from the conifg file that was declared in server.js
}

app.use(express.json());
app.use(express.static(`${__dirname}/public/overview.html`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 🐶🐶');
//   next(); // if we dont put next the code will be blocked stuck in this midleware first from the stack
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3 Routes

//this is called mounting the router

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;
  // whatever we pass as an argument of a function node.js will read it as an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// the code will pass through all the middlewares till
// it reach the last two that are also the routes, will run the url that has the same
