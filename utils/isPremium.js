// utils/isPremium.js
const isPremium = (message, UserSettings) => {
    // Ensure UserSettings is not null or undefined
    if (!UserSettings) {
        return false;
    }
    
    // Check if the user is premium
    return UserSettings.isPremium && message.author.id === UserSettings.userId;
};

module.exports = {
    isPremium
};
