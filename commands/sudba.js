export default {
	name: 'sudba',
	options: [{
		type: 10,
		name: 'multiplier',
		description: 'how much to multiply the result (default:101)',
		required: false
	}, {
		type: 10,
		name: 'addition',
		description: 'add this to the final result',
		required: false
	}, {
		type: 5,
		name: 'isfloat',
		description: 'do you want to have a comma in the result (default:false)',
		required: false
	}],
	description: 'Random № (by default from 0 to 100)',
	run: (intr) => {
		let a = (Math.random() * (intr.options.data[0].value == null ? 101 : intr.options.data[0].value)) + intr.options.data[1].value
		if (!intr.options.data[2].value) {
			a = Math.floor
		}
		intr.reply(a)
	}
}