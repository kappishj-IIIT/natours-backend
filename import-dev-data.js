const app=require('./app.js')
const fs=require('fs')
const connectDB = require("./db");
const Tour=require("./model/tourModel.js")
const filepath=require('./dev-data/data/reviews')
connectDB();

const path = require('path');

// Correctly specify the file path as a string
const tour = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/dev-data/data/tours.json'), 'utf-8')
);

const importData=async()=>{
    try{
        await Tour.create(tour)
        console.log("done succesfully");
        
    }
    catch(ERR)
    {
        console.log(ERR);
        
    }
}
const deleteData=async()=>{
    try{
        await Review.deleteMany({})
        console.log("done  deleted succesfully");
        
    }
    catch(ERR)
    {
        console.log(ERR);
        
    }
}
//
// 
 importData()


