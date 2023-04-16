import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export default {
	name: 'tic-tac-toe',
	options: [{
		type: 6,
		name: 'opponent',
		description: 'Choose an opponent',
		required: true
	}],
	description: 'Play tic-tac-toe',
	run: async (intr) => {
		const opponent = intr.options.get('opponent').user
		if (opponent.bot) return intr.reply({ content: 'You cannot play with bots, dumbass', ephemeral: true })
		if (opponent.id === intr.user.id) return intr.reply({ content: 'You cannot play yourself, dumbass', ephemeral: true })

		const newButton = (label, id, style) => {
			return new ButtonBuilder()
				.setCustomId(id)
				.setLabel(label)
				.setStyle(style ?? ButtonStyle.Primary)
		}

		const row = new ActionRowBuilder()
			.addComponents(
				newButton('Yes', 'y'),
				newButton('No', 'n', ButtonStyle.Danger)
			)

		const question = await intr.reply({ content: `${opponent} start a tic-tac-toe game with ${intr.user}?`, components: [row] })
		let fieldMessage

		const filter = i => i.user.id === opponent.id
		const collector = intr.channel.createMessageComponentCollector({ filter, time: 60_000 })
		collector.on('collect', async i => {
			collector.stop()
			question.delete()
			if (i.customId === 'y') {
				fieldMessage = await intr.channel.send('Loading...')
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

		const fieldButtons = []
		fieldButtons[3] = new ActionRowBuilder().addComponents(
			newButton('Exit game', 'exit', ButtonStyle.Danger)
		)

		const syms = ['X', 'O']
		const players = [opponent, intr.user]
		let sindex = 0

		const playMove = async (player) => {
			redrawBoard()
			fieldMessage.edit({ content: `${player}, your move`, components: fieldButtons })

			const filter = i => {
				return (i.message.id === fieldMessage.id && i.user.id === player.id)
			}

			const collector = intr.channel.createMessageComponentCollector({ filter, idle: 60_000 })
			collector.on('collect', async i => {
				collector.stop()
				await i.deferUpdate()

				if (i.customId === 'exit') {
					fieldMessage.edit({ content: `Game abandoned`, components: fieldButtons })
					return intr.channel.send(`${player} exited the game`)
				}

				const row = i.customId[0]
				const col = i.customId[1]

				field[row][col] = syms[sindex]

				const win = checkWin(syms[sindex])
				if (win) return endGame(win)

				sindex = Number(!sindex)
				playMove(players[sindex])
			})

			collector.on('end', async collected => {
				if (collected.size < 1) await intr.channel.send('Timeout exceeded')
			})
		}

		const redrawBoard = () => {
			field.forEach((_, i) => {
				fieldButtons[i] = new ActionRowBuilder()
				field[i].forEach((_, j) => {
					const label = field[i][j]
					const id = '' + i + j
					let style
					let isDisabled = true
					switch (label) {
						case 'X':
							style = ButtonStyle.Primary
							break
						case 'O':
							style = ButtonStyle.Success
							break
						default:
							style = ButtonStyle.Secondary
							isDisabled = false
					}

					fieldButtons[i].addComponents(
						newButton(label, id, style).setDisabled(isDisabled)
					)

				})
			})
		}

		const checkWin = (sym) => {
			for (let i = 0; i < 3; i++) {
				if (
					(field[i][0] === sym && field[i][1] === sym && field[i][2] === sym) ||
					(field[0][i] === sym && field[1][i] === sym && field[2][i] === sym)
				) return true
			}

			if (
				(field[0][0] === sym && field[1][1] === sym && field[2][2] === sym) ||
				(field[0][2] === sym && field[1][1] === sym && field[2][0] === sym)
			) return true

			if (field.every(row =>
				row.every(cell =>
					isNaN(cell)))) return 'draw'
		}

		const endGame = (result) => {
			redrawBoard()

			let endText = ''
			if (result === 'draw') endText = 'Draw!'
			else endText = `${players[sindex]} won!`

			fieldMessage.edit({ content: endText, components: fieldButtons })
		}
	}
}