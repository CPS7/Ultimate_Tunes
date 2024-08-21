const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    voiceChannelId: { type: String, required: true },
    textChannelId: { type: String, required: true },
    // Add any other fields you might need
});

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
