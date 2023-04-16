export default {
	name: 'random-number',
	options: [{
		type: 10,
		name: 'min',
		description: 'add this to the final result (default: 1)',
		required: false
	}, {
		type: 10,
		name: 'max',
		description: 'how much to multiply the result (default: 10)',
		required: false
	}, {
		type: 5,
		name: 'isfloat',
		description: 'do you want the result to be a floating number (default: false)',
		required: false
	}],
	description: 'Random № (by default from 0 to 100)',
	run: (intr) => {
		const min = intr.options.get('min')?.value || 1
		const max = intr.options.get('max')?.value || 10
		const isfloat = intr.options.get('isfloat')?.value

		let result = Math.random() * max + min
		if (!isfloat) result = Math.floor(result)

		intr.reply(result + '')
	}
}