import apiClient from './client';
import type {
  InterviewDto,
  CreateInterviewRequest,
  UpdateInterviewStatusRequest,
  DecideInterviewRequest,
  UpsertMatrixRequest,
} from '../types';

export const interviewsApi = {
  list(params?: { candidateId?: string; vacancyId?: string; status?: string; search?: string }) {
    return apiClient.get<InterviewDto[]>('/interviews', { params });
  },
  get(id: string) {
    return apiClient.get<InterviewDto>(`/interviews/${id}`);
  },
  create(data: CreateInterviewRequest) {
    return apiClient.post<InterviewDto>('/interviews', data);
  },
  updateStatus(id: string, data: UpdateInterviewStatusRequest) {
    return apiClient.patch<InterviewDto>(`/interviews/${id}/status`, data);
  },
  decide(id: string, data: DecideInterviewRequest) {
    return apiClient.post<InterviewDto>(`/interviews/${id}/decision`, data);
  },
  upsertMatrix(id: string, data: UpsertMatrixRequest) {
    return apiClient.put<InterviewDto>(`/interviews/${id}/matrix`, data);
  },
};
