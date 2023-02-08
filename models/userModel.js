const mongoose = require('mongoose');


// const loginSchema = new mongoose.Schema({
//     name: {
//         type:String,
//         required:true 
//        },
//     email : {
//         type:String,
//         required:true 
//        },
//     pswd : {
//         type:String,
//         required:true 
//        },
// })

const registerSchema = new mongoose.Schema({
    name:  {
        type:String,
        required:true 
       },
    email :  {
        type:String,
        required:true 
       },
    pswd : {
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
    }
})


module.exports = mongoose.model('Register', registerSchema);