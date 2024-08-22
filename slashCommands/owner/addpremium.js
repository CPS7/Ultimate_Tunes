const moment = require('moment-timezone');
const { SlashCommandBuilder, ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../../models/users');
const owner = ["727154675496779826", "1251063445869301784 "];
const { adminOnly } = require('../../commands/owner/eval');
const { category } = require('../info/help');

module.exports = {
    name: 'addpremium',
    description: "Adds premium to user",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    ownerOnly:true,
    adminOnly:true,
    category: "owner",
    options: [
        {
            name: 'user',
            description: 'The User you want to give premium to.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'plan',
            description: 'The premium plan type.',
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: 'VIP', value: 'VIP' },
                { name: 'MVP', value: 'MVP' },
                { name: 'MVP++', value: 'MVP++' },
            ],
            required: true,
        },
        {
            name: 'duration',
            description: 'Duration of the premium plan in days.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    run: async (client, interaction) => {
        if (!owner.includes(interaction.user.id)) {
            await interaction.reply("You are not authorized to use this command.");
            return;
        }

        const member = interaction.options.getMember('user');
        const planType = interaction.options.getString('plan');
        const duration = interaction.options.getInteger('duration');

        try {
            let user = await User.findOne({ userId: member.id });
            if (!user) {
                user = new User({ userId: member.id, username: member.user.tag });
            }
            if (user.isPremium) {
                await interaction.reply("The user is already a premium user.");
                return;
            }

            user.isPremium = true;
            user.premiumSince = moment().tz('Asia/Kolkata').toDate();
            user.premiumPlan = planType;
            user.premiumExpiration = moment().tz('Asia/Kolkata').add(duration, 'days').toDate();
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(t(locale, 'commands.addpremium.success', { user: member.user.tag }))
                .setDescription(`Plan: ${planType.charAt(0).toUpperCase() + planType.slice(1)}\nExpires on: ${moment(user.premiumExpiration).format('YYYY-MM-DD')}`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error granting premium status:', error);
            await interaction.reply('Error granting premium status');
        }
    },
};
