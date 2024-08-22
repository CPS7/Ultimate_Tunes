const moment = require('moment-timezone');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/users'); // Adjust the path based on your project structure

module.exports = {
    name: 'addpremium',
    description: "Adds premium to a user",
    usage: '<prefix>addpremium <@user> <plan> <duration>',
    onlyOwner: true,
    cooldown: 3000,
    category: "owner",
    run: async (client, message, args) => {
        // Check if the command user is an owner

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Please mention a user to give premium to.");
        }

        if (args.length < 3) {
            return message.reply("Please specify the plan and duration. Usage: `<prefix>addpremium <@user> <plan> <duration>`");
        }

        const planType = args[1].toLowerCase();
        const validPlans = ['basic', 'standard', 'premium'];
        if (!validPlans.includes(planType)) {
            return message.reply(`Invalid plan type. Valid options are: ${validPlans.join(', ')}`);
        }

        const duration = parseInt(args[2], 10);
        if (isNaN(duration) || duration <= 0) {
            return message.reply("Please provide a valid duration in days.");
        }

        try {
            let user = await User.findOne({ userId: member.id });
            if (!user) {
                user = new User({ userId: member.id, username: member.user.tag });
            }
            if (user.isPremium) {
                return message.reply("The user is already a premium user.");
            }

            user.isPremium = true;
            user.premiumSince = moment().tz('Asia/Kolkata').toDate();
            user.premiumPlan = planType;
            user.premiumExpiration = moment().tz('Asia/Kolkata').add(duration, 'days').toDate();
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`Premium Granted to ${member.user.tag}`)
                .setDescription(`Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}\nExpires on: ${moment(user.premiumExpiration).format('YYYY-MM-DD')}`);

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error granting premium status:', error);
            await message.reply("There was an error while granting premium status. Please try again.");
        }
    }
};
