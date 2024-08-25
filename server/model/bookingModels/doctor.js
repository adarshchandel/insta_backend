const mongoose = require('mongoose');

const Schema = mongoose.Schema

const doctorSchema = Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    qualifications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'qualifications'
        }
    ],
    documents: [
        {
            type: String
        }
    ],
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    location: {
        type: Point,
        coordinates: []
    },
    isActive :{
        type :Boolean,
        default : true
    }
},{ timestamp : true })


module.exports = mongoose.model('doctors' , doctorSchema)