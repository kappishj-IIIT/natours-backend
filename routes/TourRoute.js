const express=require('express')
const tourController=require("./../controller/tourController")
const authController=require("./../controller/authController")
const reviewController=require("./../controller/reviewController")
const reviewRoute=require("./../routes/reviewRoute")
const tourRouter=express.Router();


tourRouter.use('/:tourId/reviews',reviewRoute)
// tourRouter.param('id',tourController.checkId)
tourRouter.route("/monthly-plan/:year").get(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.getMonthlyPlan)
tourRouter.route("/top-5-cheap").get(tourController.aliasTopTours,tourController.getAllTours)
tourRouter.route("/tour-stats").get(tourController.getTourStats)
tourRouter.route('/').get(tourController.getAllTours).post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.CreateTour)
tourRouter.route('/:id').get(tourController.getTourbyID).patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.uploadTourImages,tourController.resizeTourImages,tourController.updateTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)
tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// tourRouter.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReviews)

module.exports=tourRouter