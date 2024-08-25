const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const patientSchema = Schema({
    name : {
        type : String,
        default : ''
    },
    location :{
        type : Point,
        coordinates : []
    },
    age : {
        type : Number,
        default : 10
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    isActive :{
        type :Boolean,
        default : true
    }
},{ timestamp : true })

module.exports = mongoose.model('patients' , patientSchema)