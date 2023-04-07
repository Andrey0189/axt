import { ChatGPTAPI } from 'chatgpt'

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
		//await intr.deferReply()
		await intr.reply('Loading...')
		const prompt = intr.options.data[0].value
		const api = new ChatGPTAPI({
			apiKey: process.env.OPENAI_API_KEY
		})
		const res = await api.sendMessage(prompt)
		const output = res.text
			.replace('*', '\*')
			.replace('_', '\_')
			.replace('~', '\~')
		intr.editReply(output)
	}
}