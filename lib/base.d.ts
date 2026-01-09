/**
 * Type definitions for AliExpress API SDK for Node.js - Core functionality
 */

/**
 * Log levels for the SDK
 */
export const P_LOG_LEVEL_DEBUG: string;
export const P_LOG_LEVEL_INFO: string;
export const P_LOG_LEVEL_ERROR: string;

/**
 * Request class for AliExpress API
 */
export class IopRequest {
    /**
     * Create a new request
     * @param apiName - The API name or path
     * @param httpMethod - The HTTP method (GET or POST)
     */
    constructor(apiName: string, httpMethod?: string);

    /**
     * Add API parameter
     * @param key - Parameter name
     * @param value - Parameter value
     */
    add_api_param(key: string, value: string | number): void;

    /**
     * Add file parameter
     * @param key - Parameter name
     * @param value - File content
     */
    add_file_param(key: string, value: Buffer | string): void;

    /**
     * Set simplify flag to true
     */
    set_simplify(): void;

    /**
     * Set response format
     * @param value - Format value
     */
    set_format(value: string): void;

    /** @internal */
    _api_params: Record<string, string | number>;
    /** @internal */
    _file_params: Record<string, Buffer | string>;
    /** @internal */
    _api_name: string;
    /** @internal */
    _http_method: string;
    /** @internal */
    _simplify: string;
    /** @internal */
    _format: string;
}

/**
 * Response class for AliExpress API
 */
export class IopResponse {
    constructor();

    /**
     * String representation of the response
     */
    toString(): string;

    /** Response type (nil, ISP, ISV, SYSTEM) */
    type: string | null;
    /** Response code (0 for success) */
    code: string | null;
    /** Response message */
    message: string | null;
    /** Request ID */
    request_id: string | null;
    /** Full response body */
    body: any;
}

/**
 * Client class for AliExpress API
 */
export class IopClient {
    /**
     * Create a new client
     * @param serverUrl - The API server URL
     * @param appKey - The application key
     * @param appSecret - The application secret
     * @param timeout - Request timeout in seconds
     */
    constructor(serverUrl: string, appKey: string, appSecret: string, timeout?: number);

    /**
     * Execute an API request
     * @param request - The request to execute
     * @param accessToken - The access token
     * @returns The response
     */
    execute(request: IopRequest, accessToken?: string | null): Promise<IopResponse>;

    /** Log level for the client */
    log_level: string;

    /** @internal */
    _server_url: string;
    /** @internal */
    _app_key: string;
    /** @internal */
    _app_secret: string;
    /** @internal */
    _timeout: number;
}
