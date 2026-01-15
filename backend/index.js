import express from "express";
import 'dotenv/config'
import connectDB from "./db.js";
import cors from 'cors';
import cardRoutes from './routes/cardRoutes.js'
const app = express();
const PORT = process.env.PORT||5000;

app.use(cors());
app.use(express.json());

connectDB();

//Routes: 
app.use('/api/card', cardRoutes);

app.get('/', (req, res)=>{
    res.send("OCR API is Running");
})

app.listen(PORT, ()=>{
    console.log(`Server running on PORT:${PORT}`);
})