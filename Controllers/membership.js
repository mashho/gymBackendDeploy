const Membership = require('../Models/membership');

exports.addMembership = async(req,res)=>{ 
    try{
        const {months,price} = req.body;
        
        const memberShip = await Membership.findOne({gym:req.gym._id,months});
        if(memberShip){
            memberShip.price = price;
            await memberShip.save();
            res.status(200).json({
                message:"Updated Successfully"
            })
        }else{
            const newMembership = new Membership({months,price,gym:req.gym._id});
            await newMembership.save();
            res.status(200).json({
                message:"Added Successfully"
            })
        }

    } catch (error){
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getMembership= async(req,res)=>{
    try{
        const memberShip = await Membership.find({gym:req.gym._id});
        
            res.status(200).json({
                message:"Membership Fetched Successfully",
                membership : memberShip
            })
        
    } catch (error){
        res.status(500).json({ error: 'Server error' });
    }

}