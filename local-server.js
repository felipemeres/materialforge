// Local development server for Material Forge
// This serves the same files that Vercel will serve in production
require('dotenv').config({ path: '.env.local' });
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

// Simple static file server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handling
  if (req.url === '/' || req.url === '/index.html') {
    serveFile(res, 'index.html', 'text/html');
  } else if (req.url === '/app.js') {
    serveFile(res, 'app.js', 'application/javascript');
  } else if (req.url === '/sketch.png') {
    serveFile(res, 'public/sketch.png', 'image/png');
  } else if (req.url === '/api/config') {
    // Serve API configuration (same as Vercel function)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
    }));
  } else if (req.url.startsWith('/public/')) {
    // Serve public files
    const filePath = req.url.substring(1); // Remove leading slash
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    serveFile(res, filePath, mimeTypes[ext] || 'application/octet-stream');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

function serveFile(res, filePath, contentType) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

server.listen(port, () => {
  console.log(`🚀 Material Forge local server running at http://localhost:${port}`);
  console.log('🎨 This serves the same files that will be deployed to Vercel');
  console.log('📁 Using separated HTML/JS/CSS files instead of embedded code');
});