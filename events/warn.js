const client = require('..');

client.on("warn", () => {
    client.setMaxListeners(15);
    console.log(`Warned ${client.user.tag} (${client.user.id})`);
});