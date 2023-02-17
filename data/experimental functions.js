const discord = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const { guildId } = require('../config.json');
const options = {
	identity: {
		token: 'zr7aiyrele0lt5u1s2z1dm5kd8tf6h',
	},
	channels: ['procraftgamin'],
};

const twitchClient = new tmi.client(options);


// eslint-disable-next-line no-unused-vars
const startTwitchRelay = (client) => {
	const webhook = new discord.WebhookClient({ id: '1069139268003434556', token: '/O4AF-_6Qn1dPRdAd5gQf3TELnKzizJk3RN4BOvM5OSkh5r2YlLW_MbumZ26xZlVA_m2X' });
	console.log(webhook.channel);
	console.log('started twitchRelay');

	const guild = client.guilds.cache.get(guildId);
	const memberRole = guild.roles.cache.get('1050156940422025287');

	console.log('twitchClient defined');
	twitchClient.on('chat', (channel, user, message) => {
		fetch('https://api.twitch.tv/helix/users?login=' + user.username, {
			method: 'GET',
			headers: {
				'Client-ID': 'nysfco3h85ws5v2jsddyog392ktpen',
				'Authorization': 'Bearer zr7aiyrele0lt5u1s2z1dm5kd8tf6h',
			},
		}).then(res => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error('Error in user request');
			}
		}).then(userData => {
			webhook.send({
				content: message,
				username: user['display-name'],
				avatarURL: userData.data[0].profile_image_url,
			});
		});
	});
	console.log('chat event defined');

	twitchClient.on('connected', () => {
		console.log('connected to twitch');
		webhook.channel.permissionOverwrites.create(memberRole, { ViewChannel: true });
	});
	console.log('connected event defined');
	twitchClient.connect();
};

const endTwitchRelay = (client) => {
	const webhook = new discord.WebhookClient({ url: 'https://discord.com/api/webhooks/1069139268003434556/O4AF-_6Qn1dPRdAd5gQf3TELnKzizJk3RN4BOvM5OSkh5r2YlLW_MbumZ26xZlVA_m2X' });
	console.log(webhook.channel);
	const guild = client.guilds.cache.get(guildId);
	const memberRole = guild.roles.cache.get('1050156940422025287');
	twitchClient.disconnect();
	webhook.channel.permissionOverwrites.create(memberRole, { ViewChannel: false });
};


module.exports = {
	startTwitchRelay: startTwitchRelay,
	endTwitchRelay: endTwitchRelay,
};