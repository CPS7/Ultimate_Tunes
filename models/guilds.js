const { DefaultUserAgent } = require('discord.js');
const mongoose = require('mongoose');


const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String },
    setupChannelId: { type: String, default: null },
    embedMessageId: { type: String, default: null},
    trackEmbedMessageId: {type: String, default: null},
});

module.exports = mongoose.model('Guild', guildSchema);