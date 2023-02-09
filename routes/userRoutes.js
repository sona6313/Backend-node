const express = require('express');
const User = require('../Controllers/userControl');
const router = express.Router();
const auth = require('../Middleware/auth')

router.post('/register',User.registerUser)
router.post('/login',User.loginUser)

router.get('/test',auth, function(req,res){
     res.status(200).send({success:true ,msg:"Authendicted"})
})

////////updated password routeee

router.post('/updated-password', User.updated_password)
module.exports = router;
