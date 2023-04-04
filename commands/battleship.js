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

		const newButton = (label, id, style) => {
			return new ButtonBuilder()
				.setCustomId(id)
				.setLabel(label)
				.setStyle(style ?? ButtonStyle.Primary)
		}

		let question
		try {
			const row = new ActionRowBuilder()
				.addComponents(
					newButton('Yes', 'y'),
					newButton('No', 'n', ButtonStyle.Danger)
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
				fields[i][k][l] = 0
				/*
				 * 0 = empty
				 * 1 = ship
				 * 2 = miss
				 * 3 = hit
				 * 4 = mine?
				 * 5 = minesweeper?
				 */
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

		class Ship {
			constructor(sizeCount) {
				this.size = sizeCount[0]
				this.count = sizeCount[1]
				this.cords = []
				this.fulcrum = Math.ceil((this.size - 1) / 2)

				this.variations = ['straight', 'angle', 'zigzag']
				const decrement = this.size === 1 ? 0 : 1
				this.variations.slice(0, this.size - decrement)
				// VI: Variation Index
				this.vi = 0
			}
		}

		const placeShip = async () => {
			const ship = new Ship(ships.shift())

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

				fields[0][row][col] = 1
				collector.stop()
			})

			collector.on('end', async collected => {
				if (collected.size < 0) return intr.user.send('Timeout exceeded. Game is cancelled')
				extendShip(ship, row, col)
			})
		}

		const buttons = new ActionRowBuilder()
			.addComponents(
				newButton('⬅️', 'left'),
				newButton('⬇️', 'down'),
				newButton('⬆️', 'up'),
				newButton('➡️', 'right')
			)
		const buttons2 = new ActionRowBuilder()
			.addComponents(
				newButton('🔄', 'rotate'),
				newButton('↪️', 'turn'),
				newButton('☑️', 'done'),
				newButton('Go back', 'back', ButtonStyle.Danger)
			)

		const extendShip = async (ship, row, col) => {
			redrawBoard()

			ship.cords.push([row, col])
			let h = 0, v = 0

			await fieldMessage.edit({ content: 'Choose a direction to extend the ship (arrows down below)\n```fix\n' + fieldAscii + '```', components: [buttons] })
			const collector = intr.channel.createMessageComponentCollector({ time: 60_000 })
			collector.on('collect', async i => {
				await i.deferUpdate()

				switch (i.customId) {
					case 'left':
						h = -1
						break;
					case 'right':
						h = 1
						break;
					case 'down':
						v = 1
						break;
					case 'up':
						v = -1
						break;
				}

				for (let i = 1; i < ship.size; i++) ship.cords.push([row += v, col += h])
				replaceCells(ship.cords, 1)

				redrawBoard()
				collector.stop()
			})

			collector.on('end', async collected => {
				if (collected.size < 0) return intr.user.send('Timeout exceeded. Game is cancelled')
				moveShip(ship)
			})
		}

		const moveShip = async (ship) => {
			await fieldMessage.edit({ content: 'Move and rotate your ship. Click ☑️ when you are done\n```fix\n' + fieldAscii + '```', components: [buttons, buttons2] })
			const collector = intr.channel.createMessageComponentCollector({ idle: 60_000 })

			collector.on('collect', async i => {
				await i.deferUpdate()
				console.log(ship.cords)
				switch (i.customId) {
					case 'rotate':
						const fulcrumCords = ship.cords[ship.fulcrum]
						for (let i = 0; i < ship.size; i++) rotatePartShip(ship.cords, fulcrumCords, i, 1)
						break;
					case 'turn':
						if (ship.size < 3) return
						if (ship.variations[ship.vi] === 'straight') {
							rotatePartShip(ship.cords, ship.cords[1], 0, 1)
							ship.vi++
						} else if (ship.variations[ship.vi] === 'angle' && ship.size < 4) {
							rotatePartShip(ship.cords, ship.cords[1], 0, -1)
							ship.vi = 0
						} else if (ship.variations[ship.vi] === 'angle' && ship.size === 4) {
							rotatePartShip(ship.cords, ship.cords[2], 3, 1)
							ship.vi++
						} else if (ship.variations[ship.vi] === 'zigzag') {
							rotatePartShip(ship.cords, ship.cords[1], 0, -1)
							rotatePartShip(ship.cords, ship.cords[2], 3, -1)
							ship.vi = 0
						}
						break;
					default:
						let h = 0, v = 0
						switch (i.customId) {
							case 'left':
								h = -1
								break;
							case 'right':
								h = 1
								break;
							case 'down':
								v = 1
								break;
							case 'up':
								v = -1
								break;
						}

						replaceCells(ship.cords, 0)
						ship.cords = ship.cords.map(cords => [cords[0] + v, cords[1] + h])
						replaceCells(ship.cords, 1)
				}

				redrawBoard()
				await fieldMessage.edit({ content: 'Move and rotate your ship. Click ☑️ when you are done\n```fix\n' + fieldAscii + '```', components: [buttons, buttons2] })
			})
		}

		const rotatePartShip = (cords, fulcrumCords, id, backwards) => {
			fields[0][cords[id][0]][cords[id][1]] = 0

			const diff = [cords[id][0] - fulcrumCords[0], cords[id][1] - fulcrumCords[1]]
			cords[id][0] -= (diff[0] + diff[1]) * backwards
			cords[id][1] += (diff[0] - diff[1])

			fields[0][cords[id][0]][cords[id][1]] = 1
		}

		const replaceCells = (cells, value) => {
			// wtf
			for (let i = 0; i < cells.length; i++) fields[0][cells[i][0]][cells[i][1]] = value
		}

		const redrawBoard = () => {
			fieldAscii = ' '
			letters.forEach(l => fieldAscii += ' ' + l)

			const syms = ['| ', '[]', '|•', '><']

			for (let i = 0; i < 10; i++) {
				fieldAscii += `\n${numbers[i]} `
				for (let k = 0; k < 10; k++) fieldAscii += syms[
					fields[0][i][k]
				]
			}
		}

		placeShip()
	}
}