const client = require('..');

client.on('error', (error) => {
    client.setMaxListeners(15);
    console.error('An error occurred:', error);
})