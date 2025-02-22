const mongoose = require('mongoose');
const Tour = require('./tourModel');
let r 
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'A review must be given']
  },
  rating: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  refUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a User']
  },
  refTour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'A review must belong to a Tour']
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
//each combination of tour and unique == true
reviewSchema.index({tour:1,user:1},{unique:true})

// Static method for calculating average ratings
reviewSchema.statics.calAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { refTour: tourId } },
    {
      $group: {
        _id: '$refTour',
        nrating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nrating || 0,
    ratingsAverage: stats[0]?.avgRating || 4.5
  });
  console.log('Ratings Calculated:', stats);
};

reviewSchema.pre(/^findOneAnd/, async function(next) {
  r = await this.findOne();

 console.log(r,"nope");
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  console.log("trying",r.refTour.id)
  await this.model.calAverageRatings(r.refTour._id);
});


// Post save middleware
reviewSchema.post('save', function() {
  this.constructor.calAverageRatings(this.refTour);
});

// Pre findOneAnd middleware


// Post findOneAnd middleware

// Populate refTour
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'refTour',
    select: 'name'
  });
  next();
});

// Declare the model LAST
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
