const client = require('..');

client.on("reconnecting", () => {
    client.setMaxListeners(15);
    console.log(`Reconnected ${client.user.tag} (${client.user.id})`);
});