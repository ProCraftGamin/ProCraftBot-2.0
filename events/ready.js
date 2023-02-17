const { Events, ActivityType } = require('discord.js');
const generalFunctions = require('../data/general functions.js');
const { liveCheck } = require('../data/twitch events.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('for /help || V2.04', { type: ActivityType.Watching });
		generalFunctions.unscrambleGame(client);
		generalFunctions.cmdFunctions(client);
		generalFunctions.checkIfLive(client);
		setInterval(generalFunctions.checkRoles, 43200000, client);
		setInterval(liveCheck, 30000, client);
		liveCheck(client);
	},
};