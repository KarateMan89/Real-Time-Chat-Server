const socket = io() //by default connects to same server that served the page

socket.on('serverSays', function(msgObject) {
  let message = msgObject.message
  let colour = msgObject.colour
  let msgDiv = document.createElement('div')
  msgDiv.style.color = colour
  msgDiv.textContent = message
  document.getElementById('messages').appendChild(msgDiv)
})

function sendMessage() {
  if (document.getElementById('userBox').disabled){
    let message = document.getElementById('msgBox').value.trim()
    if(message === '') return //do nothing
    if(message.includes(':')){
      let names = message.split(':')[0]
      let msg = message.split(':')[1]
      if(names.includes(',')){
        let nameList = names.split(',')
        for(let index in nameList){
          nameList[index] = nameList[index].trim()
        }
        socket.emit('groupPrivateMsg', {nameList, msg})
      } else {
        names = names.trim()
        socket.emit('privateMsg', {names, msg})
      }
    } else {
      socket.emit('clientSays', message)
    }
  }
  document.getElementById('msgBox').value = ''
}

function registerUser() {
  let userName = document.getElementById('userBox').value.trim()
  if(userName === '') return //do nothing
  
  if (validateUsername(userName)){
    socket.emit('registerUser', userName)
    document.getElementById('userBox').disabled = true
    document.getElementById('connect_user_button').disabled = true
    document.getElementById('messages').firstElementChild.style.color = "green"
    document.getElementById('messages').firstElementChild.textContent = "You are connected as " + userName
  } else {
    document.getElementById('userBox').value = ''
  }
}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

function clearScreen(){ //Cears the screen
  const container = document.querySelector('#messages');
  let child = container.lastElementChild;
  while (child != container.firstElementChild) {
    container.removeChild(container.lastChild);
    child = container.lastElementChild;
  }
}

function validateUsername(userName){
  if (!/^[a-zA-Z]+$/.test(userName.charAt(0)))
    return false
  return /^[A-Za-z0-9]*$/.test(userName)
}
