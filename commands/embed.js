import { EmbedBuilder, time } from 'discord.js'

export default {
	name: 'embed',
	options: [
		{
			type: 3,
			name: 'author-name',
			description: 'Embed title with an icon'
		},
		{
			type: 3,
			name: 'author-icon',
			description: 'URL to the icon near the title',
		},
		{
			type: 3,
			name: 'author-url',
			description: 'URL at the embed title',
		},
		{
			type: 3,
			name: 'title',
			description: 'Embed title',
		},
		{
			type: 3,
			name: 'url',
			description: 'Embed URL at the title',
		},
		{
			type: 3,
			name: 'color',
			description: 'Embed color',
		},
		{
			type: 3,
			name: 'thumbnail',
			description: 'Embed thumbnail URL',
		},
		{
			type: 3,
			name: 'desc',
			description: 'Embed description',
		},
		/*{
			type: 3,
			name: 'field-name',
			description: 'Embed field title',
		},
		{
			type: 3,
			name: 'field-value',
			description: 'Embed field text',
		},
		{
			type: 5,
			name: 'field-inline',
			description: 'Make embed field inline?',
		},*/
		{
			type: 3,
			name: 'img',
			description: 'URL to the image at the bottom of the embed',
		},
		{
			type: 3,
			name: 'footer-text',
			description: 'Embed footer text',
		},
		{
			type: 3,
			name: 'footer-icon',
			description: 'URL to the image at the embed footer',
		},
		{
			type: 5,
			name: 'timestamp',
			description: 'Set embed timestamp?',
		},
		{
			type: 4,
			name: 'custom-timestamp',
			description: 'Set custom timestamp',
		},
	],
	description: 'Create an embed',
	run: async (intr) => {
		await intr.deferReply({ ephemeral: true })
		const check = (argument) => intr.options.get(argument)?.value ?? null

		try {
			const embed = new EmbedBuilder()
				.setAuthor({ name: check('author-name'), iconURL: check('author-icon'), url: check('author-url') })
				.setTitle(check('title'))
				.setURL(check('url'))
				.setColor(check('color'))
				.setThumbnail(check('thumbnail'))
				.setDescription(check('desc'))
				// Multiple fields coming soon
				//.addFields({ name: check('field-name'), value: check('field-value'), inline: check('field-inline') })
				.setImage(check('img'))
				.setFooter({ text: check('footer-text'), iconURL: check('footer-icon') });

			const timestamp = check('custom-timestamp') ?? Date.now()
			if (check('timestamp')) embed.setTimestamp(timestamp)


			intr.channel.send({ embeds: [embed] })
			intr.editReply({ content: `Embed created successfully`, ephemeral: true })
		} catch (err) {
			console.log(err)
			intr.editReply({ content: `Embed creating failed:\n\`\`\`js\n${err}\`\`\``, ephemeral: true })
		}
	}
}