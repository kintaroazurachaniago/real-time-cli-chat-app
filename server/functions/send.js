const MasterFunction = require('./master-function')

class Send extends MasterFunction {
	constructor(req, res) {
		super()
		const chatData = JSON.parse(this.fs.readFileSync(req.body.filename, 'utf8'))
		const latestData = chatData.pop()
		const newData = { id : latestData.id + 1, sender : req.body.sender, receiver : req.body.receiver, text : req.body.text }
		chatData.push(latestData)
		chatData.push(newData)
		try { this.fs.writeFileSync(req.body.filename, JSON.stringify(chatData)) } catch { console.log('Cannot write chat file') }
		res.end(JSON.stringify(chatData))
	}
}

module.exports = (req, res) => new Send(req, res)