const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

//require userMap.js
const {users, addToRegistry, deleteRegistry, getNameFromID } = require('./userMap.js');

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css', 
  'gif': 'image/gif', 
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }                                         
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })
}

//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  socket.emit('serverSays', {message : 'Register to connect to CHAT SERVER', colour : "red"})

  socket.on('clientSays', function(data) {
    console.log('RECEIVED: ' + data)
    let name = getNameFromID(socket.id)
    let colour;
    for(let socketId of users.values()){
      if(socketId === socket.id){
        colour = "blue"
      } else {
        colour = "black"
      }
      io.to(socketId).emit('serverSays', {message : name + ": " + data, colour : colour})
    }
  })

  socket.on('registerUser', function(name) {
    addToRegistry(socket.id, name)
    for(let socketId of users.values()){
      io.to(socketId).emit('serverSays', {message : name + " has joined the chat.", colour : "black"})
    }
  })

  socket.on('privateMsg', function(data) {
    let name = data.names
    let msg = data.msg
    let senderName = getNameFromID(socket.id)

    if(users.has(name)){
      let socketId = users.get(name)
      io.to(socketId).emit('serverSays', {message : senderName + ": " + msg, colour : "red"})
    }
    io.to(socket.id).emit('serverSays', {message : senderName + ": " + msg, colour : "blue"})
  })

  socket.on('groupPrivateMsg', function(data){
    let names = data.nameList
    let msg = data.msg
    let senderName = getNameFromID(socket.id)
    for(let name of names){
      if(users.has(name)){
        let socketId = users.get(name)
        io.to(socketId).emit('serverSays', {message : senderName + ": " + msg, colour : "red"})
      }
    }
    io.to(socket.id).emit('serverSays', {message : senderName + ": " + msg, colour : "blue"})
  })

  socket.on('disconnect', function() {
    //event emitted when a client disconnects
    console.log('client disconnected')
    //delete user from registry
    deleteRegistry(socket.id)
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
