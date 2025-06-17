import express from 'express';
const cors = require('cors');
// import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import productRouter from './routes/products';
import path from 'path';
import orderRouter from './routes/orders';

const { PORT = 3000 } = process.env;
const app = express();
app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, '../public');
app.use('/images', express.static(path.join(publicPath, 'images')));


mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.use('/product', productRouter);
app.use('/order', orderRouter);


app.listen(PORT, () => {

    console.log(`App listening on port ${PORT}`)
})