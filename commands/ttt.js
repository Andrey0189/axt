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
		if (opponent.id === intr.user.id) return intr.reply({ content: 'You cannot play yourself, dumbass', ephemeral: true })

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
		let fieldAscii

		const syms = ['X', 'O']
		const players = [opponent, intr.user]
		let sindex = 0

		const playMove = async (player) => {
			redrawBoard()
			fieldMessage.edit(`${player}, your move. Write a number from 1 to 9\n\`\`\`css\n${fieldAscii}\n\`\`\``)

			const filter = msg => {
				const num = parseInt(msg.content)
				return (msg.author.id === player.id && !isNaN(num) && num >= 1 && num <= 9)
			}

			const msgCollector = intr.channel.createMessageCollector({ filter, time: 60_000 })
			msgCollector.on('collect', async msg => {

				const num = parseInt(msg.content)

				const row = Math.ceil(num / 3) - 1
				const col = (num - 1) % 3
				const cell = field[row][col]

				if (isNaN(cell)) {
					const reply = await msg.reply('This cell is taken')
					setTimeout(() => reply.delete(), 5_000)
					return msg.delete()
				}

				msgCollector.stop('got')
				msg.delete()

				field[row][col] = syms[sindex]

				const win = checkWin(syms[sindex])
				if (win) return endGame(win)

				sindex = Number(!sindex)
				playMove(players[sindex])
			})

			msgCollector.on('end', async collected => {
				if (collected.size < 1) await intr.channel.send('Timeout exceeded')
			})
		}

		const redrawBoard = () => {
			fieldAscii = field.map(row => row.join('|')).join('\n')
		}

		const checkWin = (sym) => {
			if (field.every(row =>
				row.every(cell =>
					isNaN(cell)))) return 'draw'

			for (let i = 0; i < 3; i++) {
				if (
					(field[i][0] === sym && field[i][1] === sym && field[i][2] === sym) ||
					(field[0][i] === sym && field[1][i] === sym && field[2][i] === sym)
				) return true
			}

			return (
				(field[0][0] === sym && field[1][1] === sym && field[2][2] === sym) ||
				(field[0][2] === sym && field[1][1] === sym && field[2][0] === sym)
			)
		}

		const endGame = (result) => {
			redrawBoard()

			let endText = ''
			if (result === 'draw') endText = 'Draw!'
			else endText = `${players[sindex]} won!`

			fieldMessage.edit(`${endText}\n\`\`\`css\n${fieldAscii}\n\`\`\``)
		}
	}
}