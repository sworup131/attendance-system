const QRcode = require('qrcode')
const express = require('express')
const router = express.Router()
const User = require('../models/student')

router.get('/',(req,res)=>{
    res.redirect('/login')
})

//show login page
router.get('/login',(req,res)=>{
    res.render('login')
})

//check username and password
router.post('/login',async (req,res)=>{
    const {username,password} = req.body
    
    if(!username || !password){
        return res.status(400).json({message:"Username and password are required"})
    }
    
    try{
        const user = await User.findOne({username})
        if(user){
            // Check password - compare with stored password
            if(user.password === password){
                res.render('information')
                return
            } else {
                return res.status(400).json({message:"Incorrect password"})
            }
        }
        else{
            return res.status(400).json({message:"User not found"})
        } 
        
    }catch(err){
        console.log("error",err)
        res.status(500).json({message:"Server error"})
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