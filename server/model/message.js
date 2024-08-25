const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let messageSchema = new Schema({
    sender : {
        type : mongoose.Types.ObjectId,
        ref :'User'
    },
    receiver : {
        type : mongoose.Types.ObjectId,
        ref :'User'
    },
    message : {
        type : String
    },
    time :{
        type : Number,
        default: Date.now()
    },
    isRead:{
        type:Boolean,
        default :false
    }
       
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
     
module.exports = mongoose.model('Message', messageSchema);