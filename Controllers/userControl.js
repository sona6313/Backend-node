const User = require('../models/userModel');
const bcryptjs = require("bcrypt");

const securePassword = async(pswd)=> {
  try{
   const passwordHash = await bcryptjs.hash(pswd,10);
   return 
  } catch(error){
    res.status(400).send(error.message)
  }      
}
const registerUser = async(req,res) => {
 try{
    const spassword = await securePassword(req.body.pswd);
    const user = new User({
    name: req.body.name,
    email: req.body.email,
    pswd : spassword,
    confirm: req.body.confirm,
    num :  req.body.num
});
const userData =  await User.findOne({ email: this.email });
    if(userData){
        res.status(200).send({success:false, msg: "this email is already exists"});
    }else{
       const user_data = await user.save();
       res.status(200).send({success:true,data:user_data});
    }
 }catch(error){
  res.status(400).send(error.message)
 }

}

module.exports={registerUser}