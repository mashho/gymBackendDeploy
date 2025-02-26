const mongoose = require("mongoose");


const memberSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mobileNo:{
        type:String
    },
    address:{
        type:String
    },
    membership:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'membership',
        required: true
    },
    gym:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true
    },
    profilePic:{
        type:String,
        required:true,
    },
    
    status:{
        type: String,
        default:"Active"
    },
    lastPayment:{
        type:Date,
        default:new Date()
    },
    nextBillDate:{
        type:Date,
        required:true
    }
    
},{timestamps:true})

module.exports = mongoose.model('member',memberSchema);