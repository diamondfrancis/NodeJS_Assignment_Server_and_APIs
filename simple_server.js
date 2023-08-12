const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        req.url = '/index.html';
    }

    const filePath = path.join(__dirname, req.url);
    const contentType = getContentType(filePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                const errorFilePath = path.join(__dirname, '404.html');
                fs.readFile(errorFilePath, (error, errorContent) => {
                    if (error) {
                        res.writeHead(500);
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(errorContent);
                    }
                });
            } else {
                // Other error
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

function getContentType(filePath) {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        default:
            return 'application/octet-stream';
    }
}

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});