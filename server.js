const express=require('express');
const app = express();
const mongoos =require('mongoose');
const router = require('./routes/userRoutes')

const bodyparser=require('body-parser')
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(express.json());
const cors =require('cors');
app.use(cors({origin:'http://localhost:4200/'}))


const URL='mongodb://localhost:27017/CrudOPerations'
async function connect(){
    try{
        await mongoos.connect(URL)
        console.log("connect with mongoDB")
    }catch (error){
     console.log(`Error -> ${error}`)
    }
}
connect()

app.use('/', router)



 app.listen(6000, (req,res)=>{
    console.log("server is connected in the port 6000")
 })