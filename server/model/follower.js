const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let followerSchema = new Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        ref :'User'
    },
    follower : {
        type : mongoose.Types.ObjectId,
        ref :'User'
    },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
     
module.exports = mongoose.model('followers', followerSchema);