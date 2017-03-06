const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path')
const { generateFromUrl, generateFromFile } = require('./services/report')

app.use(express.static('public'))
app.set('views', __dirname + '/views')
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

// const pdfPath = path.join(process.cwd(), 'test', 'single_page.pdf')
const pdfPath = path.join(process.cwd(), 'test', 'menu.pdf')

app.get('/', function (req, res) {
    res.render('index.html');
})

io.on('connection', function(client){
	console.log('connected')
  
  client.on('url', function(url){
  	console.log('url:', url)
  	// generateFromUrl(url, client).then()
  	generateFromFile(pdfPath, client).then()
  })
  
  client.on('disconnect', function(){
  	console.log('disconnected')
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, console.log(`Listening on port ${PORT}`))