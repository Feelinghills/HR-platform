const AUTH_API = '/api';
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiFetch(path, options = {}, baseUrl = API_BASE) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Сессия истекла. Войдите снова.');
  }

  if (!res.ok) {
    let detail = 'Ошибка сервера';
    try {
      const body = await res.json();
      detail = body.detail || body.title || detail;
    } catch {}
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, AUTH_API),

  me: () => apiFetch('/auth/me', {}, AUTH_API),

  // Candidates
  getCandidates: (search, includeArchived) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (includeArchived) params.set('includeArchived', 'true');
    return apiFetch(`/candidates?${params}`);
  },
  createCandidate: (data) =>
    apiFetch('/candidates', { method: 'POST', body: JSON.stringify(data) }),
  updateCandidate: (id, data) =>
    apiFetch(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveCandidate: (id) =>
    apiFetch(`/candidates/${id}/archive`, { method: 'POST' }),
  unarchiveCandidate: (id) =>
    apiFetch(`/candidates/${id}/unarchive`, { method: 'POST' }),
  deleteCandidate: (id, reason) =>
    apiFetch(`/candidates/${id}/delete`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || null }),
    }),

  // Vacancies
  getVacancies: (activeOnly, includeArchived) => {
    const params = new URLSearchParams();
    if (activeOnly !== undefined) params.set('activeOnly', activeOnly);
    if (includeArchived) params.set('includeArchived', 'true');
    return apiFetch(`/vacancies?${params}`);
  },
  createVacancy: (data) =>
    apiFetch('/vacancies', { method: 'POST', body: JSON.stringify(data) }),
  updateVacancy: (id, data) =>
    apiFetch(`/vacancies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveVacancy: (id) =>
    apiFetch(`/vacancies/${id}/archive`, { method: 'POST' }),
  unarchiveVacancy: (id) =>
    apiFetch(`/vacancies/${id}/unarchive`, { method: 'POST' }),
  deleteVacancy: (id, reason) =>
    apiFetch(`/vacancies/${id}/delete`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || null }),
    }),

  // Competencies
  getCompetencies: (activeOnly, includeArchived) => {
    const params = new URLSearchParams();
    if (activeOnly !== undefined) params.set('activeOnly', activeOnly);
    if (includeArchived) params.set('includeArchived', 'true');
    return apiFetch(`/competencies?${params}`);
  },
  createCompetency: (data) =>
    apiFetch('/competencies', { method: 'POST', body: JSON.stringify(data) }),
  updateCompetency: (id, data) =>
    apiFetch(`/competencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveCompetency: (id) =>
    apiFetch(`/competencies/${id}/archive`, { method: 'POST' }),
  unarchiveCompetency: (id) =>
    apiFetch(`/competencies/${id}/unarchive`, { method: 'POST' }),
  deleteCompetency: (id, reason) =>
    apiFetch(`/competencies/${id}/delete`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || null }),
    }),

  // Interviews
  getInterviews: (params = {}) => {
    const q = new URLSearchParams();
    if (params.candidateId) q.set('candidateId', params.candidateId);
    if (params.vacancyId) q.set('vacancyId', params.vacancyId);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    return apiFetch(`/interviews?${q}`);
  },
  createInterview: (data) =>
    apiFetch('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  updateInterviewStatus: (id, data) =>
    apiFetch(`/interviews/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  upsertMatrix: (id, data) =>
    apiFetch(`/interviews/${id}/matrix`, { method: 'PUT', body: JSON.stringify(data) }),
  decideInterview: (id, data) =>
    apiFetch(`/interviews/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),
  archiveInterview: (id) =>
    apiFetch(`/interviews/${id}/archive`, { method: 'POST' }),
  unarchiveInterview: (id) =>
    apiFetch(`/interviews/${id}/unarchive`, { method: 'POST' }),

  // Users (Go auth-service)
  getUsers: () => apiFetch('/users', {}, AUTH_API),
  createUser: (data) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }, AUTH_API),
  updateUser: (id, data) =>
    apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, AUTH_API),
  setUserStatus: (id, isActive) =>
    apiFetch(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }, AUTH_API),
  deleteUser: (id, reason) =>
    apiFetch(`/users/${id}/delete`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || null }),
    }, AUTH_API),
  restoreUser: (id) =>
    apiFetch(`/users/${id}/restore`, { method: 'POST' }, AUTH_API),

  // Audit
  getAudit: (entityType, entityId) => {
    const params = new URLSearchParams();
    if (entityType) params.set('entityType', entityType);
    if (entityId) params.set('entityId', entityId);
    return apiFetch(`/audit?${params}`);
  },

  // Reports (PDF download)
  downloadCandidateCard: (candidateId) => {
    const token = getToken();
    return fetch(`${API_BASE}/reports/candidates/${candidateId}/card`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  downloadInterviewProtocol: (interviewId) => {
    const token = getToken();
    return fetch(`${API_BASE}/reports/interviews/${interviewId}/protocol`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  downloadDecisionLetter: (interviewId) => {
    const token = getToken();
    return fetch(`${API_BASE}/reports/interviews/${interviewId}/decision-letter`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// --- Маппинг бэкенд → фронтенд ---

const statusLabels = {
  Planned: 'Запланировано',
  Completed: 'Проведено',
  Cancelled: 'Отменено',
};

const decisionLabels = {
  Pending: 'Ожидает',
  Hired: 'Принят',
  Rejected: 'Отказан',
  NextStage: 'Следующий этап',
  TalentPool: 'Кадровый резерв',
};

const statusValues = { 'Запланировано': 'Planned', 'Проведено': 'Completed', 'Отменено': 'Cancelled' };
const decisionValues = { 'Принят': 'Hired', 'Отказан': 'Rejected', 'Ожидает': 'Pending', 'Следующий этап': 'NextStage', 'Кадровый резерв': 'TalentPool' };

const roleLabels = { Admin: 'admin', HR: 'hr', DecisionMaker: 'reshala' };
const roleLabelsRu = { Admin: 'Администратор', HR: 'HR', DecisionMaker: 'Согласующий' };
const roleValues = { admin: 'Admin', hr: 'HR', reshala: 'DecisionMaker' };

export function mapCandidateFromApi(dto) {
  return {
    id: dto.id,
    name: dto.fullName,
    phone: dto.phone,
    email: dto.email || '',
    city: dto.city,
    vacancy: dto.desiredPosition,
    education: dto.education,
    previousJob: dto.previousJob,
    skills: dto.skills ? dto.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    experience: '',
    ratings: {},
    isArchived: dto.isArchived,
    createdById: dto.createdById,
    createdAt: dto.createdAt?.split('T')[0] || '',
  };
}

export function mapCandidateToApi(data) {
  return {
    fullName: data.name,
    phone: data.phone,
    email: data.email || null,
    city: data.city,
    desiredPosition: data.vacancy,
    education: data.education,
    previousJob: data.previousJob || '',
    skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
  };
}

export function mapVacancyFromApi(dto) {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    shortDescription: dto.description,
    requirements: dto.requirements,
    requiredSkills: dto.competencyIds || [],
    status: dto.isArchived ? 'Закрыта' : (dto.isActive ? 'Активна' : 'Закрыта'),
    isActive: dto.isActive,
    isArchived: dto.isArchived,
    createdAt: dto.createdAt?.split('T')[0] || '',
  };
}

export function mapVacancyToApi(data) {
  return {
    title: data.title,
    description: data.description,
    requirements: data.requirements,
    isActive: data.status !== 'Закрыта',
    competencyIds: data.requiredSkills || [],
  };
}

export function mapInterviewFromApi(dto) {
  const dateObj = new Date(dto.plannedDate);
  const status = statusLabels[dto.status] || dto.status;
  let decision = decisionLabels[dto.decision] || dto.decision;
  if (status === 'Отменено' && decision === 'Ожидает') {
    decision = 'Без решения';
  }
  return {
    id: dto.id,
    candidateId: dto.candidateId,
    candidateName: dto.candidateName,
    vacancyId: dto.vacancyId,
    vacancy: dto.vacancyTitle,
    interviewerId: dto.interviewerId,
    interviewer: dto.interviewerName,
    date: dateObj.toISOString().split('T')[0],
    time: dateObj.toTimeString().slice(0, 5),
    status: status,
    decision: decision,
    isArchived: dto.isArchived,
    comments: dto.comments || '',
    matrix: dto.matrix || [],
    createdAt: dto.createdAt,
  };
}

export function mapUserFromApi(dto) {
  return {
    id: dto.id,
    name: dto.fullName,
    email: dto.email || '',
    login: dto.login || dto.email || '',
    role: roleLabels[dto.role] || dto.role.toLowerCase(),
    roleApi: dto.role,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
  };
}

export function mapAuditFromApi(dto) {
  const dateObj = new Date(dto.performedAt);
  const mskTime = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000);
  const dateStr = mskTime.toISOString().replace('T', ' ').slice(0, 16);
  const areaMap = {
    Candidate: 'Кандидаты',
    Vacancy: 'Вакансии',
    Interview: 'Собеседования',
    Competency: 'Компетенции',
    User: 'Пользователи',
  };
  const actionMap = {
    Create: 'Добавление',
    Update: 'Редактирование',
    SoftDelete: 'Удаление',
    Archive: 'Архивация',
    Unarchive: 'Разархивация',
    SetStatus: 'Изменение статуса',
    Decide: 'Решение',
    UpsertMatrix: 'Обновление матрицы',
    Restore: 'Восстановление',
    SetStatus: 'Изменение статуса',
  };
  return {
    id: dto.id,
    date: dateStr,
    area: areaMap[dto.entityType] || dto.entityType,
    action: actionMap[dto.action] || dto.action,
    objectId: dto.entityType?.slice(0, 1).toUpperCase() + '-' + dto.entityId?.slice(0, 8),
    user: (dto.performedByName || '—'),
    details: `${actionMap[dto.action] || dto.action}: ${dto.entityType}`,
  };
}

export { statusValues, decisionValues, roleValues, roleLabels, roleLabelsRu };
export default api;
