const catchAsync = require("../utils/catchAsync");
const Tour = require("./../model/tourModel");
const factory = require("./handleFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking=require('./../model/bookingModel')
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  console.log("Tour ID:", req.params.tourId);

  const tour = await Tour.findById(req.params.tourId);
  
  if (!tour) {
    return res.status(404).json({ status: "fail", message: "Tour not found" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}%user=${req.user.id}%price=${tour.price}`, // ✅ Corrected spelling
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user ? req.user.email : undefined,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout=catchAsync(async(req,res,next)=>{
    const{tour,user,price}=req.query
    if(!tour && !user && !price){
        return next()
    }
    await Booking.create({tour,user,price})
    res.redirect(req.originalUrl.split(`?`)[0])
    next()
})


exports.createBooking=factory.createOne(Booking)
exports.getBooking=factory.getOne(Booking)
exports.getAllBookings=factory.getAll(Booking)
exports.updateBooking=factory.updateOne(Booking)
exports.deleteBooking=factory.deleteOne(Booking)
