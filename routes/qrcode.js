const QRcode = require('qrcode')
const express = require('express')
const router = express.Router()
const User = require('../models/student')
const QRCode = require('../models/qrcode')

router.get('/',(req,res)=>{
    res.redirect('/login')
})

//show login page
router.get('/login',(req,res)=>{
    res.render('login')
})

//show information page after successful login
router.get('/information',(req,res)=>{
    res.render('information')
})

//mark attendance by scanning QR code
router.post('/mark-attendance',async (req,res)=>{
    const {qrData} = req.body
    
    if(!qrData){
        return res.status(400).json({message:"Invalid QR code data"})
    }
    
    try{
        // Check if the scanned QR code is valid and active
        const validQRCode = await QRCode.findOne({
            code: qrData,
            isActive: true
        })
        
        if(!validQRCode){
            return res.status(400).json({message:"Invalid QR code. This QR code is not authorized for attendance."})
        }
        
        // QR code is valid - mark attendance
        const timestamp = new Date()
        
        console.log("Valid QR Code scanned:", qrData)
        
        // You can add logic here to:
        // 1. Save attendance record with student ID, timestamp, QR code used
        // 2. Check for duplicate scans (same QR code within same session)
        // 3. Log attendance history
        
        return res.status(200).json({
            message: `Attendance marked successfully!`,
            qrDescription: validQRCode.description,
            timestamp: timestamp
        })
        
    }catch(err){
        console.log("Error marking attendance:", err)
        res.status(500).json({message:"Failed to mark attendance"})
    }
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
                res.redirect('/information')
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