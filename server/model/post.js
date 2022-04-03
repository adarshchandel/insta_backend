const mongoose = require('mongoose');

const Schema = mongoose.Schema;



let postSchema = new Schema({
    image: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'

    },
    // likes:[
    //     {
    //         type: Schema.Types.ObjectId,
    //         // liked:{default:false}
    //     }
    // ],
    // disLikes:[
    //     {
    //         type:  Schema.Types.ObjectId,
    //         // disLiked:{default:false}
    //     }
    // ],
    // // comments:[
    // //     {
    // //         type:Schema.Types.ObjectId,
    // //         ref:'comment'
    // //     }]
       
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = mongoose.model('Post', postSchema);