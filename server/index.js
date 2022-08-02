const http        = require('http')
const querystring = require('querystring')

class FN {
	async run(fun, req, res) {
		return require(`./functions/${fun}`)(req, res)
	}
}
const fn = new FN()

const Router = async (req, res) => {
	req.params = querystring.parse(req.url.split('?')[1])
	req.url    = req.url.split('?')[0]
	// console.log(`Method\t: ${req.method}\nURL\t: ${req.url}\nParams\t:`, req.params)
	console.log(`${req.url}@${req.method}`, req.params)
	if (req.method === 'POST') await req.on('data', data => req.body = JSON.parse(data))
	switch (req.url) {
		case '/'                 : fn.run('home', req, res); break
		case '/verify'           : fn.run('verify', req, res); break
		case '/register'         : fn.run('register', req, res); break
		case '/chat-history'     : fn.run('chat-history', req, res); break
		case '/users'            : fn.run('users', req, res); break
		case '/new-chat'         : fn.run('new-chat', req, res); break
		case '/chat'             : fn.run('chat', req, res); break
		case '/interval-checking': fn.run('interval-checking', req, res); break
		case '/clear-interval'   : fn.run('clear-interval', req, res); break
		case '/send'             : fn.run('send', req, res); break
		case '/logout'           : fn.run('logout', req, res); break
		default                  : fn.run('unregistered', req, res); break
	}
}

http.createServer(Router).listen(4120, console.log('Server running on port 4120'))