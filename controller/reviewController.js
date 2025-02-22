const Review = require("../model/reviewModel")
const catchAsync = require("../utils/catchAsync")
const factory=require("./handleFactory")

exports.getReviews=factory.getAll(Review)
// exports.getReviews=catchAsync(async(req,res,next)=>{
//   let filter={}
//     if(req.params.tourId)
//         filter={refTour:req.params.tourId}
//    const reviews=await Review.find(filter)
//     res.status(200).json({
//         message:"reviews done succesfully",
//         lengtgh:reviews.length,
//         reviews
//     })
// })
exports.createReviews=catchAsync(async(req,res,next)=>{

 


    const reviews=await Review.create(req.body)
     res.status(200).json({
         message:"reviews added",
         reviews
     })
 })
 exports.setUserId=(req,res,next)=>{

    if(!req.body.refTour)
        req.body.refTour=req.params.tourId
       if(!req.body.refUser)
        req.body.refUser=req.user.id
    next()
    
 }
 exports.deleteReview=factory.deleteOne(Review)
 exports.updateReview=factory.updateOne(Review)