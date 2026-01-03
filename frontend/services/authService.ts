import { apiRoutes } from '@/config/routes';

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      username: string;
      role: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN';
      restaurantId?: string;
    };
    token: string;
  };
}

export interface LoginData {
  username: string;
  password: string;
}

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    console.log('🔑 [FRONTEND] Login attempt:', { username: data.username });
    console.log('🔑 [FRONTEND] API URL:', apiRoutes.auth.login);

    const response = await fetch(apiRoutes.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('🔑 [FRONTEND] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [FRONTEND] Login failed:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Login successful:', {
      success: result.success,
      hasToken: !!result.data?.token,
      user: result.data?.user
    });
    
    // Store token in localStorage
    if (result.success && result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      console.log('✅ [FRONTEND] Token stored in localStorage');
    } else {
      console.warn('⚠️ [FRONTEND] No token to store');
    }

    return result;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

