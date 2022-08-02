const MasterFunction = require('./master-function')

class Chat extends MasterFunction {
	constructor(req, res) {
		super()
		try {
			const chatData = this.fs.readFileSync(req.params.filename, 'utf8')
			res.end(chatData)
		} catch (err) {
			console.log(err)
			res.end('Target not found!')
		}
	}
}

module.exports = (req, res) => new Chat(req, res)