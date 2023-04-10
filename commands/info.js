export default {
	name: 'info',
	description: 'Prints bot info',
	run: async (intr) => {
		const hostLatency = Date.now() - intr.createdTimestamp
		await intr.reply('Loading...')

		const child_process = await import('child_process')
		const amperfetch = child_process.execSync('./etc/sysfetch.sh')

		let botinfo = ''
		botinfo += `Servers: **\`${Bot.client.guilds.cache.size}\`**\n`
		botinfo += `Users: **\`${Bot.client.users.cache.size}\`**\n`
		botinfo += `Commands: **\`${Bot.commands.length}\`**`

		let nodeinfo = ''
		nodeinfo += `Version: **\`${process.version}\`**\n`
		nodeinfo += `RAM usage: **\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB\`**\n`
		nodeinfo += `Uptime: **\`${Bot.ms(process.uptime() * 1000)}\`**`

		const packagejson = await Bot.fs.readFileSync('./package.json')
		const obj = JSON.parse(packagejson)
		const djsversion = obj.dependencies['discord.js'].replace('^', 'v')

		let discordjsinfo = ''
		discordjsinfo += `Version: **\`${djsversion}\`**\n`
		discordjsinfo += `API latency: **\`${Bot.client.ws.ping} ms\`**\n`
		discordjsinfo += `Host latency: **\`${hostLatency} ms\`**`


		const embed = new Bot.Discord.EmbedBuilder()
			.setAuthor({ name: Bot.client.user.tag, iconURL: Bot.client.user.avatarURL() })
			.setColor('#2071c7')
			.addFields({ name: `Bot info:`, value: botinfo, inline: true })
			.addFields({ name: `NodeJS info:`, value: nodeinfo, inline: true })
			.addFields({ name: `Discord.js info:`, value: discordjsinfo, inline: true })
			.addFields({ name: 'System information:', value: '```markdown\n' + amperfetch + '\n```' })

		intr.editReply({ content: '', embeds: [embed] })
	}
}