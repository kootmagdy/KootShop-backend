const mongoose = require("mongoose");
const slugify = require("slugify");
//const validator = require('validator');
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A product must have a title"],
      unique: true,
      trim: true,
      maxlength: [40, "A product name must have less or equal than 40 characters"],
      minlength: [4, "A product name must have more or equal than 4 characters"],
      // validate: [validator.isAlpha,'A tour name must contain character']
    },
    slug: String,
    price: { type: Number, required: [true, "A product must have a price"] },
    imgSrc: {
      type: String,
      required: [true, "A product must have a image"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide it from output in the response
    },
  }
);

// DOCUMENT MIDDLEWARE : runs before .save(), and .create(),  [.insertMany not works with it]
productSchema.pre("save", function (next) {
  // same as express middleware  it have next
  this.slug = slugify(this.title, { lower: true });
  next();
});



// // QUERY MIDDLEWARE
// productSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();

//   next();
// });

// productSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   //console.log(docs);
//   next();
// });



const Product = mongoose.model("Product", productSchema);

module.exports = Product;
