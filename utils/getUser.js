const User = require('../models/users'); // Adjust the path as needed

async function UserSettings(userId,username) {
    try {
        // Attempt to find the user settings
        let userSettings = await User.findOne({ userId });
        
        // If no settings are found, create a new user
        if (!userSettings) {
            userSettings = new User({ userId: userId, isPremium: false, username: username }); // Set default values as needed
            await userSettings.save(); // Save the new user to the database
        }

        return userSettings;
    } catch (error) {
        console.error('Error getting user settings:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}

module.exports = {
    UserSettings
};
