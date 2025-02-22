const express=require('express')
const userController=require("./../controller/userController")
const authController=require("./../controller/authController")
const reviewController=require("./../controller/reviewController")
const multer=require('multer')

const upload=multer({dest:'public/img/users'})


const UserRoute=express.Router()
UserRoute.post('/signup',authController.signup)
UserRoute.post('/login',authController.login)
UserRoute.get('/logout',authController.logout)

UserRoute.patch('/resetPassword/:token',authController.resetPassword)
UserRoute.post('/forgotPassword',authController.forgotPassword)
UserRoute.use(authController.protect)

UserRoute.get('/me',authController.protect,userController.getMe,userController.getUsersByID)

UserRoute.delete('/deleteMe',authController.deleteme)
UserRoute.patch('/updatePassword',authController.updatePassword)
UserRoute.patch('/updateMe',authController.uploadUserPhoto,authController.resizeUserPhoto,authController.updateMe)


UserRoute.use(authController.restrictTo('admin'))

UserRoute.route('/').get(userController.getAllUsers).post(userController.CreateUser)
UserRoute.route('/:id').get(userController.getUsersByID).delete(userController.deleteUser).patch(userController.updateUser)

module.exports=UserRoute




