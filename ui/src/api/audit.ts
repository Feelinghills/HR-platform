import apiClient from './client';
import type { AuditLogDto } from '../types';

export const auditApi = {
  list(params?: { entityType?: string; entityId?: string }) {
    return apiClient.get<AuditLogDto[]>('/audit', { params });
  },
};
