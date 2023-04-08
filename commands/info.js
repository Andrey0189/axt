export default {
	name: 'info',
	description: 'Prints bot info',
	run: async (intr) => {
		await intr.reply('Loading...')

		const child_process = await import('child_process')
		const ufetch = child_process.execSync('./etc/sysfetch.sh')

		const embed = new Bot.Discord.EmbedBuilder()
			.setAuthor({ name: Bot.client.user.tag, iconURL: Bot.client.user.avatarURL() })
			.setColor('#2071c7')
			.setDescription('```markdown\n' + ufetch + '\n```')

		intr.editReply({ content: '', embeds: [embed] })
	}
}