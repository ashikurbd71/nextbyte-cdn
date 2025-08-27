const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8001;

// Serve static files from uploads directory
app.use('/api/cdn/files', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        // Set appropriate headers for different file types
        const ext = path.extname(filePath).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
            res.setHeader('Content-Type', `image/${ext.slice(1)}`);
        } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(ext)) {
            res.setHeader('Content-Type', `video/${ext.slice(1)}`);
        } else if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Test server is running' });
});

app.listen(port, () => {
    console.log(`Test server running on http://localhost:${port}`);
    console.log(`Files served at: http://localhost:${port}/api/cdn/files/`);
});

// Test the file serving
setTimeout(() => {
    const http = require('http');
    const testFile = 'welcome_1755889550085_1d855e90.png';
    const url = `http://localhost:${port}/api/cdn/files/photos/${testFile}`;

    console.log(`Testing file serving for: ${url}`);

    const req = http.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        if (res.statusCode === 200) {
            console.log('✅ File serving is working correctly!');
        } else {
            console.log('❌ File serving is not working correctly');
        }

        res.on('data', (chunk) => {
            // Just consume the data
        });

        res.on('end', () => {
            console.log('Request completed');
            process.exit(0);
        });
    });

    req.on('error', (err) => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });

    req.end();
}, 2000);
