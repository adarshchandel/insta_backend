const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let notificationSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        default: null
    },
    isReaded: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    date: { type: Date, default: null }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

module.exports = mongoose.model('Notifiaction', notificationSchema);