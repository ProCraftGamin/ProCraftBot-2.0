const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('-'),
	async execute(interaction) {
		const temp = await interaction.guild.scheduledEvents.fetch();
		console.log(temp == null);
		console.log(temp.first());
	},
};