var express = require("express");
var app = express();
require('dotenv').config({path:"./config.env"})
var port = process.env.PORT || 4000;
const cookieParser = require('cookie-parser');




app.use(express.json());
app.use(cookieParser());

require('./connection');

const GymRoutes = require('./Routes/gym');
const MembershipRoutes = require('./Routes/membership');
const MemberRoutes = require('./Routes/member');


app.get('/',(req,res)=>{
  res.send("hello")
}) 

app.use('/auth',GymRoutes)
app.use('/plans',MembershipRoutes)
app.use('/members',MemberRoutes)


app.listen(port,()=>{console.log(`Our backend project is running on Port ${port}`)});