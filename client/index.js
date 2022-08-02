const http         = require('http')
const fs           = require('fs')
const querystring  = require('querystring')
const { execSync } = require('child_process')
const readline     = require('readline')
const input        = readline.createInterface({
	input : process.stdin,
	output: process.stdout
})
const Object = require('./prototypes')

class Server {

	option = {
		hostname: undefined,
		port    : undefined,
		path    : undefined,
		method  : undefined,
	}

	constructor(hostname, port) {
		this.option.hostname = hostname
		this.option.port     = port
	}

	get(url) {
		this.option.path   = url
		this.option.method = 'GET'
		return new Promise( resolve => {
			const request = http.request(this.option, response => {
				response.on('data', chunk => resolve(chunk.toString()))
			})
			request.on('error', err => console.log(err))
			request.end()
		})
	}

	post(url, data) {
		this.option.path    = url
		this.option.method  = 'POST'
		this.option.headers = { 'Content-Type' : 'application/json' }
		return new Promise( resolve => {
			const request = http.request(this.option, response => {
				response.on('data', chunk => resolve(chunk.toString()))
			})
			request.on('error', err => console.log(err))
			request.write(JSON.stringify(data))
			request.end()
		})
	}

}
const server = new Server('localhost', 4120)

/* Client class */
class Client {

	width = process.stdout.columns
	answer = {}

	/* Showing header display */
	header(text) {
		execSync('cls')
		console.clear()
		let line = '', space = ''
		for (let x = 0; x < this.width; x++) line += '-'
		for (let x = 0; x < this.width/2 - text.length/2; x++) space += ' '
		console.log(line + '\n' + space + text + '\n' + line)
	}

	alert(text) {
		console.log(text)
		for (let x = 0; x < this.width; x++) process.stdout.write('-')
		console.log()
	}

	guest(answer) {
		this.header('Tamu')
		if (answer && answer.toLowerCase() === 'login') this.login()
		else if (answer && answer.toLowerCase() === 'register') this.register()
		else this.alert('Saat ini kamu tamu.\nKamu bisa pake kata kunci "login" atau "register" buat ngelanjutin')
		this.ask('guest')
	}

	login(username, message) {
		if (!username) {
			this.answer = {}
			this.header('Login')
			this.alert('Paparkan identitas kamu pada form berikut')
		}
		if (username === '') return this.guest()
		if (message) this.alert(message)
		if (this.answer.username && this.answer.password) return this.verify()
		const keys = username ? 'password' : 'username'
		this.ask('login', `${keys} : `, keys)
	}

	async verify() {
		const user = JSON.parse(await server.post(`/verify`, { username : this.answer.username, password : this.answer.password }))
		if (user.id) try { fs.writeFileSync('./authenticated.json', JSON.stringify(user)) } catch { console.log('Cannot write the authenticated.json file')}
		return user.id
		? this.home(user.id)
		: this.login(undefined, `Wah gagal masuk! kaya nya username "${this.answer.username}" sama "${this.answer.password}" ini belum terdaftar. coba ulang`)
	}

	register(answer, message) {
		if (!answer) {
			this.answer = {}
			this.header('Register')
			this.alert('Paparkan identitas kamu pada form berikut')
		}
		if (message) this.alert(message)
		if (answer === '') return this.guest()
		if (this.answer.name && this.answer.username && this.answer.password) return this.newUser()
		const keys = !this.answer.name ? 'name' : (!this.answer.username ? 'username' : 'password')
		this.ask('register', `${keys} : `, keys)
	}

	async newUser() {
		const registered = JSON.parse(await server.post('/register', { name : this.answer.name, username : this.answer.username, password : this.answer.password }))
		if (registered.id) try { fs.writeFileSync('./authenticated.json', JSON.stringify(registered)) } catch { console.log('Cannot write the authenticated.json file') }
		return registered.id
		? this.home(registered.id)
		: this.register(undefined, `Udah ada yang pake username "${this.answer.username}", coba ganti username yang lain`)
	}

	/* Asking a question to the users */
	ask(questioner, question='>>> ', keys) {
		input.question(question, answer => {
			client.answer[keys || questioner] = answer.replace(/'/g, '\\\'')
			eval(`this.${questioner}('${answer.replace(/'/g, '\\\'')}')`)
		})
	}

	async home(answer/* can be auth id */) {
		this.auth = JSON.parse(fs.readFileSync('./authenticated.json', 'utf8'))
		if (answer === 'chat') return this.chat()
		if (answer === 'profile') return this.profile()
		if (answer === 'setting') return this.setting()
		if (answer === 'logout') return this.logout(answer)
		this.header('Beranda')
		const commands = ['chat', 'profile', 'setting', 'logout']
		const lastCommands = commands.pop()
		this.alert(`Halo, ${this.auth.username}! Selamat datang di beranda :)`)
		this.alert('Ada beberapa perintah yang bisa kamu pake di halaman ini kek :\n"' + commands.join('", "') + '" sama "' + lastCommands + '". cobain dah :)')
		this.ask('home')
	}

	async chat(targetUsername) {
		const targets = JSON.parse(await server.get(`/chat-history?authid=${this.auth.id}`))

		if (Object.keys(targets).includes(targetUsername)) return this.startChat(targetUsername, targets[targetUsername]/* chat data filename */)
		if (targetUsername === '::') return this.newChat()
		if (targetUsername === '') return this.home()

		this.header('Chat')

		if (Object.keys(targets).length > 0) this.alert('Nah, ini beberapa pengguna yang bisa kamu chat')
		else this.alert('Wah, kamu belum pernah chatting sama siapapun nih. coba pake perintah ini "::"')

		console.log(Object.prettify(targets))
		this.ask('chat')
	}

	async newChat(selected, message) {
		this.header('New chat')
		const users = JSON.parse(await server.get('/users'))

		const target = users.filter( user => user.username === selected && user.username !== this.auth.username ).shift()
		if (target) return this.createChat(target.username)

		if (selected === '') return this.chat()
		if (selected === this.auth.username) return this.newChat(undefined, `Kamu ga bisa chatting sama kamu sendiri :(`)

		if (message) this.alert(message)
		console.log('Ini beberapa pengguna tersedia')
		console.log(Object.prettify(users.filter( user => user.id !== this.auth.id)))
		this.ask('newChat')
	}

	async createChat(targetUsername) {
		const filename = await server.post('/new-chat', { authusername : this.auth.username, targetusername : targetUsername })
		if (filename) return this.startChat(targetUsername, filename)
	}

	async startChat(targetUsername, filename, updatedData) {
		this.header(targetUsername)
		const chatData = updatedData ? updatedData : JSON.parse(await server.get(`/chat?filename=${filename}`))
		if (chatData.length === 1) this.alert(`Katakan peta kepada ${targetUsername}`)
		else chatData.slice(1).forEach( chat => {
			console.log((chat.sender === this.auth.username ? '+| ' : '-| ') + chat.text)
		})
		this.writeText(targetUsername, filename)
		const incomingMessage = await server.get(`/interval-checking?authusername=${this.auth.username}&filename=${filename}&oldDataLength=${chatData.length}`)
		if (!JSON.parse(incomingMessage).stopped) return this.startChat(targetUsername, filename)
	}

	writeText(targetUsername, filename, question='>>> ') {
		input.question(question, async answer => {
			if (answer === '') {
				await server.get(`/clear-interval?authusername=${this.auth.username}`)
				return this.chat()
			}
			const updatedData = JSON.parse(await server.post('/send', { sender : this.auth.username, receiver : targetUsername, filename, text : answer }))
		})
	}

	profile(answer) {
		if (answer === '' || answer === 'ok') return this.home()
		this.header('Profile')
		const auth = JSON.parse(fs.readFileSync('./authenticated.json', 'utf8'))
		console.log(Object.prettify(auth))
		this.ask('profile')
	}

	setting(answer) {
		if (answer === '' || answer === 'ok') return this.home()
		this.header('Setting')
		this.alert('Maaf, menu setting nya lgi di maintenance. jadi belum bisa dipake :( ok?')
		this.ask('setting')
	}

	async logout(answer) {
		const loggedout = JSON.parse(await server.get(`/logout?session=${this.auth.username}`)).loggedout
		console.log(loggedout)
		if (loggedout) {
			fs.unlinkSync('./authenticated.json')
			return start()
		}
	}

}
const client = new Client

async function start() {
	if (!fs.existsSync('./authenticated.json')) return client.guest()
	const auth = JSON.parse(fs.readFileSync('./authenticated.json', 'utf8'))
	client.home(auth.id)
}

start()