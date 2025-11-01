QRcode = require('qrcode')
express = require('express')
router = express.Router()

//making qr code
router.get('/', async(req,res)=>{
    try{
        url = await QRcode.toDataURL('www.youtube.com')
        res.render('login', {qr: url})
    }
    catch{
        console.log("api error")
    }
})

module.exports = router;