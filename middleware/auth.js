const jwt = require('jsonwebtoken');
const Gym = require('../Models/gym');

const auth = async (req, res, next) =>{
    
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ error: 'No token, authorization denied' });
    }else{
        try{
            const decode = jwt.verify(token, "Its_My_Secret_Key");
            req.gym = await Gym.findById(decode.gymId).select('-password');
            next();
        }catch(err){
            res.status(401).json({ error: 'Token is not valid' });
        }
    }
}

module.exports = auth;