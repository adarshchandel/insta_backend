const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let likeSchema = new Schema({
    postId:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    isLiked:{   
        type:Boolean,
        default : true
    }
       
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = mongoose.model('like', likeSchema);