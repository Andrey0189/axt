import Discord from 'discord.js'
import fs from 'fs'
import conf from './config.js'
import { ChatGPTAPI } from 'chatgpt'

class Bot {
	constructor() {
		this.Discord = Discord
		this.fs = fs
		this.conf = conf
		this.ChatGPTAPI = new ChatGPTAPI({
			apiKey: process.env.OPENAI_API_KEY
		})

		this.ChatGPTMessagesID = {}

		this.commands = []
		fs.readdir('./commands', (err, files) => {
			if (err) throw err
			files.forEach(async cmdFile => {
				console.log(`Loading ${cmdFile}...`)
				const cmdobj = await import(`./commands/${cmdFile}`)
				const cmd = cmdobj.default
				this.commands.push(cmd)
			})
		})

		this.client = new Discord.Client({
			intents: [
				Discord.GatewayIntentBits.Guilds,
				Discord.GatewayIntentBits.GuildMessages,
				Discord.GatewayIntentBits.DirectMessages,
				Discord.GatewayIntentBits.MessageContent
			]
		})

		const rest = new Discord.REST({ version: '10' }).setToken(conf.TOKEN)

		this.client.once('ready', async () => {
			try {
				console.log('Refreshing slash commands')
				await rest.put(Discord.Routes.applicationCommands(this.client.user.id), { body: this.commands })
				console.log('Slash commands successfully refreshed')
			} catch (err) {
				console.log(err)
			}
			console.log(`Logged in as ${this.client.user.tag}`)
			this.client.user.setActivity('public masturbation', { type: Discord.ActivityType.Competing });
		})

		this.client.on('interactionCreate', async interaction => {
			if (!interaction.isChatInputCommand()) return

			const command = this.commands.find(c => c.name === interaction.commandName)
			if (command) {
				if (command.private && !this.conf.whitelist.find(id => id === interaction.user.id)) return await interaction.reply('You don\'t have permission to execute this command')
				command.run(interaction)
			}
		})

		this.client.login(conf.TOKEN)
	}
}

global.Bot = new Bot()