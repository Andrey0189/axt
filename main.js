import Discord from 'discord.js'
import fs from 'fs'
import { ChatGPTAPI } from 'chatgpt'
import child_process from 'child_process'
import ms from 'ms'
import conf from './config.js'

class Bot {
	constructor() {
		this.Discord = Discord
		this.fs = fs
		this.conf = conf
		this.child_process = child_process
		this.ms = ms
		this.ChatGPTAPI = new ChatGPTAPI({
			apiKey: process.env.OPENAI_API_KEY
		})

		this.ChatGPTMessages = []

		// this.prefix = '='
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
				Discord.GatewayIntentBits.GuildMembers,
				Discord.GatewayIntentBits.GuildMessages,
				Discord.GatewayIntentBits.DirectMessages,
				Discord.GatewayIntentBits.MessageContent
			]
		})

		this.messageToTxt = (text) => new Discord.AttachmentBuilder(Buffer.from(text), { name: 'output.txt' });

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

		const commandHandler = async (writtenCommand, commandMessage) => {
			const command = this.commands.find(c => c.name === writtenCommand)
			if (command) {
				if (command.private && !this.conf.whitelist.find(id => id === commandMessage.user.id)) return await commandMessage.reply('You don\'t have permission to execute this command')
				command.run(commandMessage)
			}
		}

		this.client.on('interactionCreate', async interaction => {
			if (!interaction.isChatInputCommand()) return
			commandHandler(interaction.commandName, interaction)
		})

		// TODO: Non-slash commands
		/*this.client.on('messageCreate', async message => {
			if (message.author.bot || !message.guild || !message.content.startsWith(this.prefix)) return

			const args = message.content.slice(this.prefix.length).trim().split(/ +/g)
			const writtenCommand = args.shift()

			message.user = message.author
			message.options = {data: [{value: args[0]}]}
			message.editReply() = message.reply()
			
			commandHandler(writtenCommand, message)
		})*/

		this.client.login(conf.TOKEN)
	}
}

global.Bot = new Bot()
