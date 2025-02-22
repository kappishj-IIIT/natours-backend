const catchAsync = require('../utils/catchAsync');
const Tour = require('./../model/tourModel');
const appError = require('../appError');
const Booking = require('../model/bookingModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(400).render('overview.pug', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      select: ['review', 'rating', 'refUser'],
    })
  
  if (!tour) {
    return next(new appError('there is no tour with that name', 404));
  }

  res.status(400).render('tour.pug', {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.getLoginIn = catchAsync(async (req, res, next) => {
  res.status(400).render('login', {
    title: 'Log Onto Your Account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });


  exports.getMyTours=catchAsync(async(req,res,next)=>{

    const bookings=await Booking.find({user:req.user.id})
    const tourIds=bookings.map(el=>el.tour)
    const tour=await Tour.find({_id:{$in:tourIds}})
    res.status(200).render('overview',{
      title:'my tours',
      tours
    })





  })