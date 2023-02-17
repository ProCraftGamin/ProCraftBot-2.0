/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { builtinModules } = require('node:module');
const widthait = require('node:timers/promises').setTimeout;

const width = 11;
const height = 10;

// eslint-disable-next-line prefer-const
let sLength = 1;

// eslint-disable-next-line prefer-const
let snakePos = [[Math.floor(width / 2), Math.floor(height / 2)]];

const executeSnake = async (intera) => {
	let board = '';

	// generate top border
	for (let i = 0; i < width + 2; i++) {
		board = board + '🟫';
	}
	board = board + '\n';

	// generate snake area
	// height loop
	for (let i = 0; i < height; i++) {
		board = board + '🟫';

		// width loop
		for (let j = 0; j < width; j++) {
			if (j == snakePos[0][1] && i == snakePos[0][0]) {
				board = board + '🤢';
			} else {
				board = board + '⬛';
			}
		}
		board = board + '🟫\n';
	}
	// generate bottom border
	for (let i = 0; i < width + 2; i++) {
		board = board + '🟫';
	}


	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('c|⬆️')
				.setLabel('⬆️')
				.setStyle(ButtonStyle.Primary),

			new ButtonBuilder()
				.setCustomId('c|⬇️')
				.setLabel('⬇️')
				.setStyle(ButtonStyle.Primary),

			new ButtonBuilder()
				.setCustomId('c|⬅️')
				.setLabel('⬅️')
				.setStyle(ButtonStyle.Primary),

			new ButtonBuilder()
				.setCustomId('c|➡️')
				.setLabel('➡️')
				.setStyle(ButtonStyle.Primary),

			new ButtonBuilder()
				.setCustomId('c|quit')
				.setLabel('❌')
				.setStyle(ButtonStyle.Danger),
		);

	await intera.editReply({ content: board, embeds: [], components: [row] }).then(message => {
		const filter = (f) => f.isButton && f.user.id == intera.user.id;
		const collector = message.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async c => {
			c.deferUpdate();

			switch (true) {
			case c.customId == 'c|⬆️':

				break;
			}
		});
	});

};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snake')
		.setDescription('Play a game of snake'),
	async execute(interaction) {
		await interaction.reply('Loading snake...');
		for (let i = 5; i >= 0; i--) {
			if (i == 1) {
				const startEmbed = new EmbedBuilder()
					.setColor('Green')
					.setAuthor({ name: 'Snake' })
					.setTitle('How to play')
					.setDescription('Every second, the snake will move. \n\n**Use ⬆️,⬇️,⬅️, and ➡️ to control the snake, and 🔃 to restart.**\n\nEvery 🍎 will give you 50 ProCraft Points, and at the end you will be given ProCraft Points based on how many 🍎 you collected.')
					.setFooter({ text: `The game will start in ${i} second` });

				await interaction.editReply({ embeds: [startEmbed] });
			} else {
				const startEmbed = new EmbedBuilder()
					.setColor('Green')
					.setAuthor({ name: 'Snake' })
					.setTitle('How to play')
					.setDescription('Every second, the snake will move. \n\n**Use ⬆️,⬇️,⬅️, and ➡️ to control the snake, and 🔃 to restart.**\n\nEvery 🍎 will give you 50 ProCraft Points, and at the end you will be given ProCraft Points based on how many 🍎 you collected.')
					.setFooter({ text: `The game will start in ${i} seconds` });

				await interaction.editReply({ content: ' ', embeds: [startEmbed] });
			}
			await widthait (1000);


		}
		executeSnake(interaction);
	},
};