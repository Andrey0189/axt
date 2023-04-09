export default {
	name: 'shell',
	options: [{
		type: 3,
		name: 'code',
		description: 'Code to execute',
		required: true
	}],
	description: 'Execute shell code',
	private: true,
	run: async (intr) => {
		await intr.deferReply()
		try {
			const code = intr.options.data[0].value
			const result = await Bot.child_process.execSync(code)
			if (result.length > 1980) {
				const output = Bot.messageToTxt(result)
				intr.editReply({ content: 'Output is too big. Sending it as a text file:', files: [output] });
			} else intr.editReply(`\`\`\`bash\n# Success ✅\n${result}\`\`\``)
		} catch (err) {
			intr.editReply(`\`\`\`bash\n# Error ❎\n${err}\`\`\``)
		}
	}
}