const { readdirSync } = require("fs");
const { Manager } = require("magmastream");
const nodes = require("./config.json")

module.exports = class Magmastream extends Manager {
  constructor(client) {
    super({
      nodes: nodes.nodes,
      autoPlay: true,
      defaultSearchPlatform: "soundcloud",
      replaceYouTubeCredentials: true,
      clientName: "UltimateTunes",
      send: (id, payload) => this._sendPayload(id, payload),
    });

    this.client = client;
    this._loadMagmastreamEvents();
  }
  
  _sendPayload(id, payload) {
    const guild = this.client.guilds.cache.get(id);
    if (guild) return guild.shard.send(payload);
  }



  _loadMagmastreamEvents() {
    let i = 0;
    readdirSync("./Magmastream").forEach((file) => {
      const event = require(`./Magmastream/${file}`);
      const eventName = file.split(".")[0];
      this.on(eventName, event.bind(null, this.client));
      ++i;
    });
     console.log(`Loaded a total of ${i} Magmastream event(s)`);
  }
};