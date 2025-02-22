const fs = require('fs');
const TourMongoose = require('./../model/tourModel');
const appError = require('../appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');

const multer=require('multer')
const sharp=require('sharp')




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

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkbody=(req,res,next)=>{
//     if(!req.body.name || !req.body.price)
//     {   return res.status(404).json({
//         statuss: "fail",
//         message: "invalid NAME OR PRICE"
//     })
// }
// next();
// }
// exports.checkId=(req,res,next,val)=>
// {
//     if(req.params.id*1>tours.length)
//     {
//         return res.status(404).json({
//             statuss: "fail",
//             message: "invalidID"
//         })

//     }
//     next();

// }

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  LimitFields() {
    if (this.queryString.fields) {
      const fields2 = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields2);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 1;
    const skip = (page - 1) * limit; // <-- 'page' is not defined
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}


exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.CreateTour = catchAsync(async (req, res, next) => {
  // console.log(req.requestTime);

  // console.log(req.body);
  // const newId = tours.length + 1
  // const newTour = Object.assign({ id: newId }, req.body)
  // tours.push(newTour)
  // fs.writeFile((`${__dirname}/dev-data/data/tours-simple.json`), JSON.stringify(tours), err => {
  //     res.status(201).json({ status: "sucess", data: { tour: newTour } })

  // })

  const newTour = await TourMongoose.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.getAllTours = factory.getAll(TourMongoose);
// exports.getAllTours = catchAsync(async (req, res, next) => {
// res.status(200).json({
//     status: "sucess",
//     results: tours.length,
//     data: {
//         tours: tours
//     }
// })

//   let queryObj = { ...req.query };
//   const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   excludedFields.forEach((el) => delete queryObj[el]);
//  let queryStr = JSON.stringify(queryObj);

//   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   queryObj = JSON.parse(queryStr);

//   let query = TourMongoose.find(queryObj);
// returns a promise// gives a query in case of queryObj
// if(req.query.sort)
// {
//     let sortBy = req.query.sort.split(',').join(' ');
//     query=query.sort(sortBy)
// }
// else
// {
//     query=query.sort('-createdAt')
// }

//[pagination]
// if(req.query.fields)
// {
//     const fields2=req.query.fields.split(',').join(" ");
//     query=query.select(fields2)
// }
// else

// {
//     query=query.select('-__v')
// }||1;
// const limit=req.query.limit*1||1;
// const skip=(page-1)*limit
// query=query.skip(skip).limit(limit)

// //if user req a page doesnt exists
// if(req.query.page)
// {
//   const numTours=await TourMongoose.countDocuments();
//   if(skip>=numTours)

//       throw new Error('the page does not exists')
// }

// const features = new APIFeatures(TourMongoose.find(), req.query)
//   .filter()
//   .sort();
// const tours = await features.query;
// res.status(200).json({
//   status: 'sucess',
//   results: tours.length,
//   data: {
//     tours: tours,
//   },
// });

// res.status(404).json({
//   status: 'fail',
//   message: err,
//   notdone:"Coming from here"
// });

exports.getTourbyID = factory.getOne(TourMongoose, { path: 'reviews' });
// exports.getTourbyID = catchAsync(async (req, res, next) => {
//   // console.log(req.params);
//   // const id = req.params.id * 1;
//   // if (id > tours.length)
//   //     return res.status(404).json({
//   //         statuss: "fail",
//   //         message: "invalidID"
//   //     })

//   // const tour = tours.find(el => el.id === id);
//   // res.status(200).json({
//   //     status: "success",
//   //     data: {
//   //         tour: tour
//   //     }
//   // })

//   const Tour = await TourMongoose.findById(req.params.id).populate('reviews');

//   if (!Tour) {
//     return next(new appError(`No tour with that id`, 404));
//   }
//   res.status(200).json({
//     status: 'sucess',
//     results: Tour.length,
//     data: {
//       Tour,
//     },
//   });

//   // res.status(404).json({
//   //   status: 'fail',
//   //   message: err,
//   //   notdone:"not done"
//   // });
// });

exports.updateTour = factory.updateOne(TourMongoose);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const Tour = await TourMongoose.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!Tour) {
//     return next(new appError(`No tour with that id`, 404));
//   }
//   res.status(200).json({
//     status: 'sucess',
//     Tour: Tour,
//   });

//   // res.status(404).json({
//   //   status: 'fail',
//   //   message: err,
//   // });
// });
// exports.deleteTour = catchAsync(async (req, res,next) => {

//     const Tour=await TourMongoose.findByIdAndDelete(req.params.id);
//     if(!Tour)
//       {
//        return next(new appError(`No tour with that id`,404))

//       }
//     res.status(200).json({
//       status: 'sucess',
//     });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   })});

exports.deleteTour = factory.deleteOne(TourMongoose);

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    // const stats= await TourMongoose.aggregate([
    //   {
    //     $match:{ratingsAverage:{$gte:4.5}}
    //   },

    //   {
    //     $group:{
    //       __id:null,
    //       avgRating:{$avg :'$ratingsAverage'},
    //       avgPrice:{$avg :'$price'},
    //       minPrice:{$min :'$price'},
    //       maxPrice:{$max :'$price'}
    //     }
    //   }
    // ])
    const stats = await TourMongoose.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } }, // Ensure only numbers
      {
        $group: {
          _id: '$difficulty',
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    console.log(stats);

    res.status(200).json({
      status: 'sucess',
      stats: stats,
    });
  },

  // catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await TourMongoose.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStates: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStates: -1 } },
      { $limit: 6 },
    ]);
    res.status(200).json({
      status: 'sucess',
      plan: plan,
    });
  },
  // catch
  // { res.status(404).json({
  //   status: 'fail',
  //   message: err,
  // });
  // }
);
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tours = await TourMongoose.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const distances = await TourMongoose.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
