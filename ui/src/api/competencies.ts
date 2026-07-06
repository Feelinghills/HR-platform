import apiClient from './client';
import type { CompetencyDto, CreateCompetencyRequest } from '../types';

export const competenciesApi = {
  list(activeOnly = true, includeArchived = false) {
    return apiClient.get<CompetencyDto[]>('/competencies', { params: { activeOnly, includeArchived } });
  },
  get(id: string) {
    return apiClient.get<CompetencyDto>(`/competencies/${id}`);
  },
  create(data: CreateCompetencyRequest) {
    return apiClient.post<CompetencyDto>('/competencies', data);
  },
  update(id: string, data: CreateCompetencyRequest) {
    return apiClient.put<CompetencyDto>(`/competencies/${id}`, data);
  },
  archive(id: string) {
    return apiClient.post(`/competencies/${id}/archive`);
  },
  unarchive(id: string) {
    return apiClient.post(`/competencies/${id}/unarchive`);
  },
  delete(id: string, reason?: string) {
    return apiClient.post(`/competencies/${id}/delete`, { reason });
  },
  restore(id: string) {
    return apiClient.post(`/competencies/${id}/restore`);
  },
};
