const dotenv=require('dotenv')
dotenv.config({path:'./config.env'})
const app=require('./app.js')
const connectDB = require("./db");

const Tour=require("./model/tourModel.js")

// console.log(process.env)
connectDB()
const port = 3000;

const server=app.listen(port, () => {
    console.log('app listening');

});

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    server.close(()=>{
    process.exit(1)})
    
})
process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    server.close(()=>{
    process.exit(1)})
    
})

