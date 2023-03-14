const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getBal } = require('../../data/arcade utils');
const { moderatorChannel } = require('../../config.json');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Spend your ProCraft Points on various things!'),
	async execute(interaction) {

		// defer update to give things time to load
		await interaction.deferReply({ ephemeral: true });

		// get users bal
		let bal = await getBal(interaction.user.id);

		// if the user doesnt have an account tell them they need to open an account
		if (!bal) {
			const embed = new EmbedBuilder()
				.setColor('DarkRed')
				.setTitle(`${interaction.user.username}, you don't have an account! Open one with /open-acc`);

			await interaction.editReply({ embed: [embed], ephemeral: true });

		// else if the user does have an account
		} else {

			// create a function that contains everything so its easy to restart
			const execute = async () => {
				// parse json for pending requests
				const pendingJson = fs.readFileSync('data/pending requests.json');
				const pending = JSON.parse(pendingJson);

				// update user's balance
				bal = await getBal(interaction.user.id);

				// create embed and select menu
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

				// send the embed to the user then create a collector for the select menu
				await interaction.editReply({ content: '', embeds: [embed], components: [menu] }).then(message => {
					let filter = (f) => f.isStringSelectMenu() && f.user.id == interaction.user.id;
					let collector = message.createMessageComponentCollector({ filter, time: 900000 });

					// when someone presses a button
					collector.on('collect', async (c) => {

						// dummy variable
						let row = '';

						// switch statement for the shop items to see what the menu picked
						switch (c.values[0]) {

						// if its "Send a message to my wii"
						case 'item1':

							embed = new EmbedBuilder()
								.setColor('Blue')
								.setAuthor({ name: `${interaction.user.username}, you have ${bal} ProCraft Points`, iconURL: interaction.user.avatarURL() })
								.setTitle('📨 Send a message to my Wii')
								.setDescription('Allows you to send a message to my Wii to read on stream! ***All message requests will have to be approved by moderators before they go through!***');

							// if the user doesn't already have a request open
							if (!pending.item1[interaction.user.id]) {
								embed.addFields(
									{ name: 'Cost', value: '1000' },
								);
							// if the user does have a request open add a field that tells them that they have a request open
							} else {
								embed.addFields(
									{ name: 'Cost', value: '1000' },
									{ name: '‼️ You already have a message request open!', value: 'If you would like to remove this request, or believe it is in error, contact ProCraftGamin' },
								);
							}
							// create buttons for going back and purchasing
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
										.setDisabled(bal < 1000 || pending.item1[interaction.user.id] != null),
								);

							// defer update so the button press is actually recognized
							await c.deferUpdate();

							// edit message and stop the collector for the menu
							await interaction.editReply({ embeds: [embed], components: [row] });
							collector.stop();

							// create filter and collector for message buttons
							filter = (f) => f.isButton() && f.user.id == interaction.user.id;
							collector = message.createMessageComponentCollector({ filter, time: 900000 });

							// when a button is pressed
							collector.on('collect', async (c2) => {

								// defer update so the button press is actually recognized
								c2.deferUpdate();

								// switch statement to figure out what button was pressed
								switch (c2.customId) {

								// if the back button was pressed
								case 'c|back':

									// run execute function to go back to main menu
									execute();
									break;

								// if purchase button was pressed
								case 'c|purchase':

									// if the user doesnt have enough then tell them and go back to main menu
									if (bal < 1000) {
										await interaction.followUp({ content: 'I don\'t know how you got this message cause it shouldn\'t be possible, but you don\'t have enough points to purchase this! ||*maybe use an unscrambler like signal and do some words?*||', ephemeral: true });
										execute();

									// if the user does have enough
									} else {
										embed = new EmbedBuilder()
											.setColor('Blue')
											.setTitle('Send what you would like to send to my Wii!')
											.setDescription('• *Please remember to keep your message within server and stream rules* \n• *175 characters max*\n• *All messages will be reviewed by moderators before being sent*\n• *No points will be removed until your request is accepted by moderators*');

										// try sending to dms
										try {
											// send to dms
											await interaction.user.send({ embeds: [embed] }).then(dm => {

												// create a message collector
												const mFilter = (f) => f.author.id == interaction.user.id && f.content.length <= 175;
												const mCollector = dm.channel.createMessageCollector({ filter: mFilter, time: 900000 });

												// create an embed telling the user to check DMS and edit message
												embed = new EmbedBuilder()
													.setColor('DarkRed')
													.setTitle('Please check your DM\'s to continue!'),

												interaction.editReply({ embeds: [embed], components: [] });

												// when user sends a message in DMS thats shorter than 175 characters
												mCollector.on('collect', async c3 => {

													// add to pending json and overwrite
													pending.item1[interaction.user.id] = c3.content;
													fs.writeFileSync('data/pending requests.json', await JSON.stringify(pending, null, 2));

													// create embed and row for moderators
													embed = new EmbedBuilder()
														.setColor('DarkGreen')
														.setAuthor({ name: `${interaction.user.username} has requested to send "${c3.content}" to ProCraftGamin's Wii`, iconURL: interaction.user.avatarURL() });

													row = new ActionRowBuilder()
														.addComponents(
															new ButtonBuilder()
																.setCustomId(`m|msg|a|${interaction.user.id}`)
																.setStyle(ButtonStyle.Success)
																.setLabel('Approve'),
														)
														.addComponents(
															new ButtonBuilder()
																.setCustomId(`m|msg|d|${interaction.user.id}`)
																.setStyle(ButtonStyle.Danger)
																.setLabel('Deny'),
														);

													// send to moderator channel
													interaction.client.channels.cache.get(moderatorChannel).send({ embeds: [embed], components: [row] });

													// create embed for user saying its been send to moderators
													embed = new EmbedBuilder()
														.setColor('Blue')
														.setTitle('Your request has been sent to moderators. It may take an hour or two for it to be reviewed.');

													// send in DMS
													dm.channel.send({ embeds: [embed] });

													// stop collector
													mCollector.stop();

													// delete shop message
													interaction.deleteReply();

												});
											});
										// if user has dms disabled
										} catch (error) {

											// edit shop message to send message requirements and create a message collector
											await interaction.editReply({ embeds: [embed], components: [] }).then(m2 => {
												const mFilter = (f) => f.author.id == interaction.user.id && f.content.length <= 175;
												const mCollector = m2.channel.createMessageCollector({ filter: mFilter, time: 900000 });

												// once the user types a message in the same channel
												mCollector.on('collect', async c3 => {

													// add to pending json and overwrite
													pending.item1[interaction.user.id] = c3.content;
													fs.writeFileSync('data/pending requests.json', await JSON.stringify(pending, null, 2));

													// create moderator embed and row
													embed = new EmbedBuilder()
														.setColor('DarkGreen')
														.setAuthor({ name: `${interaction.user.username} has requested to send "${c3.content}" to ProCraftGamin's Wii`, iconURL: interaction.user.avatarURL() });

													row = new ActionRowBuilder()
														.addComponents(
															new ButtonBuilder()
																.setCustomId(`m|msg|a|${interaction.user.id}|${c3.content}`)
																.setStyle(ButtonStyle.Success)
																.setLabel('Approve'),
														)
														.addComponents(
															new ButtonBuilder()
																.setCustomId(`m|msg|d|${interaction.user.id}|${c3.content}`)
																.setStyle(ButtonStyle.Danger)
																.setLabel('Deny'),
														);

													// senwd to moderator channel and delete message the user sent from the channel
													interaction.client.channels.cache.get(moderatorChannel).send({ embeds: [embed], components: [row] });
													c3.delete();


													// create embed saying its send to moderators, stop collector and delete main game message
													embed = new EmbedBuilder()
														.setColor('Blue')
														.setTitle('Your request has been sent to moderators.');

													mCollector.stop();
													interaction.deleteReply();
													interaction.followUp({ embeds: [embed], ephemeral: true });
												});
											});
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