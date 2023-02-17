/* eslint-disable no-undef */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { token } = require('../../temp.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitchfetch')
		.setDescription('-')
		.addStringOption(option =>
			option.setName('channel')
				.setDescription('The channel to fetch')
				.setRequired(true)),
	async execute(interaction) {
		let res = await fetch('https://api.twitch.tv/helix/streams?user_login=' + interaction.options.getString('channel').replace(' ', ''), {
			method: 'GET',
			headers: {
				'Client-ID': 'nysfco3h85ws5v2jsddyog392ktpen',
				'Authorization': 'Bearer ' + token,
			},
		});
		let rawData = await res.json();
		let streamData = await JSON.stringify(rawData.data);
		streamData = JSON.parse(streamData);

		if (streamData.length == 0) {
			const embed = new EmbedBuilder()
				.setTitle(`${interaction.options.getString('channel')} is currently offline.`)
				.setColor('DarkRed');

			await interaction.reply({ embeds: [embed] });
			return;
		} else {

			res = await fetch('https://api.twitch.tv/helix/users?id=' + streamData[0].user_id, {
				method: 'GET',
				headers: {
					'Client-ID': 'nysfco3h85ws5v2jsddyog392ktpen',
					'Authorization': 'Bearer ' + token,
				},
			});
			rawData = await res.json();
			let userData = await JSON.stringify(rawData.data);
			userData = JSON.parse(userData);

			if (userData.length == 0) {
				return;
			} else {

				const embed = new EmbedBuilder()
					.setAuthor({ name: `${streamData[0].user_name} is currently live!`, iconURL: userData[0].profile_image_url })
					.setTitle(streamData[0].title)
					.setColor('DarkRed')
					.setImage((streamData[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080'))
					.addFields(
						{ name: 'Playing', value: streamData[0].game_name, inline: true },
						{ name: 'Viewers', value: streamData[0].viewer_count.toString(), inline: true },
					);

				await interaction.reply({ embeds: [embed] });
			}
		}
	},
};