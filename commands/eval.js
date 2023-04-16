export default {
	name: 'eval',
	options: [{
		type: 3,
		name: 'code',
		description: 'Code to execute',
		required: true
	}],
	description: 'Eval JS code',
	private: true,
	run: async (intr) => {
		await intr.deferReply()
		try {
			const code = intr.options.get('code').value
			const result = await eval(code)
			if (String(result).length > 1980) {
				const output = Bot.messageToTxt(result)
				intr.editReply({ content: 'Output is too big. Sending it as a text file:', files: [output] });
			} else intr.editReply(`\`\`\`js\n// Success ✅\n${result}\`\`\``)
		} catch (err) {
			intr.editReply(`\`\`\`js\n// Error ❎\n${err}\`\`\``)
		}
	}
}