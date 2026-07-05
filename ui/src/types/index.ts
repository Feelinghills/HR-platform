export enum UserRole {
  Admin = 'Admin',
  HR = 'HR',
  DecisionMaker = 'DecisionMaker',
}

export enum InterviewStatus {
  Planned = 'Planned',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum InterviewDecision {
  Pending = 'Pending',
  Hired = 'Hired',
  Rejected = 'Rejected',
  NextStage = 'NextStage',
  TalentPool = 'TalentPool',
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CandidateDto {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string;
  desiredPosition: string;
  education: string;
  previousJob: string;
  skills: string;
  isArchived: boolean;
  createdById: string | null;
  createdAt: string;
}

export interface CreateCandidateRequest {
  fullName: string;
  phone: string;
  email: string | null;
  city: string;
  desiredPosition: string;
  education: string;
  previousJob: string;
  skills: string;
}

export interface UpdateCandidateRequest extends CreateCandidateRequest {
  isArchived: boolean;
}

export interface VacancyDto {
  id: string;
  title: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  competencyIds: string[];
}

export interface CreateVacancyRequest {
  title: string;
  description: string;
  requirements: string;
  isActive?: boolean;
  competencyIds?: string[];
}

export interface UpdateVacancyRequest {
  title: string;
  description: string;
  requirements: string;
  isActive: boolean;
  competencyIds?: string[];
}

export interface CompetencyDto {
  id: string;
  name: string;
  description: string;
  category: string;
  maxScore: number;
  isActive: boolean;
}

export interface CreateCompetencyRequest {
  name: string;
  description: string;
  category: string;
  maxScore?: number;
  isActive?: boolean;
}

export interface MatrixItemDto {
  id: string;
  competencyId: string;
  competencyName: string;
  competencyCategory: string;
  maxScore: number;
  score: number;
  comment: string | null;
  evaluatedById: string | null;
  evaluatedAt: string | null;
}

export interface MatrixScoreRequest {
  competencyId: string;
  score: number;
  comment: string | null;
}

export interface InterviewDto {
  id: string;
  candidateId: string;
  candidateName: string;
  vacancyId: string;
  vacancyTitle: string;
  interviewerId: string;
  interviewerName: string;
  plannedDate: string;
  status: InterviewStatus;
  decision: InterviewDecision;
  comments: string | null;
  createdAt: string;
  matrix: MatrixItemDto[];
}

export interface CreateInterviewRequest {
  candidateId: string;
  vacancyId: string;
  interviewerId: string;
  plannedDate: string;
  comments: string | null;
}

export interface UpdateInterviewStatusRequest {
  status: InterviewStatus;
  comments: string | null;
}

export interface DecideInterviewRequest {
  decision: InterviewDecision;
  comments: string | null;
}

export interface UpsertMatrixRequest {
  items: MatrixScoreRequest[];
}

export const statusLabels: Record<InterviewStatus, string> = {
  [InterviewStatus.Planned]: 'Запланировано',
  [InterviewStatus.Completed]: 'Завершено',
  [InterviewStatus.Cancelled]: 'Отменено',
};

export const decisionLabels: Record<InterviewDecision, string> = {
  [InterviewDecision.Pending]: 'Ожидает решения',
  [InterviewDecision.Hired]: 'Нанят',
  [InterviewDecision.Rejected]: 'Отклонён',
  [InterviewDecision.NextStage]: 'Следующий этап',
  [InterviewDecision.TalentPool]: 'Кадровый резерв',
};

export const roleLabels: Record<UserRole, string> = {
  [UserRole.Admin]: 'Администратор',
  [UserRole.HR]: 'HR-специалист',
  [UserRole.DecisionMaker]: 'Решала',
};

export const decisionColors: Record<InterviewDecision, 'default' | 'success' | 'error' | 'info' | 'warning'> = {
  Pending: 'default',
  Hired: 'success',
  Rejected: 'error',
  NextStage: 'info',
  TalentPool: 'warning',
};
