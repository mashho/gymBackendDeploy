const express = require('express');
const router = express.Router();
const MemberShipController = require('../Controllers/membership');
const auth = require('../middleware/auth');

router.post('/add-membership',auth,MemberShipController.addMembership);
router.get('/get-membership',auth,MemberShipController.getMembership)


module.exports = router;