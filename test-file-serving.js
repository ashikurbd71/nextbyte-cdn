const http = require('http');

// Test the file serving endpoint
const testFile = 'welcome_1755889550085_1d855e90.png';
const category = 'photos'; // Based on the file structure we saw
const url = `http://localhost:8000/api/cdn/files/${category}/${testFile}`;

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
        // Just consume the data to complete the request
    });

    res.on('end', () => {
        console.log('Request completed');
    });
});

req.on('error', (err) => {
    console.error('❌ Error:', err.message);
});

req.end();
