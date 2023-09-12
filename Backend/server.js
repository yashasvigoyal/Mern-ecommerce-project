const express = require('express');
const PORT = 4000;
const app = express();
const errorMiddleware = require("./middleware/error");
const user = require("./routes/user_route");
const product  = require("./routes/product_route");
const order = require("./routes/order_route");
const cookieParser = require('cookie-parser');


const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./config');



mongoose.connect(MONGODB_URL);
mongoose.connection.on('connected',()=>{
    console.log("DB connected");
})

mongoose.connection.on('error',(error)=>{
    console.log("Some error while connecting to DB");
})


require('./models/product_model');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(require('./routes/product_route'));
app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
//Middleware for errors
app.use(errorMiddleware);





app.listen(PORT,()=>
    console.log("Server Started"));

