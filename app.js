const { log } = require('console');
const express = require('express');
const morgan = require('morgan');
const path=require('path')
const tourRouter = require('./routes/TourRoute');
const viewRoute = require('./routes/viewRoutes');
const bookingRouter=require("./routes/bookingRoute.js")
const UserRoute = require('./routes/UserRoute');
const appError = require('./appError.js');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const app = express();
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const hpp=require('hpp')
const cookieParser=require('cookie-parser')
const xss = require('xss-clean');
const reviewRouter = require('./routes/reviewRoute');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
const cors = require('cors');
app.use(cookieParser())


//dDATA SANTIZATION AGAINST MNOSQRY AGAINST INJECTION
app.use(mongosanitize());

//DATA SANTIZATION AGAINST XSS

app.use(xss())
app.use(hpp({
    whitelist:['duration']
}))

// app.use((req, res, next) => {
//     console.log("Hello from the MiddleWare");
//     req.requestTime = new Date().toISOString()
//     next();
// })

// app.get('/',(req,res)=>
// {
// res.status(200).send("hello from server side");
// })

// app.post('/',(req,res)=>
// {tourController
//     res.send("hi thiis is post")
// })
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// const getAllUsers = (req, res) => {
//     res.status(500).json({ status: 'error', message: 'this route is not yet defined!' })
// }
// const getUsersByID = (req, res) => {
//     res.status(500).json({ status: 'error', message: 'this route is not yet defined!' })
// }
// const CreateUser = (req, res) => {
//     res.status(500).json({ status: 'error', message: 'this route is not yet defined!' })
// }
// const deleteUser = (req, res) => {
//     res.status(500).json({ status: 'error', message: 'this route is not yet defined!' })
// }

// const CreateTour = (req, res) => {
//     console.log(req.requestTime);

//     console.log(req.body);
//     const newId = tours.length + 1
//     const newTour = Object.assign({ id: newId }, req.body)
//     tours.push(newTour)
//     fs.writeFile((`${__dirname}/dev-data/data/tours-simple.json`), JSON.stringify(tours), err => {
//         res.status(201).json({ status: "sucess", data: { tour: newTour } })

//     })

// }

// const getAllTours = (req, res) => {
//     res.status(200).json({
//         status: "sucess",
//         results: tours.length,
//         data: {
//             tours: tours
//         }
//     })
// }

// const getTourbyID = (req, res) => {
//     console.log(req.params);
//     const id = req.params.id * 1;
//     if (id > tours.length)
//         return res.status(404).json({
//             statuss: "fail",
//             message: "invalidID"
//         })

//     const tour = tours.find(el => el.id === id);
//     res.status(200).json({
//         status: "success",
//         data: {
//             tour: tour
//         }
//     })

// }
// app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', CreateTour)

// const UserRoute=express.Router()
// const tourRouter=express.Router();

// tourRouter.route('/').get(getAllTours).post(CreateTour)
// tourRouter.route('/:id').get(getTourbyID)
// UserRoute.route('/').get(getAllUsers).post(CreateUser)
// UserRoute.route('/:id').get(getUsersByID).delete(deleteUser)
app.use(express.static(`${__dirname}/public`));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow both
  credentials: true  // Important for cookies
}));
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'too many requests from IP try again in an hour',
// });
// app.use(helmet());

app.use('/',viewRoute)


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', UserRoute);
app.use("/api/v1/reviews",reviewRouter)
app.use('/api/v1/bookings',bookingRouter)
app.all('*', (req, res, next) => {
  //     status:"fail",
  //     message:`cant find ${req.originalUrl} on this server`

  // })
  // next();

  // 2nd method
  // const err=new Error(`cant find ${req.originalUrl} on this server`)
  // // err.status='fail'
  // // err.statusCode=404
  // // next(err)

  // 3rd method
  next(new appError(`cant find ${req.originalUrl} on this server`, 404));
});

// app.use((err,req,res,next)=>{
//     console.log(err.stack);

//     err.statusCode=err.statusCode||500;
//     err.status=err.status||"err"
//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     })
// })

app.use(globalErrorHandler);
module.exports = app;
