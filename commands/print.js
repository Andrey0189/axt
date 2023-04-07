export default {
	name: 'print', //or skazhi, idk what's better
	options: [{
		type: 3,
		name: 'слово',
		description: 'скажи это слово',
		required: true
	}],
	description: 'print a phase',
	run: (intr) => { intr.reply(intr.options.data[0].value) }
}