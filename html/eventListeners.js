//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
    
    //add listener to buttons
    document.getElementById('send_button').addEventListener('click', sendMessage)
    document.getElementById('connect_user_button').addEventListener('click', registerUser)
    document.getElementById('clear_screen').addEventListener('click', clearScreen)
  
    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
  })