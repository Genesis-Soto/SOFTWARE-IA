const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkError) {
      throw new Error(
        `Network error while requesting ${endpoint}: ${
          networkError instanceof Error ? networkError.message : 'Unknown error'
        }`
      );
    }

    let data: Record<string, unknown> | null = null;
    try {
      data = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Server returned non-JSON response for ${endpoint}`
        );
      }
      throw new Error(
        `Failed to parse response from ${endpoint}: ${
          parseError instanceof Error ? parseError.message : 'Invalid JSON'
        }`
      );
    }

    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
          ? data.error
          : `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface UserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
  };
}

export const authApi = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<UserResponse>('/auth/me'),
};
