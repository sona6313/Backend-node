const express = require('express');
const User = require('../Controllers/userControl');
const router = express.Router();

router.post('/register',User.registerUser)



module.exports = router;