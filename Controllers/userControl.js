const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const config = require("../config/configur");
const jwt = require('jsonwebtoken');
const create_token = async(id)=>{
  try{
 const token = await  jwt.sign({_id:id},config.secret_jwt);
    return token; 
}catch(error){
      res.status(400).send(error.message)
  }
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message)
  }
}
const registerUser = async (req, res) => {
  try {
    console.log(req.body)

    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: spassword,
      confirm: req.body.confirm,
      num: req.body.num
    });
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      res.status(200).send({ success: false, msg: "this email is already exists" });
    } else {
      const user_data = await user.save();
      res.status(200).send({ success: true, data: user_data });
    }
  } catch (error) {
    res.status(400).send(error.message)
  }

}



///////login apiiiiiiiiiiiiiiiiiiiii
const loginUser = async (req, res) => {


  
    const email = req.body.email;
    const password = req.body.password;
    try {
      const userdatalogin = await User.findOne({ email })
      // console.log(userdatalogin)

      if (userdatalogin) {

        const passwordMatch = await bcrypt.compare(password, userdatalogin.password);
console.log(passwordMatch);

        if (passwordMatch) {
          const tokenData = await create_token(userdatalogin._id)
          const Useresult = {
            _id: userdatalogin._id,
            name: userdatalogin.name,
            email: userdatalogin.email,
            password: userdatalogin.password,
            confirm: userdatalogin.confirm,
            num: userdatalogin.num,
            token:tokenData
          }
          const response = {
            success: true,
            msg: "Login Successfully",
            data: Useresult
          }
          res.status(200).send(response);
        } else {
          res.status(400).send({ success: false, msg: "Incorrect Password" })
        }

      } else {
        res.status(400).send({ success: false, msg: "Emaildoes not exits" })
      }
    }

    catch (error) {
      res.status(404).send(error.message);
    }

  }

///upadeted passwordddddddddddddddddddddddddd

const updated_password= async(req,res)=>{
    try{

      const email=req.body.email;
      const password=req.body.password;

     const data = await User.findOne({email});

     if(data){
        const newPassword = await securePassword(password);
      const userdata = await  User.findOneAndUpdate({email}, {
        $set:{
          password:newPassword
        }});
  console.log(newPassword)
        res.status(200).send({success:true,msg:"your password succesfully updated"});
         
     }else{
      res.status(200).send({success:false,msg:"user id not found! "});
     }

    }catch(error){
         res.status(400).send(error.message);
    }
}

module.exports = { registerUser, loginUser, updated_password }