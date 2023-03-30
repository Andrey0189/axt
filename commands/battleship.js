// UNFINISHED
// Coming soon...

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
	name: 'battleship',
	options: [{
		type: 6,
		name: 'opponent',
		description: 'Choose an opponent',
		required: true
	}],
	description: 'Play battleship',
	private: true,
	run: async (intr) => {
		const opponent = intr.options.data[0].user
		if (opponent.bot) return intr.reply({ content: 'You cannot play with bots, dumbass', ephemeral: true })
		//if (opponent.id === intr.user.id) return intr.reply({ content: 'You cannot play yourself, dumbass', ephemeral: true })

		try {
			await intr.user.send('Waiting for your opponent to accept the game...')
		} catch (err) {
			console.log(err)
			return intr.reply('I cannot send messages to your DM')
		}

		let question
		try {
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
			question = await opponent.send({ content: `${opponent} start a battleship game with ${intr.user}?`, components: [row] })
		} catch (err) {
			return intr.reply('I cannot send messages to your opponent\'s DM')
		}

		//await intr.reply('Look DM')

		fieldMessage = await opponent.send('Обед')
		/*let fieldMessage
		const collector = opponent.dmChannel.createMessageComponentCollector({ time: 60_000 })
		collector.on('collect', async i => {
			collector.stop()
			question.delete()
			if (i.customId === 'y') {
				fieldMessage = await opponent.send('Обед')
				placeShip()
			} else if (i.customId === 'n')
				intr.user.send(`Seems like ${opponent} doesn't want to play with you`)
		})

		collector.on('end', async collected => {
			if (collected.size < 1) {
				await question.edit({ content: 'Timeout exceeded', components: [] })
				await intr.user.send('The opponent didn\'t respond')
			}
		})*/

		const fields = [Array(10), Array(10)]
		let fieldAscii
		for (let i = 0; i < 2; i++) for (let k = 0; k < 10; k++) {
			fields[i][k] = Array(10)
			for (let l = 0; l < 10; l++) {
				fields[i][k][l] = '┇ '
			}
		}

		const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
		const numbers = []
		for (let i = 0; i < 10; i++) numbers[i] = i

		const ships = []
		const maxShip = 4
		for (let i = 0; i < maxShip; i++) {
			ships[i] = [maxShip - i, i + 1]
		} // result: [ 4, 1 ], [ 3, 2 ], [ 2, 3 ], [ 1, 4 ]

		const placeShip = async () => {
			const ship = ships.shift()
			let row, col

			redrawBoard()

			await fieldMessage.edit('Enter coordinates to place your ship. Example: `h6`\n```fix\n' + fieldAscii + '```')

			const regex = /[a-j][0-9]/i
			const filter = m => m.content.match(regex)
			const collector = intr.user.dmChannel.createMessageCollector({ filter, time: 60_000 })
			collector.on('collect', async m => {
				const cellCords = m.content.match(regex)[0].toUpperCase()
				row = +cellCords[1]
				col = letters.findIndex(l => l === cellCords[0])

				fields[0][row][col] = '[]'
				collector.stop()
			})

			collector.on('end', async collected => {
				if (collected.size < 0) return intr.user.send('Timeout exceeded. Game is cancelled')
				extendShip(ship, row, col)
			})
		}

		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('left')
					.setLabel('⬅️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('right')
					.setLabel('➡️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('down')
					.setLabel('⬇️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('up')
					.setLabel('⬆️')
					.setStyle(ButtonStyle.Primary),
			)

		const extendShip = async (ship, row, col) => {
			redrawBoard()

			await fieldMessage.edit({ content: 'Choose a direction to extend the ship (arrows down below)\n```fix\n' + fieldAscii + '```', components: [buttons] })
			const collector = intr.channel.createMessageComponentCollector({ time: 60_000 })
			collector.on('collect', async i => {
				switch (i.customId) {
					case 'left':
						for (let i = 0; i < ship[0]; i++) fields[0][row][col - i] = '[]'
						break;
					case 'right':
						for (let i = 0; i < ship[0]; i++) fields[0][row][col + i] = '[]'
						break;
					case 'down':
						for (let i = 0; i < ship[0]; i++) fields[0][row + i][col] = '[]'
						break;
					case 'up':
						for (let i = 0; i < ship[0]; i++) fields[0][row - i][col] = '[]'
						break;
				}

				redrawBoard()
				collector.stop()
			})

			collector.on('end', async collected => {
				if (collected.size < 0) return intr.user.send('Timeout exceeded. Game is cancelled')
				moveShip()
			})
		}

		const moveShip = async () => {
			const buttons2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('rotate')
						.setLabel('🔄')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('turn')
						.setLabel('↪️')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('turn')
						.setLabel('↪️')
						.setStyle(ButtonStyle.Primary),
				)

			await fieldMessage.edit({ content: 'Move and rotate your ship. Click ☑️ when you are done\n```fix\n' + fieldAscii + '```', components: [buttons] })
			const collector = intr.channel.createMessageComponentCollector({ time: 60_000 })
			collector.on('collect', async i => { })
		}

		const redrawBoard = () => {
			fieldAscii = ' '
			letters.forEach(l => fieldAscii += ' ' + l)

			for (let i = 0; i < 10; i++) {
				fieldAscii += `\n${numbers[i]} `
				fieldAscii += fields[0][i].join('')
			}
		}

		placeShip()
	}
}