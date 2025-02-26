const Gym = require('../Models/gym');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const crypto  = require('crypto')

const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'Lax'
  
};

exports.register = async(req,res)=>{
    try{
        const { gymName,email, userName,password, profilePic  } = req.body;
        const isExist = await Gym.findOne({ userName });
        
        if(isExist){
            res.status(400).json({ error: "Username Already Exist Please try with other username" });
        }else{
            let updatedPass = await bcrypt.hash(password, 10);
            const user = new Gym({gymName,email, userName, profilePic , password: updatedPass });
            await user.save();
            res.status(201).json({ message: 'User registered successfully', success: "yes",data:user });
        }
        
    } catch (error){
        res.status(500).json({ error: 'Server error' });
    }
}

exports.login = async (req,res)=>{
    try{
        const { userName, password } = req.body;
       
        const gym = await Gym.findOne({ userName });
        
        if(gym && await bcrypt.compare(password, gym.password)){
            const token = jwt.sign({ gymId: gym._id }, 'Its_My_Secret_Key');
            
            res.cookie('token', token,cookieOptions);
           
            res.json({ message: 'Logged in successfully', success: "true",token,gym});

        }else{
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (errorMsg){
        res.status(500).json({ error: 'Server error' });
    }
}


exports.sendOtp = async (req,res)=>{
    try{    
        const {email} = req.body;
        const gym = await Gym.findOne({ email });
        if (!gym) {
            return res.status(400).json({ error: 'Gym not found' });
        }
        const buffer = crypto.randomBytes(4); // Get random bytes
        const token = buffer.readUInt32BE(0) % 900000 + 100000; // Modulo to get a 6-digit number
        gym.resetPasswordToken = token;
        gym.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await gym.save();

        // for email Sending
        const mailOptions = {
            from: 'mashhooddanish1234@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Your OTP is : ${token}`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ error: 'Server error',errorMsg:error });
            } else {
                res.status(200).json({message:"OTP Sent to your email"})

            }
        });
    
    } catch (errorMsg){
        res.status(500).json({ error: 'Server error' });
    }
}


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


exports.checkOtp = async (req,res)=>{
    try{    
        const {otp,email} = req.body;
        const gym = await Gym.findOne({ 
            email,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() } 
        });
        
        if (!gym) {
            return res.status(400).json({ error: 'Opt is invalid or has expired' });
        }
        res.status(200).json({message:"OTP is Successfully Verified"})
        


    } catch (errorMsg){
        res.status(500).json({ error: 'Server error' });
    }
}


exports.resetPassword = async (req,res)=>{
    try{
        const {email,newPassword} = req.body;
        
        const gym = await Gym.findOne({email});
        console.log(newPassword)
        if(!gym){
            return res.status(400).json({ error: 'Some Technical Issue , please try again later' });
        }
        let updatedPassword = await bcrypt.hash(newPassword, 10);
        gym.password = updatedPassword;
        gym.resetPasswordExpires=undefined;
        gym.resetPasswordToken=undefined;

        await gym.save();
        res.status(200).json({message:"Password Reset Successfully"})



    }catch (errorMsg){
        res.status(500).json({ error: 'Server error',errorMsg });
    }
}


exports.logout = async(req,res)=>{
    res.clearCookie('token', cookieOptions).json({ message: 'Logged out successfully' });
}