const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// this will get the variable environment in which we are

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true, // this is not a validator
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 chars"],
      minlength: [10, "A tour name must have more or equal than 40 chars"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
      //we dont call the validator method coming from the extern library we simply declare it
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium or difficult",
      }, // validators for possible values just for strings
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, "A tour must have a name"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price; // 100 < 200
        }, // down here at the message via mongoose framework we have access tot the value like it is shown below:
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this property hides it from the url field at the client side
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
); //the second parameter of the  schema is the object of the option non persistent shecma
// and now the model:

// the code down below wont appear in the database it wont be persisted thats why we use virtual
tourSchema.virtual("durationWeeks").get(function () {
  return Math.floor(this.duration / 7);
});

// DOCUMENT MIDDLEWARE: runs, before .save() and .create()
// pre save hook:
tourSchema.pre("save", function (next) {
  // the this keyword is going to point to the current middleware
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document... ');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query MIDDLEWARE
// tourSchema.pre('findOne', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
