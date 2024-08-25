const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let commentReplySchema = new Schema({
    postId : {
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    commentId:{
        type:Schema.Types.ObjectId,
        ref:'Comment'
    },
    commentedBy:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reComment:{   
        type:String,
        default :null
    }
       
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = mongoose.model('ReComment', commentReplySchema);