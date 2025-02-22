const express=require('express')
const Router=express.Router()
const viewController=require("./../controller/viewController")
const authController=require("./../controller/authController")
const bookingController=require("./../controller/bookingController")
// Router.use(authController.isLoggedIn)
Router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour)
Router.get('/login',authController.isLoggedIn,viewController.getLoginIn)

Router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn,viewController.getOverview)
Router.get('/me',authController.protect,viewController.getAccount)
Router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
Router.get('/my-tours',authController.protect,viewController.getMyTours)


module.exports=Router