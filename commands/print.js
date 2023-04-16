export default {
	name: 'print',
	options: [{
		type: 3,
		name: 'phrase',
		description: 'Say this phrase',
		required: true
	}],
	description: 'Print a phrase',
	run: (intr) => {
		const tosay = intr.options.get('phrase').value
		intr.reply(tosay)
	}
}