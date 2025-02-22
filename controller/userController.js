const AppError = require("../appError");
const User = require("../model/userModel");
const factory=require("./handleFactory")
const multer=require('multer')
const multerStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/img/users')
  },
  filename:(req,file,cb)=>{
    const extension=file.mimetype.split('/')[1]
    cb(null,`user-${req.user.id}-${Date.now()}.${extension}`)

  }
})

const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }
  else
  {
    cb(new AppError('NOT AN IMAGE PLEASE UPLOAD IMAGE',400),false)
  }
}
const upload=multer({
  storage:multerStorage,
  fileFilter:multerFilter
})


exports.getAllUsers=factory.getAll(User)
// exports. getAllUsers = async (req, res) => {
//     try{
//     const user = await User.find()
//     res.status(200).json({
//      status: 'sucess',
//      results: user.length,
//      data: {
//        user: user
//      }
//     })
// }
    
//   catch (err) {
//    res.status(404).json({
//      status: 'fail',
//      message: err,
//      notdone:"Coming from here"
//    });
//  }

// };
exports.getUsersByID =factory.getOne(User)

exports. CreateUser = (req, res) => {
    res.status(500).json({ status: 'error', message: 'this route is not yet defined pLease use sign in and sign up!' })
};
exports. deleteUser = factory.deleteOne(User)
exports. updateUser = factory.updateOne(User)
exports.uploadUserPhoto=upload.single('photo')
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id
  next()
}
