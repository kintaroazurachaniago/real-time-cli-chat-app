const MasterFunction = require('./master-function')

class Verify extends MasterFunction {
	constructor(req, res) {
		super()
		const users = JSON.parse(this.fs.readFileSync('./data/users.json'))
		const verified = users.filter( user => user.username === req.body.username && user.password === req.body.password).shift()
		if (verified) try { this.fs.writeFileSync(`./sessions/${verified.username}.session`, '') } catch { console.log('Notice! Cannot write session file') }
		res.end(JSON.stringify(verified ?? {}))	
	}
}

module.exports = (req, res) => new Verify(req, res)