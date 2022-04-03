const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let commentReplySchema = new Schema({
    commentId:{
        type:Schema.Types.ObjectId,
        ref:'Post'
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