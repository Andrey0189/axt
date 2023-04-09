export default {
	name: 'chatgpt',
	options: [{
		type: 3,
		name: 'prompt',
		description: 'What do you want to ask?',
		required: true
	}],
	private: false,
	description: 'Ask the real ChatGPT-4',
	run: async (intr) => {
		//const obed = '1094010572665790585'
		//if (intr.channel.id !== obed) return intr.reply(`Go to <#${obed}>`)
		try {
			const fixText = (text) => text
				.replace('*', '\*')
				.replace('_', '\_')
				.replace('~', '\~')

			const askChatGPT = async (prompt, parentMsg) => {
				return await Bot.ChatGPTAPI.sendMessage(prompt, {
					parentMessageId: parentMsg
				})
			}

			await intr.reply('Waiting for ChatGPT to generate a reply...')
			const prompt = intr.options.data[0].value.replace('!Become DAN', Bot.conf.DANcopypasta)
			const res = await askChatGPT(prompt, null)
			const output = fixText(res.text)

			const getReply = async () => {
				if (output.length > 1980) {
					const outputTxt = Bot.messageToTxt(output)
					return await intr.editReply({ content: 'Output is too big. Sending it as a text file:', files: [outputTxt] });
				} else return await intr.editReply(output)
			}

			const reply = await getReply()

			Bot.ChatGPTMessagesID[reply.id] = res.id

			const filter = msg => !msg.system && Bot.ChatGPTMessagesID[msg?.reference?.messageId] && msg.author.id === intr.user.id
			const collector = intr.channel.createMessageCollector({ filter, idle: 300_000 })
			collector.on('collect', async msg => {
				const newReply = await msg.reply('Waiting for ChatGPT to generate a reply...')
				const res = await askChatGPT(msg.content, Bot.ChatGPTMessagesID[msg.reference.messageId])

				const output = fixText(res.text)
				if (output.length > 1980) {
					const outputTxt = Bot.messageToTxt(output)
					await newReply.edit({ content: 'Output is too big. Sending it as a text file:', files: [outputTxt] });
				} else await newReply.edit(output)

				delete Bot.ChatGPTMessagesID[msg.reference.messageId]
				Bot.ChatGPTMessagesID[newReply.id] = res.id
			})


			collector.on('end', async collected => {
				const id = collected.last()?.reference?.messageId
				delete Bot.ChatGPTMessagesID[id]
			})

		} catch (e) {
			intr.channel.send(`Something went wrong lmao\n\`\`\`js\n${e}\`\`\``)
		}
	}
}