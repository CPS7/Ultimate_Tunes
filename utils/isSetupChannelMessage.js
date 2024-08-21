const isSetupChannelMessage = (message, guildSettings) => {
    // Ensure guildSettings is not null or undefined before accessing its properties
    if (!guildSettings.setupChannelId) {
        return false;
    }
    return guildSettings.setupChannelId && message.channel.id === guildSettings.setupChannelId;
};

module.exports = {
    isSetupChannelMessage
};
