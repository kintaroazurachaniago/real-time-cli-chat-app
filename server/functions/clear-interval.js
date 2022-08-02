const MasterFunction = require('./master-function')

class ClearInterval extends MasterFunction {
	constructor(req, res) {
		super()
		this.fs.unlinkSync(`./sessions/interval-session-${req.params.authusername}.session`)
		res.end(JSON.stringify({ stopped : true }))
	}
}

module.exports = (req, res) => new ClearInterval(req, res)