"use strict";
const fs = require("fs");
const express = require("express");
const tourController = require("./../controllers/tourController");

const router = express.Router(); //by convention we call it router and not tourRouter

// app.use('/api/v1/tours', tourRouter);

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   next();
// });
// val is the id that is represented in the url

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// here we chainned the middleware checkBody before the createTour

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
