const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const config = require("../config/configur");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { use } = require('../routes/userRoutes');

////////////////////////////SEND EMAIL SMS
// const SendrestpasswordMail = async (name, email, token) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: 'smpt.gmail.com',
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: config.emailUser,
//         pass: config.emailpassword
//       }
//     });

//     const mailoptions = {
//       from: config.emailUser,
//       to: email,
//       subject: 'for reset passowrd',
//       html: '<p> hii ' + name + ',please copy the ink and <a href="localhost:6000/reset-password=' + token + '">Reset your password</a>'

//     }

//     transporter.sendMail(mailoptions, function (error, infor) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Mail has been sent:- ", infor.response);
//       }
//     })

//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message })
//   }
// }

//////////////////////////////////token creation

const mailTransporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:"sonardemo6313@gmail.com",
    pass:"sona12345"
  }
})

const details = {
  from :"sonardemo6313@gmail.com",
  to:"sonar6313@gmail.com",
  subject:"testing our nodemailer",
  text:"testing out it once again"
}

mailTransporter.sendMail(details, (err)=> {
    if(err){
      console.log("its shows an error",err)
    }else{
      console.log("email has sent")
    }
})



const create_token = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secret_jwt);
    return token;
  } catch (error) {
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
///////////////////////////////////////login api
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
          token: tokenData
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

//////////////////////////////////////upadeted password
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

////////////////////Forget password
const Forget_password = async (req, res) => {
  try {
    const email = req.body.email;
    const userdata = await User.findOne({ email: email });

    if (userdata) {
      const token = Math.random().toString(36).substring(2)
      const data = await User.updateOne({ email: email }, { $set: { token } });
      // SendrestpasswordMail(userdata.name, userdata.email, randomstring);
      res.status(200).send({ success: true, msg: "please check your email and reset your password" })
    } else {
      res.status(200).send({ success: true, msg: "This email does not exist" })
    }


  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}

///////////////////////Reset Password
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
      res.status(200).send({ success: false, msg: "the link is expired." })
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}
module.exports = { registerUser, loginUser, updated_password, Forget_password, reset_password }