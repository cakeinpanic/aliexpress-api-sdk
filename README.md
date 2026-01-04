# AliExpress API SDK for Node.js

This is a Node.js port of the Python SDK for AliExpress API.

## Installation

```bash
npm install aliexpress-api-sdk
```

## Usage

### Basic Usage

```javascript
const aliexpress = require('aliexpress-api-sdk');

// Initialize client with your credentials
const client = new aliexpress.IopClient(
    'https://api-pre.aliexpress.com/sync',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Create a request
const request = new aliexpress.IopRequest('aliexpress.logistics.redefining.getlogisticsselleraddresses', 'POST');
request.set_simplify();
request.add_api_param('seller_address_query', 'pickup');

// Execute the request
async function callApi() {
    try {
        const response = await client.execute(request, 'YOUR_ACCESS_TOKEN');
        
        // Check response status
        console.log('Response type:', response.type);
        console.log('Response code:', response.code);
        console.log('Response message:', response.message);
        console.log('Request ID:', response.request_id);
        
        // Process response data
        console.log('Response body:', response.body);
    } catch (error) {
        console.error('API call failed:', error);
    }
}

callApi();
```

### File Upload

```javascript
const fs = require('fs');
const aliexpress = require('aliexpress-api-sdk');

// Initialize client
const client = new aliexpress.IopClient(
    'https://api.aliexpress.com/rest',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Create a request
const request = new aliexpress.IopRequest('/path/to/upload/api');
request.add_api_param('file_name', 'example.jpg');

// Add file parameter
const fileContent = fs.readFileSync('/path/to/your/file.jpg');
request.add_file_param('file_bytes', fileContent);

// Execute the request
client.execute(request, 'YOUR_ACCESS_TOKEN')
    .then(response => {
        console.log('Upload successful:', response.body);
    })
    .catch(error => {
        console.error('Upload failed:', error);
    });
```

### Debug Mode

```javascript
const aliexpress = require('aliexpress-api-sdk');

// Initialize client
const client = new aliexpress.IopClient(
    'https://api.aliexpress.com/rest',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Enable debug logging
client.log_level = aliexpress.P_LOG_LEVEL_DEBUG;

// Create and execute request as normal
// ...
```

## API Reference

### IopClient

The main client for making API requests.

```javascript
const client = new aliexpress.IopClient(serverUrl, appKey, appSecret, timeout);
```

Parameters:
- `serverUrl` (string): The API server URL
- `appKey` (string): Your application key
- `appSecret` (string): Your application secret
- `timeout` (number, optional): Request timeout in seconds (default: 30)

Methods:
- `execute(request, accessToken)`: Execute an API request

Properties:
- `log_level`: Set the logging level (P_LOG_LEVEL_DEBUG, P_LOG_LEVEL_INFO, P_LOG_LEVEL_ERROR)

### IopRequest

Class for building API requests.

```javascript
const request = new aliexpress.IopRequest(apiName, httpMethod);
```

Parameters:
- `apiName` (string): The API name or path
- `httpMethod` (string, optional): The HTTP method (GET or POST, default: POST)

Methods:
- `add_api_param(key, value)`: Add an API parameter
- `add_file_param(key, value)`: Add a file parameter
- `set_simplify()`: Set the simplify flag to true
- `set_format(value)`: Set the response format

### IopResponse

Class representing an API response.

Properties:
- `type`: Response type (nil, ISP, ISV, SYSTEM)
- `code`: Response code (0 for success)
- `message`: Response message
- `request_id`: Request ID
- `body`: Full response body

Methods:
- `toString()`: Get string representation of the response

## License

MIT
