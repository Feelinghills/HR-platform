import apiClient from './client';
import type { VacancyDto, CreateVacancyRequest, UpdateVacancyRequest } from '../types';

export const vacanciesApi = {
  list(activeOnly = true, includeArchived = false) {
    return apiClient.get<VacancyDto[]>('/vacancies', { params: { activeOnly, includeArchived } });
  },
  get(id: string) {
    return apiClient.get<VacancyDto>(`/vacancies/${id}`);
  },
  create(data: CreateVacancyRequest) {
    return apiClient.post<VacancyDto>('/vacancies', data);
  },
  update(id: string, data: UpdateVacancyRequest) {
    return apiClient.put<VacancyDto>(`/vacancies/${id}`, data);
  },
  archive(id: string) {
    return apiClient.post(`/vacancies/${id}/archive`);
  },
  unarchive(id: string) {
    return apiClient.post(`/vacancies/${id}/unarchive`);
  },
  delete(id: string, reason?: string) {
    return apiClient.post(`/vacancies/${id}/delete`, { reason });
  },
  restore(id: string) {
    return apiClient.post(`/vacancies/${id}/restore`);
  },
};
