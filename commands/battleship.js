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

		let fieldMessage
		const collector = opponent.dmChannel.createMessageComponentCollector({ time: 60_000 })
		collector.on('collect', async i => {
			collector.stop()
			question.delete()
			if (i.customId === 'y') {
				await opponent.send('Обед')
				playMove()
			} else if (i.customId === 'n')
				intr.user.send(`Seems like ${opponent} doesn't want to play with you`)
		})

		collector.on('end', async collected => {
			if (collected.size < 1) {
				await question.edit({ content: 'Timeout exceeded', components: [] })
				await intr.user.send('The opponent didn\'t respond')
			}
		})

		const fields = [Array(10), Array(10)]
		let fieldAscii
		for (let i = 0; i < 2; i++) fields[i].forEach(row => {
			row = Array(10)
		})

		const letters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']
		const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

		const playMove = () => {
			redrawBoard()
			intr.user.send(fieldAscii)
		}

		console.log(fields)
		const redrawBoard = () => {
			letters.forEach(l => fieldAscii += l)

			fields[0].forEach((row, i) => {
				fieldAscii += `\n${numbers[i]} `
				row.forEach(() => {
					fieldAscii += '⬛'
				})
			})
		}
	}
}