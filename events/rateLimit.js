const client = require('..');

client.on("rateLimit", () => {
    console.log(`Rate Limited, Sleeping for ${0} seconds`);
});