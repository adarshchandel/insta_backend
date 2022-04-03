const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let commentSchema = new Schema({
    postId:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    commentedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    comment:{   
        type:String
    }
       
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = mongoose.model('Comment', commentSchema);