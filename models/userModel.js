const mongoose = require('mongoose');




const registerSchema = new mongoose.Schema({
    name:  {
        type:String,
        required:true 
       },
    email :  {
        type:String,
        required:true 
       },
       password : {
        type:String,
        required:true 
       },
    confirm: {
        type:String,
        required:true 
       },
    num : {
        type:String,
        required:true
    },
    token: {
        type:String,
        default:''
    }

})


module.exports = mongoose.model('Register', registerSchema);