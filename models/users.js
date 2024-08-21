const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    premiumSince: {
        type: Date,
        default: null,
    },
    premiumPlan: {
        type: String,
        enum: ['VIP', 'MVP', 'MVP++'],
        default: null,
    },
    premiumExpiration: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('User', UserSchema);