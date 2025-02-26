const Member = require('../Models/member');
const Membership = require('../Models/membership');


exports.getAllMember=async(req,res)=>{
    try{

        const members = await Member.find({gym:req.gym._id});
        let total = members.length;
        const {skip,limit} = req.query;
        const limitedMembers = await Member.find({gym:req.gym._id}).sort({ createdAt: -1 }).skip(skip).limit(limit)
        res.status(200).json({
            message:members.length?"Fetched Members SuccessFully":"No any Member Registered yet",
            members:limitedMembers,
            totalMembers:total
        })
    } catch (error){
        res.status(500).json({ error: 'Server error' });
    }

}


function addMonthsToDate(months,joiningDate) {
    
    // Get current year, month, and day
    let today = joiningDate;
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // Months are 0-indexed
    const currentDay = today.getDate();
  
    // Calculate the new month and year
    const futureMonth = currentMonth + months;
    const futureYear = currentYear + Math.floor(futureMonth / 12);
  
    // Calculate the correct future month (modulus for month)
    const adjustedMonth = futureMonth % 12;
  
    // Set the date to the first of the future month
    const futureDate = new Date(futureYear, adjustedMonth, 1);
  
    // Get the last day of the future month
    const lastDayOfFutureMonth = new Date(futureYear, adjustedMonth + 1, 0).getDate();
  
    // Adjust the day if current day exceeds the number of days in the new month
    const adjustedDay = Math.min(currentDay, lastDayOfFutureMonth);
  
    // Set the final adjusted day
    futureDate.setDate(adjustedDay);
  
    return futureDate;
  }

exports.registerMember=async(req,res)=>{
    try{
        const {name,mobileNo,address,membership,profilePic,joiningDate} = req.body;
        const member = await Member.findOne({gym:req.gym._id,mobileNo});
        if(member){
            return res.status(409).json({ error: 'Already registered with this Mobile No' })
        }
        const memberShip = await Membership.findOne({gym:req.gym._id,_id:membership});
        

        if(memberShip){
            let getMonth = memberShip.months;
            let jnDate = new Date(joiningDate);
            let nextBillDate = addMonthsToDate(getMonth,jnDate);
            let newMember = new Member({name,mobileNo,address,membership,gym:req.gym._id,profilePic,nextBillDate,lastPayment:new Date(joiningDate)});
            await newMember.save();
            res.status(200).json({message:"Member Registered Successfully"});
        }else{
            return res.status(409).json({error:"No such Membership are there"})
        }
    } catch (error){
        res.status(500).json({ error: 'Server error',errorMsg:error });
    }
}

exports.getMemberBySearch=async(req,res)=>{
    try{
        const {searchTerm} = req.query;
        const member = await Member.find({gym:req.gym._id,
            $or: [
                { name: { $regex: '^' + searchTerm, $options: 'i' } },   // Match name starting with the searchTerm
                { mobileNo: { $regex: '^' + searchTerm, $options: 'i' } }
              ]
        });
        res.status(200).json({
            message:member.length?"Fetched Members SuccessFully":"No Such Member Registered yet",
            members:member,
            totalMembers:member.length
        })
        
    } catch (error){
        res.status(500).json({ error: 'Server error',errorMsg:error });
    }
}

exports.monthlyMember=async(req,res)=>{
    try{
        const now = new Date();

        // Get the first day of the current month (e.g., 2024-09-01 00:00:00)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get the last day of the current month (e.g., 2024-09-30 23:59:59)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Query for users added in the current month
        const member = await Member.find({gym:req.gym._id,
        createdAt: {
            $gte: startOfMonth,  // Greater than or equal to the first day of the month
            $lte: endOfMonth     // Less than or equal to the last day of the month
        }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message:member.length?"Fetched Members SuccessFully":"No Such Member Registered yet",
            members:member,
            totalMembers:member.length
        })

    } catch (error){
        res.status(500).json({ error: 'Server error',errorMsg:error });
    }
}

exports.nextPaymentwithin3Days = async(req,res)=>{
    try{
        const today = new Date();  // Current date and time
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        const member = await Member.find({ gym:req.gym._id,
            nextBillDate: {
              $gte: today,           // Greater than or equal to today
              $lte: threeDaysLater   // Less than or equal to 3 days from today
            }
          });
        
        res.status(200).json({
            message:member.length?"Fetched Members SuccessFully":"No Such Member",
            members:member,
            totalMembers:member.length
        })

        
    }catch (error){
        res.status(500).json({ error: 'Server error',errorMsg:error });
    }
}

exports.checkNextPaymentBetweenFourAndSevenDays = async (req,res) => {
    try {
      const today = new Date();  // Current date and time
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 4);  // Add 3 days to the current date
  
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);  // Add 7 days to the current date
  
      // Query for users where nextPaymentDate is between more than 3 days and less than 7 days from today
      const member = await Member.find({ gym:req.gym._id,
        nextBillDate: {
          $gt: threeDaysLater,   // Greater than 3 days from today
          $lt: sevenDaysLater     // Less than 7 days from today
        }
      });
      res.status(200).json({
        message:member.length?"Fetched Members SuccessFully":"No Such Member",
        members:member,
        totalMembers:member.length
    })
  
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  };
 
  
  exports.expiredMember = async (req,res) => {
    try {
      const today = new Date();  // Current date and time
  
      
      const member = await Member.find({ gym:req.gym._id,status:"Active",
        nextBillDate: {
            $lt: today              // nextBillDate should be in the past
          }
      });
      res.status(200).json({
        message:member.length?"Fetched Members SuccessFully":"No Such Member",
        members:member,
        totalMembers:member.length
    })
  
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  };
 
  exports.inactiveMember = async(req,res)=>{
    try{
        const member = await Member.find({gym:req.gym._id,status:"Pending"}).sort({updatedAt:-1});
        res.status(200).json({
            message:member.length?"Fetched Members SuccessFully":"No Such Member",
            members:member,
            totalMembers:member.length
        })
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  }







  exports.getMemberByID= async(req,res)=>{
    try{
        let {id} = req.params;
        const member = await Member.findOne({gym:req.gym._id,_id:id});
        if(!member){
            return res.status(400).json({
                error:"No Such Member"
            })
        }
        res.status(200).json({
            message:"Member Data fetched",
            member:member
        })
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  }

  exports.changeStatus=async(req,res)=>{
    try{
        const {status} = req.body;
        const {id} = req.params;

        const member = await Member.findOne({gym:req.gym._id,_id:id});
        if(!member){
            return res.status(400).json({
                error:"No Such Member"
            })
        }
        member.status = status;
        await member.save();
        res.status(200).json({
            message:"Status Changed Successfully"
        })
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  }

  exports.updateMemberPlan=async(req,res)=>{
    try{
        let {membership} = req.body;
        let {id} = req.params;
        const memberShip = await Membership.findOne({gym:req.gym._id,_id:membership});
        if(memberShip){
            let getMonth = memberShip.months;
            let today = new Date();
            let nextBillDate = addMonthsToDate(getMonth,today);
            const member = await Member.findOne({gym:req.gym._id,_id:id});
            if(!member){
                return res.status(409).json({error:"No such Member are there"})
            }
            member.nextBillDate = nextBillDate;
            member.lastPayment = today;

            await member.save();

            
            res.status(200).json({message:"Member Renewed Successfully",member});
        }else{
            return res.status(409).json({error:"No such Membership are there"})
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error',errorMsg:err });
    }
  }