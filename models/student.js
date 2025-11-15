const mongoose = require("mongoose")

//define a schema
const studentSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

//exporting the model
module.exports = mongoose.model('Student',studentSchema)