# AliExpress API SDK for Node.js

[![npm version](https://img.shields.io/npm/v/aliexpress-api-sdk.svg)](https://www.npmjs.com/package/aliexpress-api-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Node.js SDK for the AliExpress API, making it easy to integrate with AliExpress services in your JavaScript applications.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [File Upload](#file-upload)
  - [Debug Mode](#debug-mode)
- [API Reference](#api-reference)
  - [IopClient](#iopclient)
  - [IopRequest](#ioprequest)
  - [IopResponse](#iopresponse)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

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

## Examples

### Getting Product Information

```javascript
const aliexpress = require('aliexpress-api-sdk');

// Initialize client
const client = new aliexpress.IopClient(
    'https://api.aliexpress.com/rest',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Create a request to get product details
const request = new aliexpress.IopRequest('aliexpress.ds.product.get');
request.add_api_param('product_id', '1000001234567');

// Execute the request
async function getProductDetails() {
    try {
        const response = await client.execute(request, 'YOUR_ACCESS_TOKEN');

        if (response.code === "0") {
            console.log('Product details:', response.body.aliexpress_ds_product_get_response.result);
        } else {
            console.error('Error:', response.message);
        }
    } catch (error) {
        console.error('API call failed:', error);
    }
}

getProductDetails();
```

### Searching for Products

```javascript
const aliexpress = require('aliexpress-api-sdk');

// Initialize client
const client = new aliexpress.IopClient(
    'https://api.aliexpress.com/rest',
    'YOUR_APP_KEY',
    'YOUR_APP_SECRET'
);

// Create a request to search for products
const request = new aliexpress.IopRequest('aliexpress.ds.product.search');
request.add_api_param('keywords', 'smartphone');
request.add_api_param('page_size', 20);
request.add_api_param('page_no', 1);

// Execute the request
async function searchProducts() {
    try {
        const response = await client.execute(request, 'YOUR_ACCESS_TOKEN');

        if (response.code === "0") {
            const products = response.body.aliexpress_ds_product_search_response.result.products;
            console.log(`Found ${products.length} products`);
            products.forEach(product => {
                console.log(`- ${product.product_title} (${product.product_id})`);
            });
        } else {
            console.error('Error:', response.message);
        }
    } catch (error) {
        console.error('API call failed:', error);
    }
}

searchProducts();
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository** - Fork the project on GitHub.

2. **Clone your fork** - Clone your fork to your local machine:
   ```bash
   git clone https://github.com/your-username/aliexpress-api-sdk.git
   cd aliexpress-api-sdk
   ```

3. **Create a branch** - Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** - Implement your feature or fix the bug and commit your changes:
   ```bash
   git commit -m "Add feature or fix bug"
   ```

5. **Push your changes** - Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** - Go to the original repository and create a pull request from your branch.

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation for any changes
- Make sure all tests pass before submitting a pull request

## License

MIT
