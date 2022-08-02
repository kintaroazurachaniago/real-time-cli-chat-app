const MasterFunction = require('./master-function')

class NewChat extends MasterFunction {
	constructor(req, res) {
		super()
		const filename = `./chat-data/chat-${req.body.authusername}-${req.body.targetusername}.json`
		try { this.fs.writeFileSync(filename, JSON.stringify([{id:0}])) } catch { console.log('Cannot write chat file') }
		res.end(filename)
	}
}

module.exports = (req, res) => new NewChat(req, res)