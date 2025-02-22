const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://kappishj:Kappish6@cluster1.u1pte.mongodb.net/"

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected Successfully 🚀");
    } catch (error) {
        console.error("MongoDB Connection Failed ❌", error);
        process.exit(1);
    }
};
// const tourSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         required:[true,'A tour must have a name'],
//         unique:true
//     },
//     rating:{
//         type:Number,
//         default:4.5
//     },
//     price:{
//         type:Number,
//         required:[true,'A tour must have a price']
//     }
// })
// const Tour=mongoose.model('Tour',tourSchema)
// const testTour=new Tour({
//     name:'The Forest Hiker',
//     rating:4.7,
//     price:497
// });
// testTour.save().then(doc=>{
//     console.log(doc);
    
// }).catch(err=>{
//     console.log('Error ',err);
    
// })



process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    process.exit(1)
    
})

module.exports = connectDB;
