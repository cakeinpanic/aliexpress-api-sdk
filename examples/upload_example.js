/**
 * Example of using AliExpress API SDK for Node.js for file uploads
 * 
 * This example demonstrates how to upload a file using the SDK
 */

const fs = require('fs');
const path = require('path');
const aliexpress = require('../index');

// Initialize client with your credentials
// Replace with your actual app key and secret
const client = new aliexpress.IopClient(
    'https://api.aliexpress.com/rest',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Create a request for file upload
// Replace with the actual API endpoint for file uploads
const request = new aliexpress.IopRequest('/xiaoxuan/mockfileupload');

// Add regular parameters
request.add_api_param('file_name', 'example.txt');

// Create a sample file to upload
const sampleFilePath = path.join(__dirname, 'example.txt');
fs.writeFileSync(sampleFilePath, 'This is a sample file for testing file uploads with the AliExpress API SDK.');

// Read the file and add it as a file parameter
const fileContent = fs.readFileSync(sampleFilePath);
request.add_file_param('file_bytes', fileContent);

// Execute the request
// Replace with your actual access token
const accessToken = 'YOUR_ACCESS_TOKEN';

async function uploadFile() {
    try {
        const response = await client.execute(request, accessToken);
        
        // Print response information
        console.log('Response type:', response.type);
        console.log('Response code:', response.code);
        console.log('Response message:', response.message);
        console.log('Request ID:', response.request_id);
        
        // Print full response body
        console.log('Response body:', JSON.stringify(response.body, null, 2));
    } catch (error) {
        console.error('File upload failed:', error);
    } finally {
        // Clean up the sample file
        if (fs.existsSync(sampleFilePath)) {
            fs.unlinkSync(sampleFilePath);
            console.log('Sample file cleaned up');
        }
    }
}

uploadFile();

console.log('Note: This example creates a temporary file for demonstration purposes.');
console.log('In a real application, you would use your actual files.');
