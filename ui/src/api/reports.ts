import apiClient from './client';

export const reportsApi = {
  candidateCard(candidateId: string) {
    return apiClient.get(`/reports/candidates/${candidateId}/card`, { responseType: 'blob' });
  },
  interviewProtocol(interviewId: string) {
    return apiClient.get(`/reports/interviews/${interviewId}/protocol`, { responseType: 'blob' });
  },
  decisionLetter(interviewId: string) {
    return apiClient.get(`/reports/interviews/${interviewId}/decision-letter`, { responseType: 'blob' });
  },
};
