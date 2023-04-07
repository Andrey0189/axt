export default {
	name: 'chatgpt',
	options: [{
		type: 3,
		name: 'prompt',
		description: 'What do you want to ask?',
		required: true
	}],
	description: 'Ask the real ChatGPT-4',
	run: async (intr) => {
		try {
			await intr.reply('Loading...')
			const prompt = intr.options.data[0].value

			const res = await Bot.ChatGPTAPI.sendMessage(prompt)
			const output = res.text
				.replace('*', '\*')
				.replace('_', '\_')
				.replace('~', '\~')

			intr.editReply(output)
				.catch(_ => console.log(`The output is too big. Logging the answer to the console: ${res.text}`))
		} catch (e) {
			intr.channel.send('Something went wrong lmao')
			console.log(e)
		}
	}
}