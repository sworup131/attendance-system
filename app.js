express = require('express')
const qrRoutes = require('./routes/qrcode.js')
const app = express()

app.set('view engine','ejs')
app.use(express.static('public'));
app.use('/',qrRoutes)

app.listen(3000,()=>{
    console.log("Server running on port 3000")
})