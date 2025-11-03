QRcode = require('qrcode')
express = require('express')
router = express.Router()


router.get('/',(req,res)=>{
    res.redirect('/login')
})
router.get('/login',(req,res)=>{
    res.render('login')
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