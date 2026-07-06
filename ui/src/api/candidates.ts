import apiClient from './client';
import type { CandidateDto, CreateCandidateRequest, UpdateCandidateRequest } from '../types';

export const candidatesApi = {
  list(search?: string, includeArchived = false) {
    return apiClient.get<CandidateDto[]>('/candidates', {
      params: { search, includeArchived },
    });
  },
  get(id: string) {
    return apiClient.get<CandidateDto>(`/candidates/${id}`);
  },
  create(data: CreateCandidateRequest) {
    return apiClient.post<CandidateDto>('/candidates', data);
  },
  update(id: string, data: UpdateCandidateRequest) {
    return apiClient.put<CandidateDto>(`/candidates/${id}`, data);
  },
  archive(id: string) {
    return apiClient.post(`/candidates/${id}/archive`);
  },
  unarchive(id: string) {
    return apiClient.post(`/candidates/${id}/unarchive`);
  },
  delete(id: string, reason?: string) {
    return apiClient.post(`/candidates/${id}/delete`, { reason });
  },
  restore(id: string) {
    return apiClient.post(`/candidates/${id}/restore`);
  },
};
