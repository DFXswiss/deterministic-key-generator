#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse URL and get pathname
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html if no specific file is requested
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construct file path - check both root and src directories
    let filePath = path.join(__dirname, pathname);
    
    // If file not found in root, try src directory
    if (!fs.existsSync(filePath) && pathname === '/index.html') {
        filePath = path.join(__dirname, 'src', 'index.html');
    } else if (!fs.existsSync(filePath) && pathname.startsWith('/src/')) {
        // Already has src prefix, use as-is
    } else if (!fs.existsSync(filePath)) {
        // Try with src prefix
        const srcPath = path.join(__dirname, 'src', pathname);
        if (fs.existsSync(srcPath)) {
            filePath = srcPath;
        }
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            return;
        }
        
        // Get file extension and corresponding MIME type
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';
        
        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
                return;
            }
            
            // Set CORS headers for cross-origin requests
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            });
            
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 HTTP Server Started');
    console.log('='.repeat(60));
    console.log(`📍 Server running at: http://127.0.0.1:${PORT}`);
    console.log(`📱 Main app: http://127.0.0.1:${PORT}/index.html`);
    console.log(`🧪 Test page: http://127.0.0.1:${PORT}/test.html`);
    console.log('');
    console.log('Available test methods:');
    console.log('1. Browser Console Test:');
    console.log('   - Open http://127.0.0.1:8081/index.html');
    console.log('   - Press F12 to open console');
    console.log('   - Load browser-console-test.js and run runBrowserTest()');
    console.log('');
    console.log('2. Standalone Test Page:');
    console.log('   - Open http://127.0.0.1:8081/test.html');
    console.log('   - Click "Run All Tests" button');
    console.log('');
    console.log('3. Automated Puppeteer Test:');
    console.log('   - Run: node test-automated.js');
    console.log('');
    console.log('4. Node.js SDK Test:');
    console.log('   - Run: node test-simple-verification.js');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(60));
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
    });
});