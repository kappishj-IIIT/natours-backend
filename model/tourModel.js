const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    //   maxlength: [40, 'Maxium exceeds 40characters'],
    //   minlength: [10, 'Minium 20'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1, 'Rataing >1'],
    },
    ratingsQuantity: {
      type: Number,
      required: [true, 'Must Hve RATING rating'],
    },

    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
      enum: ['easy', 'medium', 'difficult'],
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount shuld b regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'MUST HAVE DESCRIPTION'],
    },
    imageCover: {
      type: String,
      required: [true, 'A must havae a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    
    guides: Array,
    guidesReferencing: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.index({
  slug:1
})
tourSchema.index({
  startLocation:'2dsphere'
})
//virtual populate connect get reviews of a tour

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'refTour',
    localField:'_id'
})

// tourSchema.pre('save', async function (next) {
//   //embedding
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();

//   //     ap() immediately executes the callback for each element and returns an array of promises because:
//   // async functions always return a promise.
//   // Even though await is used inside, .map() does not wait for each promise to resolve.
//   // So, guidesPromise becomes an array of promises: [Promise, Promise, ...].
//   // To get the resolved values (i.e., the user documents), you need to wait for all promises to resolve:
//   // js
//   // Copy
//   // Edit
//   // this.guides = await Promise.all(guidesPromise);
//   // Promise.all() waits for all promises in the array to resolve.
//   // Only then does it give you the array of user documents.
//   // Why is There a Difference?
//   // In the .map() case, each async callback immediately returns a promise for each User.findById(id).
//   // Unlike the await User.find() case, the await is inside an async function (which .map() doesn't wait for).
//   // .map() is synchronous and doesn't care about the asynchronous work inside the callback.
//   // To Summarize:
//   // await User.find() is direct and gives you the resolved value.
//   // Inside .map(), await is used in multiple async callbacks, creating multiple promises.
//   // You must use Promise.all() to wait for all those promises to resolve.
//   // Would you like more examples or further clarification on this?
// });
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTours: { $ne: true } });
  this.start = Date.now();
  this.populate({
    path:'guidesReferencing',
    select:['-passwordChangedAt','-__v'],
    })
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`query took ${Date.now() - this.start} millseconds`);
  next();
});
// tourSchema.pre('save',function(doc,next){
//     console.log("saving doc");

//     next();
// })
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })

tourSchema.pre('aggregate', function (next) {
  this.pipeline().push({ $match: { secretTours: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema, 'myCustomTours');
// const testTour=new Tour({
//     name:'The Forest Hiker',
//     rating:4.7,
//     price:497
// });
// testTour.save().then(doc=>{
//     console.log(doc);

// }).catch(err=>{
//     console.log('Error ',err);

// })

module.exports = Tour;
