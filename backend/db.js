import mongoose from "mongoose";
import 'dotenv/config'

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=>console.log('MongoDB Connected!'))
    }catch(err){
        console.log("Mongodb connection failed");
        process.exit(1);
    }


};

export default connectDB;