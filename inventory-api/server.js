const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');

const PORT = 3000;
let inventory = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (path === '/items' && req.method === 'POST') {

// Create a item
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