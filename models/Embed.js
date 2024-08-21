const mongoose = require('mongoose');

const embedSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true }
});

module.exports = mongoose.model('Embed', embedSchema);