
const playerCache = new Map();

module.exports = {
    get: (guildId) => playerCache.get(guildId),
    set: (guildId, data) => playerCache.set(guildId, data),
    delete: (guildId) => playerCache.delete(guildId),
    clear: () => playerCache.clear(),
};
