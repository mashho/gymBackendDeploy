const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MemberController = require('../Controllers/member');


router.get('/all-member',auth,MemberController.getAllMember);
router.post('/register-member',auth,MemberController.registerMember)
router.get('/searched-members',auth,MemberController.getMemberBySearch)
router.get('/monthly-member',auth,MemberController.monthlyMember)
router.get('/within-3-days-expiring',auth,MemberController.nextPaymentwithin3Days)
router.get('/within-4-7-expiring',auth,MemberController.checkNextPaymentBetweenFourAndSevenDays);
router.get('/expired-member',auth,MemberController.expiredMember);

router.get('/inactive-member',auth,MemberController.inactiveMember);




// ----------------------------------- particular member details

router.get('/get-member/:id',auth,MemberController.getMemberByID);
router.post('/change-status/:id',auth,MemberController.changeStatus);
router.put('/update-member-plan/:id',auth,MemberController.updateMemberPlan)

module.exports = router;