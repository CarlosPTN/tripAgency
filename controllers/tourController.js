// "use strict";
const fs = require("fs");
const Tour = require("./../models/tourModel");
const { CLIENT_RENEG_LIMIT } = require("tls");
const APIFeatures = require("./../utils/APIFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// console.log(Tour);
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  next(); // we cannot forget to call the next middleware otherwise it will be blocked
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       requestedAt: req.requestTime,
//       message: 'Missing name or price ❌',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage, price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // BUILD QUERY
  // 1) Filtering
  // console.log(req.query);

  // EXECUTE QUERY
  // so here we are creating an object
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  // console.log(c);
  // console.log('this are the tours that ', tours);
  // .where('duration')
  // .equals(5)
  // .where('difficulty')
  // .equals('easy');

  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty'); //this find all the docs

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours, // if the key and the value have the same value we dont need to specify both just one
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  console.log("😊😊", req.params.id);

  const tour = await Tour.findById(req.params.id); // it comes from the mongoose
  // Tour.findOne({_id: req.params.id}) the code above is equivalent to this
  // console.log(tour);
  if (!tour) {
    // console.log(tour);
    return next(new AppError("No tour found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour, // if the key and the value have the same value we dont need to specify both just one
    },
  });

  // console.log(req.params); //this allows us to read the parameters from the url
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // //   if (id > tours.length) {

  // if (!tour) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID',
  //   });
  // }
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

//   being a callback function we can never use writeFileSync because it can block the event loop
//   res.send('Done');
// we will always have to send sth to finish the request/response cycle

exports.updateTour = catchAsync(async (req, res, next) => {
  // const tour = tours.find((el) => el.id === id);
  // mongoose as a method for it:
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    console.log(tour);
    return next(new AppError("No tour found with that id", 404));
  }

  res.status(200).json({
    status: "success",

    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  // in a restfull api delete operation we dont send sth to the client

  if (!tour) {
    console.log(tour);
    return next(new AppError("No tour found with that id", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // .aggregate returns an agregate object
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: "EASY" } },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        //down here we create a new date type for the limits so that we limit the values to 2021
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
        // level: { $push: '$difficulty' },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 }, // -1 descending order/ ascending order
    },
    {
      $limit: 12, // limis the qty of outputs
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { plan },
  });
});
