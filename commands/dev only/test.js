const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test2')
		.setDescription('-'),
	async execute(interaction) {
		await interaction.reply(interaction.guild.scheduledEvents);
	},
};