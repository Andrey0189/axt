const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
	name: 'tic-tac-toe',
	options: [{
		type: 6,
		name: 'opponent',
		description: 'Choose an opponent',
		required: true
	}],
	description: 'Play tic-tac-toe',
	run: async (intr) => {
		const opponent = intr.options.data[0].user
		if (opponent.bot) return intr.reply({ content: 'You cannot play with bots, dumbass', ephemeral: true })

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('y')
					.setLabel('Yes')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('n')
					.setLabel('No')
					.setStyle(ButtonStyle.Danger),
			)
		const question = await intr.reply({ content: `${opponent} start a tic-tac-toe game with ${intr.user}?`, components: [row] })

		const filter = i => i.user.id === opponent.id
		const collector = intr.channel.createMessageComponentCollector({ filter, time: 60000 })
		collector.on('collect', async i => {
			question.delete()
			if (i.customId === 'y') {
				playMove(opponent)
			} else if (i.customId === 'n')
				intr.channel.send({ content: `${intr.user}, seems like ${opponent} doesn't want to play with you`, ephemeral: true })
		})

		collector.on('end', async collected => {
			if (collected.size < 1) await question.edit({ content: 'Timeout exceeded', components: [] })
		})

		const field = [
			['1', '2', '3'],
			['4', '5', '6'],
			['7', '8', '9']
		]

		const syms = ['X', 'O']
		const players = [opponent, intr.user]
		let sindex = 0

		const fieldMessage = await intr.channel.send('Loading...')

		const playMove = (player) => {
			renderBoard(player);
			const filter = msg => msg.user.id === msg.user.id
			const collector = intr.channel.createMessageCollector({ filter, time: 60000 })
			console.log('Обычный пон поныч')
			collector.on('collect', msg => {
				console.log('Мощный пон поныч')
				const num = Number(msg.content)
				if (isNaN(num)) {
					msg.reply('Your message is not a number')
				} else if (num > 9 || num < 1) {
					msg.reply('Your number is more than 9 or less than 1')
				} else {
					const row = Math.ceil(num / 3) - 1
					const col = num - 1 % 3
					const cell = field[row][col]
					if (!isNaN(cell)) return msg.reply('This cell is taken')

					field[row][col] = syms[sindex]
					sindex = !sindex

					playMove(players[sindex])
				}
			})
		}

		const renderBoard = (player) => {
			const board = field.map(row => row.join('|')).join('\n')
			fieldMessage.edit(`${player}, your move. Write a number from 1 to 9\n\`\`\`css\n${board}\n\`\`\``)
		}
	}
}