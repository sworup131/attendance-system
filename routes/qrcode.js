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

// generate QR code for today's date and render it
router.get('/generate-qr', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().slice(0,10)
        // ensure DB record exists for today's QR
        const qrRecord = await QRCode.findOneAndUpdate(
            { code: todayStr },
            { code: todayStr, description: `Attendance for ${todayStr}`, isActive: true },
            { upsert: true, new: true }
        )

        const dataUrl = await QRcode.toDataURL(todayStr)
        res.render('qrcode_display', { dataUrl, date: todayStr, description: qrRecord.description })
    } catch (err) {
        console.error('Error generating QR:', err)
        res.status(500).send('Failed to generate QR code')
    }
})

//mark attendance by scanning QR code
router.post('/mark-attendance',async (req,res)=>{
    const {qrData} = req.body
    
    if(!qrData){
        return res.status(400).json({message:"Invalid QR code data"})
    }
    
    try{
        // Require logged-in user (session must be set on login)
        if(!req.session || !req.session.userId){
            return res.status(401).json({message: 'Not authenticated. Please login first.'})
        }

        // Today's date string in YYYY-MM-DD
        const today = new Date()
        const todayStr = today.toISOString().slice(0,10)

        // Accept if qrData exactly equals today's date string
        let validQRCode = null
        if(String(qrData) === todayStr){
            // ensure there's a QRCode record for today (create if needed)
            validQRCode = await QRCode.findOneAndUpdate(
                { code: todayStr },
                { code: todayStr, description: `Attendance for ${todayStr}`, isActive: true },
                { upsert: true, new: true }
            )
        } else {
            // Otherwise, check for a matching active QRCode entry in DB
            validQRCode = await QRCode.findOne({ code: qrData, isActive: true })
        }

        if(!validQRCode){
            return res.status(400).json({message:"Invalid QR code. This QR code is not authorized for attendance."})
        }

        // Mark attendance for the logged-in user
        const student = await User.findById(req.session.userId)
        if(!student){
            return res.status(404).json({message: 'User not found'})
        }

        const dateStr = todayStr
        const existing = student.attendance && student.attendance.find(a => a.date === dateStr)
        if(existing && existing.present){
            return res.status(200).json({message: 'Already marked present for today', timestamp: existing.timestamp || null, alreadyMarked: true})
        }

        const timestamp = new Date()
        if(existing){
            existing.present = true
            existing.timestamp = timestamp
        } else {
            student.attendance = student.attendance || []
            student.attendance.push({ date: dateStr, present: true, timestamp: timestamp })
        }

        await student.save()
        console.log("Marked present:", student.username, dateStr)

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
                // set session
                if(req.session){
                    req.session.userId = user._id
                    req.session.username = user.username
                }
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