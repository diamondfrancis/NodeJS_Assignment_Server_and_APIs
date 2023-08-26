const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Load data
let users = require('.users.json');
let inventory = require('./inventory.json');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

// Checking the API key
app.use((req, res, next) => {
    const apiKey = req.query.apiKey;
    const user = users.find(u => u.apiKey === apiKey);
  
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    req.user = user;
    next();
  });

//Create endpoint to admin role
if (path === '/users' && req.method === 'POST') {
    if (user.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Permission denied' }));
        return;
    }

//Create endpoint to user with a username
    const existingUser = users.find(user => user.username === query.username);
    if (existingUser) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Username already exists' }));
        return;
    }

// Create a new user
    const newUser = {
        id: uuidv4(),
        username: query.username,
        email: query.email,
        password: query.password,
        role: query.role || 'normal'
    };

    users.push(newUser);

// Update users.json
            fs.writeFileSync('./users.json', JSON.stringify(users));

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
            return;
        }

// Only normal users should be able to get inventory items
    if (path === '/items' && req.method === 'GET') {
        const userId = query.userId;
        const user = users.find(user => user.id === userId);

// Only admins can create, update, or delete items
        if (!user || user.role !== 'admin') {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Permission denied' }));
                    return;
                }

        if (!user || user.role !== 'normal') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Permission denied' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(inventory));
    }

// Create a item
    if (path === '/items' && req.method === 'POST') {

        
        const newItem = {
            id: uuidv4(),
            name: query.name,
            price: parseFloat(query.price),
            size: query.size,
        };

        inventory.push(newItem);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
    } else if (path === '/items' && req.method === 'GET') {

// Get all items
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(inventory));
    } else if (path.startsWith('/items/') && req.method === 'GET') {
        
// Get one item
        const itemId = path.substring('/items/'.length);
        const item = inventory.find(item => item.id === itemId);

        if (item) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else if (path.startsWith('/items/') && req.method === 'PUT') {

// Update item
        const itemId = path.substring('/items/'.length);
        const itemIndex = inventory.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            const updatedItem = inventory[itemIndex];
            updatedItem.name = query.name || updatedItem.name;
            updatedItem.price = parseFloat(query.price) || updatedItem.price;
            updatedItem.size = query.size || updatedItem.size;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedItem));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else if (path.startsWith('/items/') && req.method === 'DELETE') {

// Delete item
        const itemId = path.substring('/items/'.length);
        const itemIndex = inventory.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            const deletedItem = inventory.splice(itemIndex, 1)[0];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deletedItem));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});