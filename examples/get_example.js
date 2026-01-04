/**
 * Example of using AliExpress API SDK for Node.js
 * 
 * This example demonstrates how to make a basic GET request to the AliExpress API
 */

const aliexpress = require('../index');

// Initialize client with your credentials
// Replace with your actual app key and secret
const client = new aliexpress.IopClient(
    'https://api-pre.aliexpress.com/sync',
    '33505222',
    'e1fed6b34feb26aabc391d187732af93'
);

// Create a request
// This example uses the logistics seller addresses API
const request = new aliexpress.IopRequest('aliexpress.logistics.redefining.getlogisticsselleraddresses', 'POST');
request.set_simplify();
request.add_api_param('seller_address_query', 'pickup');

// Execute the request
// Replace with your actual access token
const accessToken = '50000001a27l15rndYBjw6PrtFFHPGZfy09k1Cp1bd8597fsduP0RsNy0jhF6FL';

async function callApi() {
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
        console.error('API call failed:', error);
    }
}

callApi();
