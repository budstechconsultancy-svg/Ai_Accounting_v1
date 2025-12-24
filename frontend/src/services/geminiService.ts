// Frontend Gemini Service - makes HTTP requests to backend API
// Version: 2.1 - Fixed authentication and endpoints
import type { ExtractedInvoiceData } from '../types';

// 🧾 Invoice Extraction with Retry
export const extractInvoiceDataWithRetry = async (
  file: File,
  maxRetries = 3,
  initialDelay = 5000
): Promise<ExtractedInvoiceData> => {
  const formData = new FormData();
  formData.append('file', file);

  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }


      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/ai/extract-invoice/`, {
        method: 'POST',
        headers: {
          // 'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || await response.text();
        } catch (e) {
          errorMessage = await response.text();
        }


        if (response.status === 429) {
          throw new Error(errorMessage || 'AI service is temporarily overloaded. Please try again in a few minutes.');
        } else if (response.status === 500) {
          throw new Error(errorMessage || 'Server error occurred. Please check the backend logs.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      return data as ExtractedInvoiceData;
    } catch (error: any) {
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error(`❌ Failed to extract invoice data after ${maxRetries} attempts. ${error.message}`);
      }

      // Increase delay for rate limiting
      if (error.message?.includes('429') || error.message?.includes('overloaded')) {
        delay = Math.min(delay * 3, 30000); // Max 30 seconds
      } else {
        delay = Math.min(delay * 2, 10000); // Max 10 seconds for other errors
      }
    }
  }
  throw new Error('Unexpected retry termination.');
};

// 💬 Accounting Q&A with improved error handling and queue status
export const getAgentResponse = async (
  contextData: string,
  userQuery: string
): Promise<{ reply: string; code?: string; retryAfter?: number; queuePosition?: number; estimatedWaitSeconds?: number }> => {
  try {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/api/agent/message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': token ? `Bearer ${token}` : '' // Using cookies now
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        message: userQuery,
        contextData,
        useGrounding: false
      }),
    });

    // Check if response is JSON or HTML error page
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {

        if (response.status === 401) {
          return { reply: data.error || "Please log in to use the AI assistant.", code: 'AUTH_ERROR' };
        } else if (response.status === 429) {
          if (data.code === 'RATE_LIMIT' && data.retryAfter) {
            return {
              reply: `Rate limit exceeded. Please wait ${data.retryAfter} seconds before trying again.`,
              code: 'RATE_LIMIT',
              retryAfter: data.retryAfter
            };
          } else if (data.code === 'QUEUED' && data.queuePosition) {
            return {
              reply: `Your request is queued (position ${data.queuePosition}). Estimated wait: ${data.estimatedWaitSeconds || 'unknown'} seconds.`,
              code: 'QUEUED',
              queuePosition: data.queuePosition,
              estimatedWaitSeconds: data.estimatedWaitSeconds
            };
          } else if (data.code === 'CIRCUIT_BREAKER') {
            return { reply: "AI service is temporarily unavailable. Please try again later.", code: 'CIRCUIT_BREAKER' };
          }
          return { reply: data.error || "AI service is busy. Please wait a moment and try again.", code: 'SERVICE_BUSY' };
        }

        return { reply: data.error || "Sorry, I encountered an error while processing your request.", code: 'UNKNOWN_ERROR' };
      }

      return { reply: data.reply || "I couldn't generate a response at this time." };
    } else {
      // HTML error page returned
      const text = await response.text();
      return { reply: "Server error occurred. Please check the backend logs.", code: 'SERVER_ERROR' };
    }

  } catch (err: any) {
    return { reply: "Sorry, I encountered an error while processing your request.", code: 'NETWORK_ERROR' };
  }
};

// 💬 Accounting Q&A with Web Grounding
export const getGroundedAgentResponse = async (
  userQuery: string
): Promise<{ text: string; sources: { uri: string; title: string; }[] }> => {
  try {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseUrl}/api/agent/message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message: userQuery,
        contextData: '',
        useGrounding: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        return {
          text: "Please log in to use the AI assistant.",
          sources: []
        };
      } else if (response.status === 429) {
        return {
          text: "AI service is busy. Please wait a moment and try again.",
          sources: []
        };
      }

      return {
        text: "Sorry, I encountered an error while processing your request with web search.",
        sources: []
      };
    }

    const data = await response.json();
    return {
      text: data.reply || "I couldn't generate a response at this time.",
      sources: data.sources || []
    };
  } catch (err: any) {
    return {
      text: "Sorry, I encountered an error while processing your request with web search.",
      sources: []
    };
  }
};
