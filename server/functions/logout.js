const MasterFunction = require('./master-function')

class Logout extends MasterFunction {
	constructor(req, res) {
		super()
		try { this.fs.unlinkSync(`./sessions/${req.params.session}.session`) } catch { console.log('Notice! Session file not found!') }
		res.end(JSON.stringify({ loggedout : true }))
	}
}

module.exports = (req, res) => new Logout(req, res)