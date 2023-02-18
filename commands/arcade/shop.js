const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getBal, removeBal } = require('../../data/arcade utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Spend your ProCraft Points on various things!'),
	async execute(interaction) {
		await interaction.deferReply();
		let bal = await getBal(interaction.user.id);
		if (!bal) {
			const embed = new EmbedBuilder()
				.setColor('DarkRed')
				.setTitle(`${interaction.user.username}, you don't have an account! Open one with /open-acc`);

			await interaction.editReply({ embed: [embed], ephemeral: true });
		} else {
			const execute = async () => {
				bal = await getBal(interaction.user.id);
				let embed = new EmbedBuilder()
					.setColor('Blue')
					.setAuthor({ name: `${interaction.user.username}, you have ${bal} ProCraft Points`, iconURL: interaction.user.avatarURL() })
					.setTitle('Welcome to the ProCraft Points shop!')
					.setDescription('Select something from the menu below to learn more about an item!');


				const menu = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('items')
							.setPlaceholder('Select an item to learn more!')
							.setMaxValues(1)
							.setMinValues(1)
							.addOptions([
								{
									label: '📨 Send a message to my Wii (1000 Points)',
									description: 'Sends a message to my Wii to be read on stream!',
									value: 'item1',
								},
							]),
					);


				await interaction.editReply({ content: '', embeds: [embed], components: [menu] }).then(message => {
					let filter = (f) => f.isStringSelectMenu() && f.user.id == interaction.user.id;
					let collector = message.createMessageComponentCollector({ filter, time: 900000 });

					collector.on('collect', async (c) => {
						let row = '';

						switch (c.values[0]) {
						case 'item1':
							embed = new EmbedBuilder()
								.setColor('Blue')
								.setAuthor({ name: `${interaction.user.username}, you have ${bal} ProCraft Points`, iconURL: interaction.user.avatarURL() })
								.setTitle('📨 Send a message to my Wii')
								.setDescription('Allows you to send a message to my Wii to read on stream! ***All message requests will have to be approved by moderators before they go through!***')
								.addFields(
									{ name: 'Cost', value: '1000' },
								);

							row = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setStyle(ButtonStyle.Primary)
										.setLabel('🔙 Back')
										.setCustomId('c|back'),
								)
								.addComponents(
									new ButtonBuilder()
										.setStyle(ButtonStyle.Success)
										.setLabel('🛒 Purchase')
										.setCustomId('c|purchase')
										.setDisabled(bal < 1000),
								);
							await c.deferUpdate();
							await interaction.editReply({ embeds: [embed], components: [row] });
							collector.stop();

							filter = (f) => f.isButton() && f.user.id == interaction.user.id;
							collector = message.createMessageComponentCollector({ filter, time: 900000 });

							collector.on('collect', async (c2) => {
								c2.deferUpdate();
								switch (c2.customId) {
								case 'c|back':
									execute();
									break;

								case 'c|purchase':
									if (bal < 1000) {
										await interaction.followUp({ content: 'I don\'t know how you got this message cause it shouldn\'t be possible, but you don\'t have enough points to purchase this! ||*maybe use an unscrambler like signal and do some words?*||', ephemeral: true });
										execute();
									} else {
										embed = new EmbedBuilder()
											.setColor('Blue')
											.setTitle('Send what you would like to send to my Wii!')
											.setDescription('• *Please remember to keep your message within server and stream rules* \n• *All messages will be reviewed by moderators before being sent*\n• *No points will be removed until your request is accepted by moderators*');

										try {
											await interaction.user.send({ embeds: [embed] });
										} catch (error) {
											
										}
									}

									break;
								}
							});
							break;
						}
					});
				});
			};
			execute();
		}
	},
};