const mongoose = require('mongoose');
 
const schema = mongoose.Schema;

const bookingSchema = new schema({
    doctorId : {
        type : mongoose.Types.ObjectId,
        ref : 'doctors'
    },
    patientId : {
        type : mongoose.Types.ObjectId,
        type : 'users'
    },
    startTime : {
        type : Date , 
    },
    endTime : {
        type : Date
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    isCancled : {
        type : Boolean,
        default : false
    },
    Description : {
        type : String,
    } 
},{ timestamp : true })

module.exports = mongoose.model('bookings' , bookingSchema)