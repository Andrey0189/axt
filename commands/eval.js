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
		try {
			const result = eval(intr.options.data[0].value)
			await intr.reply(`\`\`\`js\n// Success ✅\n${result}\`\`\``)
		} catch (err) {
			await intr.reply(`\`\`\`js\n// Error ❎\n${err}\`\`\``)
		}
	}
}