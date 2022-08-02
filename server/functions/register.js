const MasterFunction = require('./master-function')

class Register extends MasterFunction {
	constructor(req, res) {
		super()
		const users     = JSON.parse(this.fs.readFileSync('./data/users.json', 'utf8'))
		const duplicate = users.filter( user => user.username === req.body.username ).shift()
		if (duplicate) return res.end(JSON.stringify({}))
		const lastUsers = users.pop()
		const newUser   = {
			id      : lastUsers.id +1,
			name    : req.body.name,
			username: req.body.username,
			password: req.body.password
		}
		users.push(lastUsers)
		users.push(newUser)
		try { this.fs.writeFileSync('./data/users.json', JSON.stringify(users)) } catch { console.log('Failed to save new user data into users.json file') }
		res.end(JSON.stringify(newUser ?? {}))
	}
}

module.exports = (req, res) => new Register(req, res)