const express=require('express')
const reviewController=require("./../controller/reviewController")
const reviewRouter=express.Router({mergeParams:true});
const authController=require("./../controller/authController")
reviewRouter.use(authController.protect)

//user deletig or updating review
reviewRouter.route("/:id/deletereview").delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
reviewRouter.route("/:id/updatereview").patch(authController.restrictTo('user','admin'),reviewController.updateReview)

//to view all reviews about a tour specifically ir cibtains :id 
reviewRouter.route("/getreview").get(reviewController.getReviews)

//user creating its review If the user is authenticated and the request doesn't have refTour and refUser, setUserId will automatically set them.
// The new review will be linked to the currently logged-in user and the relevant tour.
// This approach keeps the code clean and ensures consistency when creating reviews.
reviewRouter.route("/createreview").post(authController.restrictTo('user'),reviewController.setUserId,reviewController.createReviews)
module.exports=reviewRouter