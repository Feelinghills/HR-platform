import apiClient from './client';
import type { CompetencyDto, CreateCompetencyRequest } from '../types';

export const competenciesApi = {
  list(activeOnly = true) {
    return apiClient.get<CompetencyDto[]>('/competencies', { params: { activeOnly } });
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
};
