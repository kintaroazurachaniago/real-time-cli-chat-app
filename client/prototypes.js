const Color = {
	green : '\x1b[32m',
	blue : '\x1b[34m',
	yellow : '\x1b[33m',
	white : '\x1b[37m'
}

class Align {

	text = ''

	constructor(data, delimiter=' : ') {
		this.defaultDelimiter = delimiter
		this.delimiter = delimiter
		this.text = Array.isArray(data) ? this.findMaxArray(data, delimiter) : this.findMax(data, 0, delimiter).trim()
	}

	findMax(data, space=0, delimiter=' : ') {
		const keys = Object.keys(data)
		let max = { key : 0, val : 0 }
		keys.forEach( key => {
			if (key.length > max.key) max.key = key.length
			if (data[key].length > max.val) max.val = data[key].length
		})
		let tab = ''
		for (let x = 0; x < space + this.delimiter.length; x++) tab += ' '
		return this.parseString(data, max, tab)
	}

	parseString(data, max, tab) {
		const keys = Object.keys(data)
		let text = ''
		keys.forEach( (key, x) => {
			if (typeof data[key] === 'object') this.delimiter = ' > '
			else this.delimiter = this.defaultDelimiter

			let coloredKey = parseInt(key) || key === '0'
			? Color.yellow + key + Color.white
			: Color.white + key + Color.white

			let keySpace = ''
			for (let x = 0; x < max.key - key.length; x++) keySpace += ' '

			const value = typeof data[key] === 'object' ? this.findMax(data[key], max.key + tab.length).trim() : data[key]
			let coloredValue = parseInt(value) /* if type of value is number */
			? this.delimiter + Color.yellow + value.toString() + Color.white
			: typeof data[key] === 'function' /* if type of value is function */
			? this.delimiter + Color.blue + value + Color.white
			: typeof value === 'string' /* if type of value is string */
			? this.delimiter + Color.green + value + Color.white
			: this.delimiter + Color.white + value + Color.white

			text += (x !== 0 ? tab.slice(this.delimiter.length) : '') + coloredKey + keySpace + coloredValue + '\n'
		})
		return text.trim()
	}

	findMaxArray(data) {
		const properties = this.findHead(data)

		/* head */
		const head = [{}]
		properties.forEach( h => {
			head[0][h] = h.toUpperCase()
		})
		data = head.concat(data)

		/* max */
		const max = {}
		data.forEach( d => {
			properties.forEach( h => {
				max[h] = d[h]?.toString().length > (max[h] ? max[h] : 0) ? d[h].toString().length : (max[h] ? max[h] : 0)
			})
		})

		/* space */
		const parsed = {}
		properties.forEach( h => {
			const grouped = []
			data.forEach( d => {
				let text = d[h] ? d[h] : ''
				if (d[h]) {
					for (let x = 0; x < max[h] - d[h]?.toString().length; x++) text += ' '
				} else {
					for (let x = 0; x < max[h]; x++) text += ' '
				}
				d[h] = text
				grouped.push(d[h])
			})
			parsed[h] = grouped
		})

		let result = ''
		for (let x = 0; x < data.length; x++) {
			let text = `| `
			properties.forEach( h => {
				if (typeof parsed[h][x] === 'function') text += Color.blue + parsed[h][x] + Color.white + this.delimiter
				else if (typeof parsed[h][x] === 'number' || (typeof parsed[h][x] === 'string' && parseInt(parsed[h][x].trim()))) text += Color.yellow + parsed[h][x] + Color.white + this.delimiter
				else if (typeof parsed[h][x] === 'string') text += Color.green + parsed[h][x] + Color.white + this.delimiter
				else text += Color.white + JSON.stringify(parsed[h][x]).slice(0, 12) + '...' + Color.white + this.delimiter
			})
			let line = ''
			for (let y = 0; y < text.length - 1 - (10 * properties.length); y++) line += '-'

			if (x === 0) result += line + '\n' + text + '\n' + line
			else if (x === data.length - 1) result += '\n' + text + '\n' + line
			else result += '\n' + text
		}
		return result
	}

	findHead(data) {
		const heads = []
		data.forEach( d => {
			Object.keys(d).forEach( dk => !heads.includes(dk) ? heads.push(dk) : false )
		})
		return heads
	}

}

Object.prototype.prettify = function (data, delimiter) { return new Align(data, delimiter).text }

module.exports = Object