module.exports = fn => {
    return (req, res, next) => {
      // First occurrence: Here, we receive req, res, next
      fn(req, res, next) // Pass them to the actual function
        .catch(next); // Catch errors and pass to error handler
    };
  };
  

//   //
//   Why Use return Here?
// Creating a Middleware Function:

// return is used to create and return a new function that acts as middleware in Express.
// This new function takes (req, res, next) because it's designed to be used in the Express middleware chain.
// This allows us to wrap any asynchronous route handler (fn) and add error handling.
// Wrapping Asynchronous Functions:

// The returned function wraps the asynchronous function (fn) and automatically catches errors with .catch(next).
// This pattern avoids writing try-catch blocks in every async route handler.
// Example of Usage:

// js
// Copy
// Edit
// const catchAsync = require('./path-to-this-file');

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const tours = await Tour.find();
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours
//     }
//   });
// });
// catchAsync is called with the async function (getAllTours) as fn.
// It returns a new middleware function which is then used by Express like this:
// js
// Copy
// Edit
// app.get('/api/v1/tours', getAllTours);
// Without return:
// If we did not use return, then the code would look like this:
// js
// Copy
// Edit
// module.exports = fn => {
//   (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };
// In this case, the function is created but not returned, so it's lost.
// Express would never receive the middleware function, resulting in a TypeError or no response at all.
// In Summary:
// return ensures that a new middleware function is created and passed back to Express.
// This new function wraps the async function (fn) and automatically catches errors, passing them to the next middleware.
// This pattern keeps the code clean and consistent by avoiding repetitive try-catch blocks.
// That's why return is essential for this pattern to work correctly!







