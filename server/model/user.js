const mongoose = require('mongoose');

const Schema =  mongoose.Schema;

let userSchema = new Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
        require:true
    },

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports =mongoose.model('User',userSchema);