const { promisify } = require('util');
const Email = require('./../utils/email');
require('dotenv').config({ path: './../../config.env' }); // ✅ Correct path
const appError = require('../appError');
const User = require('../model/userModel');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
console.log('JWT Secret Key:', process.env.JWT_SECRET);
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const cookieOptions = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 100000),
  secure: false,
  httpOnly: true,
};
const multer = require('multer');

// const multerStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },
//   filename:(req,file,cb)=>{
//     const extension=file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}.${extension}`)

//   }
// })
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('NOT AN IMAGE PLEASE UPLOAD IMAGE', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const signtoken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET, // ✅ Uses the loaded env variable
    { expiresIn: '7d' },
  );
};
const createSendToken = (user, statusCode, res) => {
  const token = signtoken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url=`${req.protocol}://${req.get('host')}/me`
  await new Email(newUser,url).sendWelcome()

  const token = signtoken(newUser._id);
  res.cookie('jwt', token, cookieOptions);
  res.password = undefined;
  // console.log("JWT Secret Key:", process.env.JWT_SECRET);
  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new appError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new appError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('there is no user with email address', 404));
  }

  const resetToken = user.changedPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    
  const resetURL = `${req.protocol}://${req.get(
    'host')}/api/v1/users/resetPassword/${resetToken}`
     new Email(user,resetURL).sendPasswordreset
    res.cookie('jwt', cookieOptions);
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('error sending mail send again', 500));
  }
});

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });




    if (!user) {
      return next(new appError('Token is invalid or has expired', 404));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    // Now wrapped in try-catch block

    const token = signtoken(user._id);
    console.log(token);
    res.cookie('jwt', token, cookieOptions);
    res.status(200).json({
      status: 'success',
      token: token,
    });
  } catch (err) {
    next(err); // Passes error to the global error handler
  }
};
// exports.updatePassword = catchAsync(async (req, res, next) => {
//   console.log("Received body:", req.body); // Debugging

//   if (!req.body.passwordCurrent || !req.body.password || !req.body.passwordConfirm) {
//     return next(new AppError('Please provide all password fields!', 400));
//   }

//   const user = await User.findById(req.user.id).select('+password');
//   console.log("User from DB:", user); // Debugging

//   if (!user) {
//     return next(new AppError('User not found', 404));
//   }

//   // Debugging password values before calling bcrypt
//   console.log("Entered password:", req.body.passwordCurrent);
//   console.log("Stored password:", user.password);

//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError('Your current password is wrong', 401));
//   }

//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();

//   const token = signToken(user._id);
//   console.log("New Token:", token);

//   res.cookie('jwt', token, { httpOnly: true });

//   res.status(200).json({
//     status: 'success',
//     message: 'Password updated successfully!',
//     token,
//   });
// });



exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log("Received body:", req.body); 

  if (!req.body.passwordCurrent || !req.body.password || !req.body.passwordConfirm) {
    return next(new appError('Please provide all password fields!', 400));
}

  const user = await User.findById(req.user.id).select('+password');
  console.log("User from DB:", user); 
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError('Your current password is wrong', 401));
      }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  console.log("Entered password:", req.body.passwordCurrent);
 console.log("Stored password:", user.password);
  await user.save();
  const token = signtoken(user._id);
  console.log(token);
  res.cookie('jwt', token, cookieOptions);
  res.status(200).json({
         status: 'success',
         message: 'Password updated successfully!',
         token,
      });
});

exports.resizeUserPhoto = async (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file) return next();
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('This Route is not for password updates.', 400));
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.cookie('jwt', cookieOptions);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteme = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }, { new: true });
  res.cookie('jwt', cookieOptions);
  res.status(200).json({
    status: 'success deleted',
  });
});
