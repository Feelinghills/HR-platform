import apiClient from './client';
import type { VacancyDto, CreateVacancyRequest } from '../types';

export const vacanciesApi = {
  list(activeOnly = true) {
    return apiClient.get<VacancyDto[]>('/vacancies', { params: { activeOnly } });
  },
  get(id: string) {
    return apiClient.get<VacancyDto>(`/vacancies/${id}`);
  },
  create(data: CreateVacancyRequest) {
    return apiClient.post<VacancyDto>('/vacancies', data);
  },
  update(id: string, data: CreateVacancyRequest) {
    return apiClient.put<VacancyDto>(`/vacancies/${id}`, data);
  },
};
