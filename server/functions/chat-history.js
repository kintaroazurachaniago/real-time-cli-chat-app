const MasterFunction = require('./master-function')

class ChatHistory extends MasterFunction {
	constructor(req, res) {
		super()
		const auth = JSON.parse(this.fs.readFileSync('./data/users.json', 'utf8')).filter( user => user.id === parseInt(req.params.authid)).shift()
		console.log('You are entering the chat page as ', auth)
		const dirs = this.fs.readdirSync('./chat-data').filter( filename => filename.includes(auth.username))
		if (!dirs.length) return res.end(JSON.stringify(dirs))
		const targets = {}
		dirs.forEach( dir => {
			const key = dir.replace('chat', '').replace(auth.username, '').replace('.json', '').replace(/-/g, '')
			targets[key] = './chat-data/' + dir
		})
		res.end(JSON.stringify(targets))
	}
}

module.exports = (req, res) => new ChatHistory(req, res)