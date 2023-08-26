const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.json());

// Load data
let users = require('./package.json');
let inventory = require('./package.json');

// Check the API key
app.use((req, res, next) => {
    const apiKey = req.query.apiKey;
    const user = users.find(u => u.apiKey === apiKey);
  
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
  
    req.user = user;
    next();
});

// Endpoint to add a new user
app.post('/users', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const { username, email, password, role } = req.body;

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = {
        id: uuidv4(),
        username,
        email,
        password,
        role: role || 'normal',
        apiKey: uuidv4()
    };

    users.push(newUser);
    fs.writeFileSync('./users.json', JSON.stringify(users));
    res.status(201).json(newUser);
});

// Endpoint to get inventory items
app.get('/items', (req, res) => {
    if (req.user.role !== 'normal') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    res.status(200).json(inventory);
});

// Endpoint to create a new item
app.post('/items', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const { name, price, size } = req.body;

    const newItem = {
        id: uuidv4(),
        name,
        price,
        size
    };

    inventory.push(newItem);
    fs.writeFileSync('./inventory.json', JSON.stringify(inventory));
    res.status(201).json(newItem);
});

// Endpoint to get a single item
app.get('/items/:id', (req, res) => {
    if (req.user.role !== 'normal') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const item = inventory.find(item => item.id === req.params.id);

    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Endpoint to update an item
app.put('/items/:id', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const { name, price, size } = req.body;

    const item = inventory.find(item => item.id === req.params.id);

    if (item) {
        item.name = name || item.name;
        item.price = price || item.price;
        item.size = size || item.size;
        fs.writeFileSync('./inventory.json', JSON.stringify(inventory));
        res.status(200).json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Endpoint to delete an item
app.delete('/items/:id', (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const itemIndex = inventory.findIndex(item => item.id === req.params.id);

    if (itemIndex !== -1) {
        const deletedItem = inventory.splice(itemIndex, 1)[0];
        fs.writeFileSync('./inventory.json', JSON.stringify(inventory));
        res.status(200).json(deletedItem);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});