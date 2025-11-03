QRcode = require('qrcode')
express = require('express')
router = express.Router()


router.get('/',(req,res)=>{
    res.redirect('/login')
})

//show login page
router.get('/login',(req,res)=>{
    res.render('login')
})

//check usename and password
router.post('/login',(req,res)=>{
    const {username,password} = req.body
    console.log(username)
    console.log(password)
    console.log(req.body)
    res.json({success:true})
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