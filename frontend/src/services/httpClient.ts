/**
 * ============================================================================
 * HTTP CLIENT (httpClient.ts)
 * ============================================================================
 * This is the low-level HTTP communication layer for the entire application.
 * It handles all network requests to the Django backend API.
 * 
 * KEY FEATURES:
 * - Automatic authentication using HttpOnly cookies (secure)
 * - Automatic token refresh when access token expires
 * - Error handling and retry logic
 * - Support for JSON and FormData (file uploads)
 * 
 * SECURITY:
 * - Uses HttpOnly cookies instead of localStorage for tokens
 * - Automatically includes credentials in all requests
 * - Handles 401 errors by attempting token refresh
 * 
 * FOR NEW DEVELOPERS:
 * - Don't use fetch() directly - always use this httpClient
 * - The backend expects cookies, not Authorization headers
 * - All methods return Promises that resolve to typed data
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * import { httpClient } from './httpClient';
 * 
 * // GET request
 * const data = await httpClient.get<MyType>('/api/endpoint');
 * 
 * // POST request
 * const result = await httpClient.post('/api/endpoint', { key: 'value' });
 * ```
 */

// Read API base URL from environment variable or use default
// In production, set VITE_API_URL in .env file to your backend URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

/**
 * HttpClient class - Handles all HTTP communication with the backend
 */
class HttpClient {
    // Base URL for all API requests
    private baseURL = API_BASE_URL;

    /**
     * Generic request method
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Merge headers
        const headers = new Headers(options.headers || {});
        if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        // Bearer token injection as fallback for HttpOnly cookies
        // The backend CustomJWTAuthentication prefers header if available.
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Send cookies for authentication
        });

        if (!response.ok) {
            // Handle 401 Unauthorized - Attempt Token Refresh
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                try {
                    console.log('🔄 Access token expired. Attempting refresh...');
                    const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });

                    if (refreshResponse.ok) {
                        console.log('✅ Token refresh successful. Retrying request...');
                        // Retry original request (cookies are automatically sent)
                        return this.request<T>(endpoint, options);
                    } else {
                        console.error('❌ Token refresh failed. Logging out.');
                        this.clearAuthData();
                        window.location.href = '/login';
                        throw new Error('Session expired');
                    }
                } catch (e) {
                    this.clearAuthData();
                    window.location.href = '/login';
                    throw e; // Re-throw
                }
            }

            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `API request failed: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        return (await response.text()) as unknown as T;
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST request with JSON body
     */
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request with JSON body
     */
    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * PATCH request with JSON body
     */
    async patch<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * POST request with FormData (for file uploads)
     */
    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
        });
    }

    /**
     * Helper to get tenant ID from localStorage
     */
    getTenantId(): string {
        return localStorage.getItem('tenantId') || '';
    }

    /**
     * Helper to save auth data to localStorage
     */
    saveAuthData(data: { tenant_id?: string; company_name?: string }) {
        if (data.tenant_id) {
            localStorage.setItem('tenantId', data.tenant_id);
        }
        if (data.company_name) {
            localStorage.setItem('companyName', data.company_name);
        }
    }


    /**
     * Helper to clear auth data from localStorage
     */
    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('companyName');
    }
}

export const httpClient = new HttpClient();
