const users = new Map();
function addToRegistry(id, name){
    if(!users.has(name)){
        users.set(name, id)
    } else {
      console.log("User already exists in the registry")
    }
}

function deleteRegistry(id){
  for (let [key, value] of users) {
    if (value === id) {
      users.delete(key)
    }
  }
}

function getNameFromID(id){
  for (let [name, socketId] of users){
    if (id === socketId){
      return name;
    }
  }
}

module.exports = {
  users: users,
  addToRegistry: addToRegistry,
  deleteRegistry: deleteRegistry,
  getNameFromID: getNameFromID
};
