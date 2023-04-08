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
			const result = eval(intr.options.data[0].value)
			await intr.editReply(`\`\`\`js\n// Success ✅\n${result}\`\`\``)
		} catch (err) {
			await intr.editReply(`\`\`\`js\n// Error ❎\n${err}\`\`\``)
		}
	}
}