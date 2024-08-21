module.exports = {
    name: 'eval',
    description: "Adds premium to a user",
    usage: '<prefix>eval <string>',
    onlyOwner: true,
    cooldown: 3000,
    run: async(client, message, args) => {
        if (!args.length) {
            return message.channel.send('Please provide the code to evaluate.');
        }
        const code = args.join(' ');
        try {
            await eval(`(async () => { ${code} })()`).catch(console.error);
            message.delete().catch(console.error);
        } catch (error) {
            console.log(error)
        }
    },
};