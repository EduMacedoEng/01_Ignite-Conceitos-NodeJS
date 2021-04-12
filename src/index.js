const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userAlreadyExists = users.find((user) => user.username === username)

  if (!userAlreadyExists) {
    return response.status(404).json({error: "Usuário não encontrado"})
  }

  request.user = userAlreadyExists;
  return next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.find((user) => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({error: "Usuário já existe !!!"});
  }
  
  const user = {
    id: uuidv4(), 
    name, 
    username, 
    todos: []
  }
  
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const newTodos = {
    id: uuidv4(), 
    title, 
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodos);

  return response.status(201).json(newTodos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const userUpdate = user.todos.find((user) => user.id === id);

  if (!userUpdate) {
    return response.status(404).json({error: "O id informado é inválido !!!"})
  }

  userUpdate.title = title;
  userUpdate.deadline = new Date(deadline);

  return response.json(userUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const userUpdate = user.todos.find((user) => user.id === id);

  if (!userUpdate) {
    return response.status(404).json({error: "O id informado é inválido !!!"})
  }

  userUpdate.done = true;

  return response.json(userUpdate) 

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const userDelete = user.todos.findIndex((user) => user.id === id);

  if (userDelete === -1) {
    return response.status(404).json({error: "O id informado é inválido !!!"})
  }

  user.todos.splice(userDelete, 1);

  return response.status(204).json()
});

module.exports = app;