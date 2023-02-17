const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const config = require("../config/configur");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { use } = require('../routes/userRoutes');
// const Preview = require('twilio/lib/rest/Preview');
const {email ,password } =require('../routes/env')
const Mailgen = require('mailgen');
const { text } = require('express');

// ----------------------------------------------------------------------token creation

const create_token = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secret_jwt);
    return token;
  } catch (error) {
    res.status(400).send(error.message)
  }
}

//--------------------------------------------------------------------------Secure Passeword
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message)
  }
}

// ----------------------------------------------------------------------------------Register apiii
const registerUser = async (req, res) => {
  try {

    const {name,email,password,confirm,num}=req.body
    console.log(req.body)
    const spassword = await securePassword(password);
    
    const userData = await User.findOne({ email });
    if (userData) {


      res.status(200).json({ success: false, msg: "this email is already exists" });
    } else {


      const user = new User({
        name: name,
        email: email,
        password: spassword,
        confirm: confirm,
        num:num
      });

      const user_data = await user.save();
      const randomString=randomstring.generate()
      const data = await User.findOneAndUpdate({email}, { $set: {
        token:randomString
      }});
      console.log("rtyu")
      const text = 'verify your account'
      const instructions='to varify your account pllease click here'
      const link =`http://localhost:4200/varify?token=${randomString}`
      getbill(data.name,data.email,text,instructions,link)
      console.log("jjjjjjjj")
      res.status(200).json({ success: true,message:"check your email and varify" });
    }
  } catch (error) {
    res.status(400).json(error.message)
  }

}
//--------------------------------------------------------------------------------------Varify User

const Varifyuser = async (req, res) => {
   try{
      
    const token =req.query.token
    const userData= await User.findOneAndUpdate({token} , {
      $set : {
        varified :true,
        usetoken :""
      }
    }, {new : true })
    
    if(userData){
        res.status(200).json({message:"your Account has been varified", data:userData})
    }else{
      res.status(402).json({message:"Your link has been expired"})
    }

  

   }catch(error){
    res.status(400).send(error.message)
   }
}

//-----------------------------------------------------------------------------login api

const loginUser = async (req, res) => {
 
  try {
    const email = req.body.email;
    const password = req.body.password;
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
          token: tokenData
        }
        const response = {
          success: true,
          message: "Login Successfully",
          data: Useresult
        }
        res.status(200).send(response);
      } else {
        res.status(400).send({ success: false, message: "Incorrect Password" })
      }

    } else {
      res.status(400).send({ success: false, message: "Email does not exits" })
    }
  }

  catch (error) {
    res.status(404).send(error.message);
  }

}

//---------------------------------------------------------------------------upadeted password

const updated_password = async (req, res) => {
  try {

    const email = req.body.email;
    const password = req.body.password;

    const data = await User.findOne({ email });

    if (data) {
      const newPassword = await securePassword(password);
      const userdata = await User.findOneAndUpdate({ email }, {
        $set: {
          password: newPassword
        }
      });
      console.log(newPassword)
      res.status(200).send({ success: true, msg: "your password succesfully updated" });

    } else {
      res.status(200).send({ success: false, msg: "user id not found! " });
    }

  } catch (error) {
    res.status(400).send(error.message);
  }
}

//-----------------------------------------------------------------------Forget password

const Forget_password = async (req, res) => {
  try {
    const email = req.body.email;
    const userdata = await User.findOne({ email });

    if (userdata) {
      const randomString = randomstring.generate()
      // const token = Math.random().toString(36).substring(2)
      const data = await User.findOneAndUpdate({ email}, { $set: { token :randomString} });
      console.log("haii from forget password")
      const link =`localhost:3000/reset-password?token=${randomString}`
      const text= 'Reset your password'
       getbill(userdata.email,randomstring);
      res.status(200).send({ success: true, msg: "please check your email and reset your password" })
    } else {
      res.status(200).send({ success: true, msg: "This email does not exist" })
    }


  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}
// send email from gmail account 
const getbill = (name,email,text,instructions,link) => {
// const {email} = req.body;

   let config = {
    service :'gmail',
    auth : {
      user:'sonar6313@gmail.com',
      pass:'zcquukodhyrbnsza'
    }
   }

   const transporter = nodemailer.createTransport(config);
   
  let Mailgenerator = new Mailgen({
     theme :"default",
     product: {
      name:'Sona Raj Enterprises',
      link:'https://mailgen.js/'
     }
  })

  let response = {
    body: {
      name: name,
      intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
      action: {
          instructions: instructions,
          button: {
              color: '#22BC66', // Optional action button color
              text: text,
              link: link
          }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
  }
  }

  let mail =Mailgenerator.generate(response)

  let message = {
    from :'sonar6313@gmail.com',
    to : email,
    subject :text,
    html:mail
  }
  
  transporter.sendMail(message , function (error,info){
    if (error){
    console.log(error)
    }else{
      console.log("message send")
    }
  })

}
//----------------------------------------------------------------------------Reset Password

const reset_password = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token })
    if (tokenData) {
      const passowrd = re.body.passowrd;
      const newPassword = await securePassword(passowrd);
      const userdata = await User.findByIdAndUpdate({ _id: tokenData }, { $set: { password: newPassword, token: '' } }, { new: true });
      res.status(200).send({ success: true, msg: "User password has been reset", data: userdata });
    } else {
      res.status(400).send({ success: false, msg: "the link is expired." })
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}
module.exports = { registerUser, loginUser, updated_password, Forget_password, reset_password ,getbill, Varifyuser}