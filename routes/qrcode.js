QRcode = require('qrcode')
express = require('express')
router = express.Router()
const User = require('../models/student')

router.get('/',(req,res)=>{
    res.redirect('/login')
})

//show login page
router.get('/login',(req,res)=>{
    res.render('login')
})

//check usename and password
router.post('/login',async (req,res)=>{
    const {username,password} = req.body
    try{
        const user = await User.findOne({username})
        if(!user) return res.status(400).json({message:"User not found"})
        res.json({success:true})
    }catch(err){
        console.log("error",err)
    }
})


//making qr code
// router.get('/', async(req,res)=>{
//     try{
//         url = await QRcode.toDataURL('www.youtube.com')
//         res.render('login', {qr: url})
//     }
//     catch{
//         console.log("api error")
//     }
// })

// router.post('/login',(req,res)=>{

// })

module.exports = router;