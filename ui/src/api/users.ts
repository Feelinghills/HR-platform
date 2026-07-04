import apiClient from './client';
import type { UserDto } from '../types';

interface RegisterUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export const usersApi = {
  list() {
    return apiClient.get<UserDto[]>('/users');
  },
  create(data: RegisterUserRequest) {
    return apiClient.post<UserDto>('/users', data);
  },
  setStatus(id: string, isActive: boolean) {
    return apiClient.patch<UserDto>(`/users/${id}/status`, { isActive });
  },
};
