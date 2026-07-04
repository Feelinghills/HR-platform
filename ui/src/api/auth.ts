import apiClient from './client';
import type { AuthResponse, UserDto } from '../types';

export const authApi = {
  login(email: string, password: string) {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },
  me() {
    return apiClient.get<UserDto>('/auth/me');
  },
};
