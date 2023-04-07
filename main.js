import Discord from 'discord.js'
import fs from 'fs'
import conf from './config.js'

const commands = []
fs.readdir('./commands', (err, files) => {
	if (err) throw err
	files.forEach(async cmdFile => {
		console.log(`Loading ${cmdFile}...`)
		const cmdobj = await import(`./commands/${cmdFile}`)
		const cmd = cmdobj.default
		commands.push(cmd)
	})
})

const rest = new Discord.REST({ version: '10' }).setToken(conf.TOKEN)

const commandHandler = async () => {
	try {
		console.log('Refreshing slash commands')
		await rest.put(Discord.Routes.applicationCommands(conf.ID), { body: commands })
		console.log('Slash commands successfully refreshed')
	} catch (err) {
		console.log(err)
	}
}

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.MessageContent
	]
})

client.once('ready', async () => {
	await commandHandler()
	console.log(`Logged in as ${client.user.tag}`)
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return

	const command = commands.find(c => c.name === interaction.commandName)
	if (command) {
		if (command.private && !conf.whitelist.find(id => id === interaction.user.id)) return await interaction.reply('You don\'t have permission to execute this command')
		command.run(interaction)
	}
})

client.login(conf.TOKEN)
