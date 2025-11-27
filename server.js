const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Remove query parameters from URL
    let urlPath = req.url.split('?')[0];
    
    let filePath = '.' + urlPath;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser and navigate to: http://localhost:${PORT}/`);
    console.log('\nAvailable pages:');
    console.log('- http://localhost:8080/index.html (Login)');
    console.log('- http://localhost:8080/signup.html (Signup)');
    console.log('- http://localhost:8080/forgot-password.html (Forgot Password)');
    console.log('- http://localhost:8080/admin-panel.html (Admin Panel)');
    console.log('- http://localhost:8080/superadmin.html (Superadmin Dashboard)');
    console.log('- http://localhost:8080/user-list.html (User List)');
    console.log('\nPress Ctrl+C to stop the server');
});
