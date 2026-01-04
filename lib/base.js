/**
 * AliExpress API SDK for Node.js - Core functionality
 * 
 * This is a Node.js port of the Python SDK for AliExpress API
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');

// SDK version
const P_SDK_VERSION = "aliexpress-api-sdk-nodejs-20230701";

// Constants for request parameters
const P_APPKEY = "app_key";
const P_ACCESS_TOKEN = "session";
const P_TIMESTAMP = "timestamp";
const P_SIGN = "sign";
const P_SIGN_METHOD = "sign_method";
const P_PARTNER_ID = "partner_id";
const P_METHOD = "method";
const P_DEBUG = "debug";
const P_SIMPLIFY = "simplify";
const P_FORMAT = "format";

// Constants for response parameters
const P_CODE = 'code';
const P_TYPE = 'type';
const P_MESSAGE = 'message';
const P_REQUEST_ID = 'request_id';

// Log levels
const P_LOG_LEVEL_DEBUG = "DEBUG";
const P_LOG_LEVEL_INFO = "INFO";
const P_LOG_LEVEL_ERROR = "ERROR";

// Setup logging
const logsDir = path.join(os.homedir(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, `iopsdk.log.${new Date().toISOString().split('T')[0]}`);

/**
 * Log API errors to file
 * @param {string} appkey - The application key
 * @param {string} sdkVersion - The SDK version
 * @param {string} requestUrl - The request URL
 * @param {string} code - The error code
 * @param {string} message - The error message
 */
function logApiError(appkey, sdkVersion, requestUrl, code, message) {
    const localIp = getLocalIp();
    const platformType = `${os.type()} ${os.release()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const logMessage = `${appkey}^_^${sdkVersion}^_^${timestamp}^_^${localIp}^_^${platformType}^_^${requestUrl}^_^${code}^_^${message}\n`;
    
    fs.appendFileSync(logFilePath, logMessage);
}

/**
 * Get local IP address
 * @returns {string} - The local IP address
 */
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

/**
 * Generate signature for API request
 * @param {string} secret - The app secret
 * @param {string} api - The API name or path
 * @param {Object} parameters - The request parameters
 * @returns {string} - The signature
 */
function sign(secret, api, parameters) {
    const sortedKeys = Object.keys(parameters).sort();
    let parametersStr = '';
    
    if (api.includes('/')) {
        parametersStr = api + sortedKeys.map(key => `${key}${parameters[key]}`).join('');
    } else {
        parametersStr = sortedKeys.map(key => `${key}${parameters[key]}`).join('');
    }
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(parametersStr);
    return hmac.digest('hex').toUpperCase();
}

/**
 * Request class for AliExpress API
 */
class IopRequest {
    /**
     * Create a new request
     * @param {string} apiName - The API name or path
     * @param {string} httpMethod - The HTTP method (GET or POST)
     */
    constructor(apiName, httpMethod = 'POST') {
        this._api_params = {};
        this._file_params = {};
        this._api_name = apiName;
        this._http_method = httpMethod;
        this._simplify = "false";
        this._format = "json";
    }

    /**
     * Add API parameter
     * @param {string} key - Parameter name
     * @param {string|number} value - Parameter value
     */
    add_api_param(key, value) {
        this._api_params[key] = value;
    }

    /**
     * Add file parameter
     * @param {string} key - Parameter name
     * @param {Buffer|string} value - File content
     */
    add_file_param(key, value) {
        this._file_params[key] = value;
    }

    /**
     * Set simplify flag to true
     */
    set_simplify() {
        this._simplify = "true";
    }

    /**
     * Set response format
     * @param {string} value - Format value
     */
    set_format(value) {
        this._format = value;
    }
}

/**
 * Response class for AliExpress API
 */
class IopResponse {
    constructor() {
        this.type = null;
        this.code = null;
        this.message = null;
        this.request_id = null;
        this.body = null;
    }

    /**
     * String representation of the response
     * @returns {string} - String representation
     */
    toString() {
        return `type=${this.type} code=${this.code} message=${this.message} requestId=${this.request_id}`;
    }
}

/**
 * Client class for AliExpress API
 */
class IopClient {
    /**
     * Create a new client
     * @param {string} serverUrl - The API server URL
     * @param {string} appKey - The application key
     * @param {string} appSecret - The application secret
     * @param {number} timeout - Request timeout in seconds
     */
    constructor(serverUrl, appKey, appSecret, timeout = 30) {
        this._server_url = serverUrl;
        this._app_key = appKey;
        this._app_secret = appSecret;
        this._timeout = timeout * 1000; // Convert to milliseconds
        this.log_level = P_LOG_LEVEL_ERROR;
    }

    /**
     * Execute an API request
     * @param {IopRequest} request - The request to execute
     * @param {string} accessToken - The access token
     * @returns {Promise<IopResponse>} - The response
     */
    async execute(request, accessToken = null) {
        const sysParameters = {
            [P_APPKEY]: this._app_key,
            [P_SIGN_METHOD]: "sha256",
            [P_TIMESTAMP]: Date.now().toString(),
            [P_PARTNER_ID]: P_SDK_VERSION,
            [P_METHOD]: request._api_name,
            [P_SIMPLIFY]: request._simplify,
            [P_FORMAT]: request._format
        };

        if (this.log_level === P_LOG_LEVEL_DEBUG) {
            sysParameters[P_DEBUG] = 'true';
        }

        if (accessToken) {
            sysParameters[P_ACCESS_TOKEN] = accessToken;
        }

        const applicationParameters = request._api_params;
        const signParameters = { ...sysParameters, ...applicationParameters };
        
        signParameters[P_SIGN] = sign(this._app_secret, request._api_name, signParameters);

        const apiUrl = this._server_url;
        
        // Build full URL for logging
        let fullUrl = `${apiUrl}?`;
        for (const key in signParameters) {
            fullUrl += `${key}=${signParameters[key]}&`;
        }
        fullUrl = fullUrl.slice(0, -1);

        try {
            let response;
            
            if (request._http_method === 'POST' || Object.keys(request._file_params).length > 0) {
                if (Object.keys(request._file_params).length > 0) {
                    // Handle file uploads with FormData
                    const formData = new FormData();
                    
                    // Add all parameters to form data
                    for (const key in signParameters) {
                        formData.append(key, signParameters[key]);
                    }
                    
                    // Add file parameters
                    for (const key in request._file_params) {
                        formData.append(key, request._file_params[key]);
                    }
                    
                    response = await axios.post(apiUrl, formData, {
                        headers: formData.getHeaders(),
                        timeout: this._timeout
                    });
                } else {
                    // Regular POST request
                    response = await axios.post(apiUrl, null, {
                        params: signParameters,
                        timeout: this._timeout
                    });
                }
            } else {
                // GET request
                response = await axios.get(apiUrl, {
                    params: signParameters,
                    timeout: this._timeout
                });
            }

            const iopResponse = new IopResponse();
            const jsonObj = response.data;

            if (P_CODE in jsonObj) {
                iopResponse.code = jsonObj[P_CODE];
            }
            if (P_TYPE in jsonObj) {
                iopResponse.type = jsonObj[P_TYPE];
            }
            if (P_MESSAGE in jsonObj) {
                iopResponse.message = jsonObj[P_MESSAGE];
            }
            if (P_REQUEST_ID in jsonObj) {
                iopResponse.request_id = jsonObj[P_REQUEST_ID];
            }

            if (iopResponse.code !== null && iopResponse.code !== "0") {
                logApiError(this._app_key, P_SDK_VERSION, fullUrl, iopResponse.code, iopResponse.message);
            } else if (this.log_level === P_LOG_LEVEL_DEBUG || this.log_level === P_LOG_LEVEL_INFO) {
                logApiError(this._app_key, P_SDK_VERSION, fullUrl, "", "");
            }

            iopResponse.body = jsonObj;
            return iopResponse;
            
        } catch (err) {
            logApiError(this._app_key, P_SDK_VERSION, fullUrl, "HTTP_ERROR", err.message);
            throw err;
        }
    }
}

module.exports = {
    IopClient,
    IopRequest,
    IopResponse,
    P_LOG_LEVEL_DEBUG,
    P_LOG_LEVEL_INFO,
    P_LOG_LEVEL_ERROR
};
