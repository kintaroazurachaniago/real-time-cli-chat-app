const MasterFunction = require('./master-function')

class User extends MasterFunction {
	constructor(req, res) {
		super()
		const users = this.fs.readFileSync('./data/users.json', 'utf8')
		res.end(users)
	}
}

module.exports = (req, res) => new User(req, res)