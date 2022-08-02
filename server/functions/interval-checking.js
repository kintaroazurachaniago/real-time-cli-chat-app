const MasterFunction = require('./master-function')

class IntervalChecking extends MasterFunction {
	constructor(req, res) {
		super()
		this.fs.writeFileSync(`./sessions/interval-session-${req.params.authusername}.session`, '')
		new Promise( resolve => {
			const intervalChecking = setInterval(_ => {
				const intervalSession = this.fs.existsSync(`./sessions/interval-session-${req.params.authusername}.session`)
				const currentData = JSON.parse(this.fs.readFileSync(req.params.filename, 'utf8'))
				if (!intervalSession) {
					clearInterval(intervalChecking)
					resolve({ stopped : true })
				}
				if (currentData.length > parseInt(req.params.oldDataLength)) {
					clearInterval(intervalChecking)
					resolve(currentData)
				}
			})
		}).then(data => {
			res.end(JSON.stringify(data))
		})
	}
}

module.exports = (req, res) => new IntervalChecking(req, res)