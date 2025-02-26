const mongoose = require("mongoose");


mongoose
  .connect('mongodb+srv://newUser:12345@cluster0.kd08z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{
    
    serverSelectionTimeoutMS: 5000,})
  .then(() => console.log('DB connection successful!')).catch(err=>{
    console.log(err.message)
  });