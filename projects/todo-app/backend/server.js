const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let todos = [];
let nextId = 1;

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const newTodo = {
        id: nextId++,
        title: req.body.title,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex] = {
        ...todos[todoIndex],
        ...req.body,
        id: id
    };

    res.json(todos[todoIndex]);
});

app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    todos = todos.filter(todo => todo.id !== id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Todo server running at http://localhost:${port}`);
});