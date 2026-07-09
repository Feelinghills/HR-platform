import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import api, {
  mapCandidateFromApi, mapCandidateToApi,
  mapVacancyFromApi, mapVacancyToApi,
  mapInterviewFromApi,
  mapUserFromApi, mapAuditFromApi,
  statusValues, decisionValues, roleValues, roleLabels, roleLabelsRu,
} from './api';
import { formatDate, formatDateTime, formatPhone } from './utils/formatters';
import { ROLE_API_TO_FE, DEFAULT_ROLES } from './constants/roles';
import { PERMISSION_GROUPS, PERMISSION_LABELS } from './constants/permissions';
import { AREA_COLORS, INTERVIEW_STATUSES } from './constants/colors';
import { getCategoryColor, getCategoryTextColor } from './utils/categoryColors';
import { generatePDF } from './utils/pdfGenerator';
import ArchivePage from './pages/ArchivePage';
import DeletedPage from './pages/DeletedPage';
import SearchFilter from './components/SearchFilter';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  // --- СОСТОЯНИЯ ---
  const [step, setStep] = useState('login');
  const [userName, setUserName] = useState('');
  const [userLogin, setUserLogin] = useState('');
  const [userRole, setUserRole] = useState('hr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const [editInterviewData, setEditInterviewData] = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewComments, setInterviewComments] = useState('');
  const [showInterviewCard, setShowInterviewCard] = useState(false);
  const [showArchivedCandidates, setShowArchivedCandidates] = useState(false);
  const [showArchivedInterviews, setShowArchivedInterviews] = useState(false);

  // --- СОСТОЯНИЯ ДЛЯ ВАКАНСИЙ ---
  const [vacanciesList, setVacanciesList] = useState([]);

  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingVacancyId, setEditingVacancyId] = useState(null);
  const [vacancyFormData, setVacancyFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    requiredSkills: [],
    status: 'Активна'
  });
  const [searchQueryVacancies, setSearchQueryVacancies] = useState('');
  const [showArchivedVacancies, setShowArchivedVacancies] = useState(false);
  const [expandedVacancyId, setExpandedVacancyId] = useState(null);
  const [vacancySortOption, setVacancySortOption] = useState('newest');

  // --- СОСТОЯНИЯ ДЛЯ ЖУРНАЛА ИЗМЕНЕНИЙ ---
  const [logs, setLogs] = useState([]);
  const [searchQueryLogs, setSearchQueryLogs] = useState('');
  const [areaFilter, setAreaFilter] = useState('Все');
  const [actionFilter, setActionFilter] = useState('Все');
  const [logsSortOption, setLogsSortOption] = useState('newest');

  const areaColors = AREA_COLORS;

  // --- ФУНКЦИЯ ДОБАВЛЕНИЯ ЗАПИСИ В ЖУРНАЛ ---
  // Аудит ведётся на бэкенде, локальная функция оставлена как заглушка
  const addLog = () => {};

  // --- СОСТОЯНИЯ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ---
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    role: 'hr'
  });
  const [searchQueryUsers, setSearchQueryUsers] = useState('');
  const [roleFilter, setRoleFilter] = useState('Все');

  // --- СОСТОЯНИЯ ДЛЯ РОЛЕЙ И ПРАВ ---
  const [usersTab, setUsersTab] = useState('users'); // 'users' | 'roles'
  const [roles, setRoles] = useState(() => {
    try { const saved = localStorage.getItem('hr_roles'); return saved ? JSON.parse(saved) : DEFAULT_ROLES; } catch { return DEFAULT_ROLES; }
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', color: '#dbeafe', textColor: '#1d4ed8', permissions: [] });

  const permissionGroups = PERMISSION_GROUPS;

  const permissionLabels = PERMISSION_LABELS;

  const hasPermission = (perm) => {
    const role = roles.find(r => r.id === userRole);
    return role ? role.permissions.includes(perm) : false;
  };

  // --- СОСТОЯНИЯ ДЛЯ МАТРИЦЫ КОМПЕТЕНЦИЙ ---
  const [competencies, setCompetencies] = useState([]);

  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [editingCompetencyId, setEditingCompetencyId] = useState(null);
  const [competencyFormData, setCompetencyFormData] = useState({
    name: '',
    category: '',
    description: '',
    maxScore: 5,
    isActive: true
  });
  const [searchQueryCompetencies, setSearchQueryCompetencies] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Все');
  const [showArchivedCompetencies, setShowArchivedCompetencies] = useState(false);
  const [competencySortOption, setCompetencySortOption] = useState('newest');

  // --- ДАННЫЕ ---
  const [candidates, setCandidates] = useState([]);

  const [vacancies] = useState([]);

  // --- СОБЕСЕДОВАНИЯ ---
  const [interviews, setInterviews] = useState([]);

  const interviewerOptions = [];

  const statuses = INTERVIEW_STATUSES;

  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    interviewer: '',
    date: '',
    time: ''
  });
  const [statusFilter, setStatusFilter] = useState('Все');
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');
  const [searchQueryInterviews, setSearchQueryInterviews] = useState('');
  const [interviewSortOption, setInterviewSortOption] = useState('newest');

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
  const getTodayInterviews = () => {
    const today = new Date().toISOString().split('T')[0];
    return interviews.filter(i => i.date === today && !i.isArchived);
  };

  const getTodayInterviewsCount = () => {
    return getTodayInterviews().length;
  };

  // --- СОСТОЯНИЕ ДЛЯ НОВОГО КАНДИДАТА ---
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    phone: '',
    vacancy: '',
    city: '',
    education: '',
    experience: '',
    previousJob: '',
    skills: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [candidateStatusFilter, setCandidateStatusFilter] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState([]);

  // --- ВАЛИДАЦИЯ ТЕЛЕФОНА ---
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ ВАКАНСИЙ
  // ================================================================
  const openAddVacancyModal = () => {
    setEditingVacancyId(null);
    setVacancyFormData({
      title: '',
      description: '',
      requirements: '',
      requiredSkills: [],
      status: 'Активна'
    });
    setShowVacancyModal(true);
  };

  const openEditVacancyModal = (vacancy) => {
    setEditingVacancyId(vacancy.id);
    setVacancyFormData({
      title: vacancy.title,
      description: vacancy.description,
      requirements: vacancy.requirements,
      requiredSkills: [...vacancy.requiredSkills],
      status: vacancy.status
    });
    setShowVacancyModal(true);
  };

  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    if (!vacancyFormData.title.trim()) {
      alert('Заполните название вакансии');
      return;
    }
    if (!vacancyFormData.description.trim()) {
      alert('Заполните описание');
      return;
    }
    if (!vacancyFormData.requiredSkills || vacancyFormData.requiredSkills.length === 0) {
      alert('Выберите хотя бы одну компетенцию');
      return;
    }
    const apiData = mapVacancyToApi(vacancyFormData);

    try {
      if (editingVacancyId) {
        const updated = await api.updateVacancy(editingVacancyId, apiData);
        setVacanciesList(vacanciesList.map(v =>
          v.id === editingVacancyId ? mapVacancyFromApi(updated) : v
        ));
      } else {
        const created = await api.createVacancy(apiData);
        setVacanciesList([mapVacancyFromApi(created), ...vacanciesList]);
      }
      setShowVacancyModal(false);
      setVacancyFormData({ title: '', description: '', requirements: '', requiredSkills: [], status: 'Активна' });
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteVacancy = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      try {
        await api.deleteVacancy(id);
        setVacanciesList(vacanciesList.filter(v => v.id !== id));
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    }
  };

  const handleArchiveVacancy = async (id) => {
    const vacancy = vacanciesList.find(v => v.id === id);
    try {
      if (vacancy.isArchived) {
        await api.unarchiveVacancy(id);
      } else {
        await api.archiveVacancy(id);
      }
      setVacanciesList(vacanciesList.map(v =>
        v.id === id ? { ...v, isArchived: !v.isArchived, status: v.isArchived ? 'Активна' : 'Закрыта' } : v
      ));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const toggleRequirements = (id) => {
    setExpandedVacancyId(expandedVacancyId === id ? null : id);
  };

  const getFilteredVacancies = () => {
    let filtered = vacanciesList;
    if (searchQueryVacancies) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQueryVacancies.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQueryVacancies.toLowerCase())
      );
    }
    if (!showArchivedVacancies) {
      filtered = filtered.filter(v => !v.isArchived);
    }
    switch (vacancySortOption) {
      case 'oldest': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'alphabet': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return filtered;
  };

  const getAvailableSkills = () => {
    return competencies.filter(c => c.isActive);
  };

  const handleSkillToggle = (compId) => {
    const currentSkills = vacancyFormData.requiredSkills || [];
    setVacancyFormData({
      ...vacancyFormData,
      requiredSkills: currentSkills.includes(compId) ? currentSkills.filter(s => s !== compId) : [...currentSkills, compId]
    });
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ ЖУРНАЛА ИЗМЕНЕНИЙ
  // ================================================================
  const getFilteredLogs = () => {
    let filtered = logs;
    
    if (userRole !== 'admin') {
      filtered = filtered.filter(l => l.user.includes(userName));
    }
    
    if (searchQueryLogs) {
      filtered = filtered.filter(l =>
        l.details.toLowerCase().includes(searchQueryLogs.toLowerCase()) ||
        l.user.toLowerCase().includes(searchQueryLogs.toLowerCase()) ||
        l.objectId.toLowerCase().includes(searchQueryLogs.toLowerCase())
      );
    }
    const areaArr = Array.isArray(areaFilter) ? areaFilter : (areaFilter && areaFilter !== 'Все' ? [areaFilter] : []);
    if (areaArr.length > 0) {
      filtered = filtered.filter(l => areaArr.includes(l.area));
    }
    const actionArr = Array.isArray(actionFilter) ? actionFilter : (actionFilter && actionFilter !== 'Все' ? [actionFilter] : []);
    if (actionArr.length > 0) {
      filtered = filtered.filter(l => actionArr.includes(l.action));
    }
    // Сортировка
    switch (logsSortOption) {
      case 'oldest': filtered.sort((a, b) => (a.date || '').localeCompare(b.date || '')); break;
      default: filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '')); break;
    }
    return filtered;
  };

  const getUniqueAreas = () => {
    const areas = logs.map(l => l.area);
    return [...new Set(areas)];
  };

  const getUniqueActions = () => {
    const actions = logs.map(l => l.action);
    return [...new Set(actions)];
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
  // ================================================================
  const openAddUserModal = () => {
    setEditingUserId(null);
    setUserFormData({ name: '', login: '', email: '', password: '', role: 'hr' });
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUserId(user.id);
    setUserFormData({
      name: user.name,
      login: user.login,
      email: user.email || '',
      password: user.password || '',
      role: user.role
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const updated = await api.updateUser(editingUserId, {
          login: userFormData.login,
          email: userFormData.email || '',
          fullName: userFormData.name,
          role: roleValues[userFormData.role] || 'HR',
          password: userFormData.password || '',
        });
        setUsers(users.map(u =>
          u.id === editingUserId ? mapUserFromApi(updated) : u
        ));
      } else {
        const created = await api.createUser({
          login: userFormData.login,
          email: userFormData.email || '',
          password: userFormData.password,
          fullName: userFormData.name,
          role: roleValues[userFormData.role] || 'HR',
        });
        setUsers([...users, mapUserFromApi(created)]);
      }
      setShowUserModal(false);
      setUserFormData({ name: '', login: '', email: '', password: '', role: 'hr' });
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchQueryUsers) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchQueryUsers.toLowerCase()) ||
        u.login.toLowerCase().includes(searchQueryUsers.toLowerCase())
      );
    }
    if (roleFilter !== 'Все') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    return filtered;
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'hr': return 'HR';
      case 'reshala': return 'Согласующий';
      default: return role;
    }
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ МАТРИЦЫ КОМПЕТЕНЦИЙ
  // ================================================================
  const openAddCompetencyModal = () => {
    setEditingCompetencyId(null);
    setCompetencyFormData({ name: '', category: '', description: '', maxScore: 5, isActive: true });
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setShowCompetencyModal(true);
  };

  const openEditCompetencyModal = (comp) => {
    setEditingCompetencyId(comp.id);
    setCompetencyFormData({
      name: comp.name,
      category: comp.category,
      description: comp.description,
      maxScore: comp.maxScore,
      isActive: comp.isActive
    });
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setShowCompetencyModal(true);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setCompetencyFormData({ ...competencyFormData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const handleSaveCompetency = async (e) => {
    e.preventDefault();
    try {
      if (editingCompetencyId) {
        const updated = await api.updateCompetency(editingCompetencyId, competencyFormData);
        setCompetencies(competencies.map(c =>
          c.id === editingCompetencyId ? { id: updated.id, name: updated.name, category: updated.category, description: updated.description, maxScore: updated.maxScore, isActive: updated.isActive } : c
        ));
      } else {
        const created = await api.createCompetency(competencyFormData);
        setCompetencies([...competencies, { id: created.id, name: created.name, category: created.category, description: created.description, maxScore: created.maxScore, isActive: created.isActive }]);
        setCategories([...new Set([...categories, created.category])]);
      }
      setShowCompetencyModal(false);
      setCompetencyFormData({ name: '', category: '', description: '', maxScore: 5, isActive: true });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteCompetency = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту компетенцию?')) {
      try {
        await api.deleteCompetency(id);
        setCompetencies(competencies.filter(c => c.id !== id));
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    }
  };

  const handleArchiveCompetency = async (id) => {
    const comp = competencies.find(c => c.id === id);
    try {
      if (comp.isArchived) {
        await api.unarchiveCompetency(id);
      } else {
        await api.archiveCompetency(id);
      }
      setCompetencies(competencies.map(c =>
        c.id === id ? { ...c, isArchived: !c.isArchived } : c
      ));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const getFilteredCompetencies = () => {
    let filtered = competencies;
    if (searchQueryCompetencies) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQueryCompetencies.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQueryCompetencies.toLowerCase())
      );
    }
    const catArr = Array.isArray(categoryFilter) ? categoryFilter : (categoryFilter && categoryFilter !== 'Все' ? [categoryFilter] : []);
    if (catArr.length > 0) {
      filtered = filtered.filter(c => catArr.includes(c.category));
    }
    if (!showArchivedCompetencies) {
      filtered = filtered.filter(c => !c.isArchived);
    }
    switch (competencySortOption) {
      case 'oldest': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'category': filtered.sort((a, b) => (a.category || '').localeCompare(b.category || '')); break;
      default: filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return filtered;
  };



  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ КАНДИДАТОВ
  // ================================================================
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!validatePhone(newCandidate.phone)) {
      setPhoneError('Введите корректный номер телефона (11 цифр)');
      return;
    }
    setPhoneError('');

    try {
      const dto = mapCandidateToApi(newCandidate);
      const created = await api.createCandidate(dto);
      setCandidates([mapCandidateFromApi(created), ...candidates]);
      setNewCandidate({ name: '', phone: '', vacancy: '', city: '', education: '', experience: '', previousJob: '', skills: '' });
      setPhoneError('');
      setShowAddModal(false);
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleArchiveCandidate = async (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    try {
      if (candidate.isArchived) {
        await api.unarchiveCandidate(candidateId);
      } else {
        await api.archiveCandidate(candidateId);
      }
      setCandidates(candidates.map(c =>
        c.id === candidateId ? { ...c, isArchived: !c.isArchived } : c
      ));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Удалить кандидата? Действие можно будет отменить в разделе "Удалённое".')) return;
    try {
      await api.deleteCandidate(candidateId);
      setCandidates(candidates.filter(c => c.id !== candidateId));
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(null); setIsEditing(false); setEditData({});
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    if (!window.confirm('Удалить собеседование? Действие можно будет отменить в разделе "Удалённое".')) return;
    try {
      await api.deleteInterview(interviewId);
      setInterviews(interviews.filter(i => i.id !== interviewId));
      if (selectedInterview && selectedInterview.id === interviewId) {
        setSelectedInterview(null); setShowInterviewCard(false);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editData.phone || editData.phone.length < 10) { alert('Введите корректный номер телефона'); return; }
    if (!editData.city || !editData.city.trim()) { alert('Введите город'); return; }
    if (!editData.education || !editData.education.trim()) { alert('Введите образование'); return; }
    const updatedData = { ...selectedCandidate, ...editData };
    try {
      const dto = mapCandidateToApi(updatedData);
      const updated = await api.updateCandidate(selectedCandidate.id, dto);
      const mapped = mapCandidateFromApi(updated);
      setCandidates(candidates.map(c => c.id === selectedCandidate.id ? mapped : c));
      setSelectedCandidate(mapped);
      setIsEditing(false);
      setEditData({});
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleStarClick = (skillIndex, starIndex) => {
    if (!isEditing) return;
    const newRatings = { ...ratings, [skillIndex]: starIndex + 1 };
    setRatings(newRatings);
    if (selectedCandidate) {
      const updatedCandidate = { ...selectedCandidate, ratings: newRatings };
      setSelectedCandidate(updatedCandidate);
      const updatedCandidates = candidates.map(c =>
        c.id === selectedCandidate.id ? updatedCandidate : c
      );
      setCandidates(updatedCandidates);
    }
  };

  const getFilteredCandidates = () => {
    let filtered = candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.vacancy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));
      const archiveMatch = showArchivedCandidates ? true : !c.isArchived;
      return matchesSearch && archiveMatch;
    });
    // Фильтр по статусу
    const statusArr = Array.isArray(candidateStatusFilter) ? candidateStatusFilter : [];
    if (statusArr.length > 0) {
      filtered = filtered.filter(c => statusArr.includes(getCandidateStatus(c.id)));
    }
    // Фильтр по опыту
    const expArr = Array.isArray(experienceFilter) ? experienceFilter : [];
    if (expArr.length > 0) {
      filtered = filtered.filter(c => c.experience && expArr.includes(c.experience));
    }
    switch (sortOption) {
      case 'oldest':
        filtered.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        break;
      case 'alphabet':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
    }
    return filtered;
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ СОБЕСЕДОВАНИЙ
  // ================================================================
  const handleArchiveInterview = async (interviewId) => {
    try {
      const updated = await api.archiveInterview(interviewId);
      const mapped = mapInterviewFromApi(updated);
      setInterviews(interviews.map(i => i.id === interviewId ? mapped : i));
      if (selectedInterview && selectedInterview.id === interviewId) {
        setSelectedInterview(mapped);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleUnarchiveInterview = async (interviewId) => {
    try {
      const updated = await api.unarchiveInterview(interviewId);
      const mapped = mapInterviewFromApi(updated);
      setInterviews(interviews.map(i => i.id === interviewId ? mapped : i));
      if (selectedInterview && selectedInterview.id === interviewId) {
        setSelectedInterview(mapped);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const startEditInterview = (interview) => {
    setEditingInterviewId(interview.id);
    setEditInterviewData({
      date: interview.date,
      time: interview.time,
      interviewer: interview.interviewerId,
      candidateId: interview.candidateId,
      vacancyId: interview.vacancyId,
      comments: interview.comments || '',
    });
  };

  const saveEditInterview = async () => {
    try {
      const plannedDate = new Date(`${editInterviewData.date}T${editInterviewData.time || '00:00'}`).toISOString();
      const updated = await api.updateInterview(editingInterviewId, {
        candidateId: editInterviewData.candidateId,
        vacancyId: editInterviewData.vacancyId,
        interviewerId: editInterviewData.interviewer,
        plannedDate: plannedDate,
        comments: editInterviewData.comments || '',
      });
      setInterviews(interviews.map(i =>
        i.id === editingInterviewId ? mapInterviewFromApi(updated) : i
      ));
      if (selectedInterview && selectedInterview.id === editingInterviewId) {
        setSelectedInterview(mapInterviewFromApi(updated));
      }
      setEditingInterviewId(null);
      setEditInterviewData({});
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const cancelEditInterview = () => {
    setEditingInterviewId(null);
    setEditInterviewData({});
  };

  const handleDecision = async (interviewId, decision) => {
    try {
      let updated;
      if (decision === 'Ожидает') {
        const interview = interviews.find(i => i.id === interviewId);
        const matrix = interview?.matrix || [];
        if (matrix.length > 0 && matrix.some(m => !m.score || m.score === 0)) {
          alert('Не все оценки компетенций проставлены. Завершить собеседование можно только после заполнения всех оценок.');
          return;
        }
        updated = await api.updateInterviewStatus(interviewId, { status: 'Completed', comments: interviewComments || selectedInterview?.comments || '' });
      } else if (decision === 'Без решения') {
        updated = await api.updateInterviewStatus(interviewId, { status: 'Cancelled', comments: interviewComments || selectedInterview?.comments || '', decision: 'Pending' });
      } else {
        const apiDecision = decisionValues[decision] || decision;
        updated = await api.decideInterview(interviewId, { decision: apiDecision });
      }
      const mapped = mapInterviewFromApi(updated);
      let newInterviews = interviews.map(i => i.id === interviewId ? mapped : i);

      // Архивация других собеседований при "Принят" или "Кадровый резерв"
      if (decision === 'Принят' || decision === 'Кадровый резерв') {
        const otherInterviews = newInterviews.filter(i => i.candidateId === mapped.candidateId && i.id !== interviewId && !i.isArchived);
        for (const other of otherInterviews) {
          try { await api.archiveInterview(other.id); } catch {}
        }
        newInterviews = newInterviews.map(i => i.candidateId === mapped.candidateId && i.id !== interviewId ? { ...i, isArchived: true } : i);
      }

      // Если все собеседования отклонены — архивируем все
      if (decision === 'Отказан' || decision === 'Без решения') {
        const candidateInterviews = newInterviews.filter(i => i.candidateId === mapped.candidateId);
        const allConcluded = candidateInterviews.every(i => i.status === 'Проведено' || i.status === 'Отменено');
        const allRejected = allConcluded && candidateInterviews.every(i => i.decision === 'Отказан' || i.decision === 'Без решения' || i.status === 'Отменено');
        if (allRejected && candidateInterviews.length > 0) {
          for (const ci of candidateInterviews) {
            if (!ci.isArchived) {
              try { await api.archiveInterview(ci.id); } catch {}
            }
          }
          newInterviews = newInterviews.map(i => i.candidateId === mapped.candidateId ? { ...i, isArchived: true } : i);
        }
      }

      setInterviews(newInterviews);
      if (selectedInterview && selectedInterview.id === interviewId) {
        setSelectedInterview(mapped);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const plannedDate = new Date(`${newInterview.date}T${newInterview.time || '00:00'}`).toISOString();

      const dto = {
        candidateId: newInterview.candidateId,
        vacancyId: newInterview.vacancyId,
        interviewerId: newInterview.interviewer,
        plannedDate: plannedDate,
        comments: '',
      };

      const created = await api.createInterview(dto);
      setInterviews([mapInterviewFromApi(created), ...interviews]);
      setNewInterview({ candidateId: '', vacancyId: '', interviewer: '', date: '', time: '' });
      setShowScheduleModal(false);
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const openInterviewCard = (interview) => {
    setSelectedInterview(interview);
    setInterviewComments(interview.comments || '');
    setShowInterviewCard(true);
    const candidate = candidates.find(c => c.id === interview.candidateId);
    if (candidate) {
      setRatings(candidate.ratings || {});
    }
  };

  const saveComment = async () => {
    try {
      await api.updateInterviewStatus(selectedInterview.id, {
        status: statusValues[selectedInterview.status] || 'Planned',
        comments: interviewComments,
      });
      setInterviews(interviews.map(i =>
        i.id === selectedInterview.id ? { ...i, comments: interviewComments } : i
      ));
      setSelectedInterview({ ...selectedInterview, comments: interviewComments });
    } catch (err) {
      console.error('saveComment error:', err);
    }
  };

  const handleStarClickInterview = async (skillIndex, starIndex) => {
    const newRatings = { ...ratings, [skillIndex]: starIndex + 1 };
    setRatings(newRatings);
    if (selectedInterview) {
      const matrix = selectedInterview.matrix || [];
      const competencyId = matrix[skillIndex]?.competencyId;
      if (competencyId) {
        try {
          const items = matrix.map((m, i) => ({
            competencyId: m.competencyId,
            score: i === skillIndex ? starIndex + 1 : (m.score || 0),
          }));
          const updated = await api.upsertMatrix(selectedInterview.id, { items });
          setSelectedInterview(mapInterviewFromApi(updated));
          setInterviews(interviews.map(i =>
            i.id === selectedInterview.id ? mapInterviewFromApi(updated) : i
          ));
        } catch (err) {
          console.error('Matrix save error:', err);
        }
      }
    }
  };

  const getFilteredInterviews = () => {
    let filtered = interviews;
    
    // Фильтр по статусу (массив)
    const statusArr = Array.isArray(statusFilter) ? statusFilter : (statusFilter && statusFilter !== 'Все' ? [statusFilter] : []);
    const hasArchiveStatus = statusArr.includes('Архив');
    if (statusArr.length > 0 && !hasArchiveStatus) {
      filtered = filtered.filter(i => statusArr.includes(i.status));
    }
    if (hasArchiveStatus) {
      filtered = filtered.filter(i => i.isArchived);
    } else if (!showArchivedInterviews) {
      filtered = filtered.filter(i => !i.isArchived);
    }
    
    // Фильтр по дате (от)
    if (dateFilterFrom) {
      filtered = filtered.filter(i => i.date >= dateFilterFrom);
    }
    
    // Фильтр по дате (до)
    if (dateFilterTo) {
      filtered = filtered.filter(i => i.date <= dateFilterTo);
    }
    
    // Поиск
    if (searchQueryInterviews) {
      filtered = filtered.filter(i =>
        i.candidateName.toLowerCase().includes(searchQueryInterviews.toLowerCase()) ||
        i.vacancy.toLowerCase().includes(searchQueryInterviews.toLowerCase()) ||
        (i.interviewer && i.interviewer.toLowerCase().includes(searchQueryInterviews.toLowerCase()))
      );
    }
    // Сортировка
    switch (interviewSortOption) {
      case 'oldest': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'alphabet': filtered.sort((a, b) => (a.candidateName || '').localeCompare(b.candidateName || '')); break;
      default: filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    }
    return filtered;
  };


  const generatePDF = async (type, interview) => {
    try {
      let response;
      let filename;
      switch(type) {
        case 'Карточка кандидата':
          response = await api.downloadCandidateCard(interview.candidateId);
          filename = 'candidate-card.pdf';
          break;
        case 'Протокол собеседования':
          response = await api.downloadInterviewProtocol(interview.id);
          filename = 'interview-protocol.pdf';
          break;
        case 'Письмо о решении':
          response = await api.downloadDecisionLetter(interview.id);
          filename = 'decision-letter.pdf';
          break;
        default:
          return;
      }
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Ошибка при скачивании файла');
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const pdfGenerate = (type, interview) => generatePDF(type, interview);

  // --- ЗАГРУЗКА ДАННЫХ С БЭКЕНДА ---
  const loadData = useCallback(async () => {
    try {
      const [candidatesRes, vacanciesRes, competenciesRes, interviewsRes] = await Promise.all([
        api.getCandidates('', true).catch(() => []),
        api.getVacancies(false, true).catch(() => []),
        api.getCompetencies(false, true).catch(() => []),
        api.getInterviews().catch(() => []),
      ]);

      setCandidates((candidatesRes || []).map(mapCandidateFromApi));
      setVacanciesList((vacanciesRes || []).map(mapVacancyFromApi));
      setCompetencies((competenciesRes || []).map(c => ({
        id: c.id, name: c.name, category: c.category,
        description: c.description, maxScore: c.maxScore, isActive: c.isActive, isArchived: c.isArchived
      })));
      const cats = [...new Set((competenciesRes || []).map(c => c.category))];
      setCategories(cats);
      setInterviews((interviewsRes || []).map(mapInterviewFromApi));

      try {
        const usersRes = await api.getUsers();
        setUsers((usersRes || []).map(mapUserFromApi));
      } catch {}

      try {
        const auditRes = await api.getAudit();
        setLogs((auditRes || []).map(mapAuditFromApi));
      } catch {}
    } catch (err) {
      console.error('loadData error:', err);
    }
  }, []);

  // --- ПРОВЕРКА ТОКЕНА ПРИ ЗАГРУЗКЕ ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.me().then(user => {
        setUserName(user.fullName);
        setUserLogin(user.email);
        setUserRole(ROLE_API_TO_FE[user.role] || user.role.toLowerCase());
        setStep('main');
        loadData();
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- ЛОГИКА ВХОДА ---
  const handleLogin = async (email, password) => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('token', token);
      setUserName(user.fullName);
      setUserLogin(user.email);
      setUserRole(ROLE_API_TO_FE[user.role] || user.role.toLowerCase());
      setError('');
      setStep('greeting');
      loadData();
    } catch (err) {
      setError(err.message || 'Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setStep('login');
    setUserName('');
    setUserLogin('');
    setUserRole('hr');
    localStorage.removeItem('token');
    setIsProfileOpen(false);
    navigate('dashboard');
    setSelectedCandidate(null);
    setSelectedInterview(null);
    setRatings({});
    setIsEditing(false);
    setShowInterviewCard(false);
    setCandidates([]);
    setVacanciesList([]);
    setCompetencies([]);
    setInterviews([]);
    setUsers([]);
    setLogs([]);
  };

  // --- АВТОПЕРЕХОД С ПРИВЕТСТВИЯ ---
  useEffect(() => {
    if (step === 'greeting') {
      const fadeTimer = setTimeout(() => { setIsFadingOut(true); }, 1500);
      const switchTimer = setTimeout(() => { setStep('main'); setIsFadingOut(false); }, 2000);
      return () => { clearTimeout(fadeTimer); clearTimeout(switchTimer); };
    }
  }, [step]);

  // --- СБРОС ПОИСКА ---
  useEffect(() => {
    setSearchQuery('');
    setSortOption('newest');
    setShowSortMenu(false);
    setSearchQueryInterviews('');
    setInterviewSortOption('newest');
    setStatusFilter('Все');
    setDateFilterFrom('');
    setDateFilterTo('');
    setLogsSortOption('newest');
    setCompetencySortOption('newest');
    setVacancySortOption('newest');
    setShowInterviewCard(false);
    setSelectedInterview(null);
    setSelectedCandidate(null);
    setIsEditing(false);
    setShowAddModal(false);
    setShowScheduleModal(false);
    setShowVacancyModal(false);
    setShowCompetencyModal(false);
    setShowUserModal(false);
    setShowRoleModal(false);
    if (step === 'main') loadData();
  }, [currentPage]);

  // --- ПРИМЕНЕНИЕ ПОИСКА ИЗ НАВИГАЦИИ ---
  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchQueryInterviews(location.state.searchQuery);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // --- СОХРАНЕНИЕ РОЛЕЙ В localStorage ---
  useEffect(() => {
    localStorage.setItem('hr_roles', JSON.stringify(roles));
  }, [roles]);

  // --- ОБНОВЛЕНИЕ ЖУРНАЛА ПРИ ОТКРЫТИИ ---
  useEffect(() => {
    if (currentPage === 'logs') {
      api.getAudit().then(data => {
        setLogs((data || []).map(mapAuditFromApi));
      }).catch(() => {});
    }
  }, [currentPage]);

  // ================================================================
  // РЕНДЕР СТРАНИЦ
  // ================================================================

  // --- ПРИВЕТСТВИЕ ---
  if (step === 'greeting') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: "'Unbounded', sans-serif",
        padding: '20px',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'translateY(-30px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
          <img src="/logo.png?v=2" alt="Логотип" style={{ height: '80px', marginBottom: '32px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', textAlign: 'center' }}>Здравствуйте, {userName}!</h1>
        </div>
      </div>
    );
  }

  // --- ПРОФИЛЬ ---
  if (isProfileOpen && step === 'main') {
    const roleLabels = { admin: 'Администратор', hr: 'HR', reshala: 'Согласующий' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Unbounded', sans-serif", animation: 'fadeIn 0.3s ease-out' }}>
        <header style={{ display: 'flex', alignItems: 'center', height: '64px', padding: '0 24px', background: '#11171F', borderBottom: '1px solid #6A7787', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png?v=2" alt="Логотип" style={{ height: '32px' }} /><span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>HR-platform</span></div>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '80px 20px 20px' }}>
          <div style={{ background: '#171D24', padding: '48px 40px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setIsProfileOpen(false)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s', padding: '4px 8px' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>←</button>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#333F50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px', fontWeight: '700', color: '#ffffff' }}>{userName.charAt(0).toUpperCase()}</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '24px' }}>Профиль</h2>
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '16px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Логин</label><div style={{ padding: '10px 14px', background: '#11171F', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>{userLogin}</div></div>
              <div style={{ marginBottom: '16px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Пароль</label><div style={{ padding: '10px 14px', background: '#11171F', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>••••••••</div></div>
              <div style={{ marginBottom: '24px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Должность</label><div style={{ padding: '10px 14px', background: '#11171F', borderRadius: '8px', color: '#ffffff', fontSize: '14px' }}>{roleLabels[userRole] || userRole}</div></div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: '#6B1A1A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#8B2222'} onMouseLeave={(e) => e.target.style.background = '#6B1A1A'}>Выйти</button>
          </div>
        </div>
      </div>
    );
  }

  // --- АВТОРИЗАЦИЯ ---
  if (step === 'login') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Unbounded', sans-serif" }}>
        <header style={{ display: 'flex', alignItems: 'center', height: '64px', padding: '0 24px', background: '#11171F', borderBottom: '1px solid #6A7787', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png?v=2" alt="Логотип" style={{ height: '64px' }} /><span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>HR-platform</span></div>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '20px' }}>
          <h1 style={{ fontSize: '58px', fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: '11px' }}>Технические собеседования</h1>
          <h2 style={{ fontSize: '29px', fontWeight: '500', color: '#ffffff', textAlign: 'center', marginBottom: '40px' }}>Авторизация</h2>
          <div style={{ background: '#171D24', padding: '38px 48px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '100%', maxWidth: '460px', textAlign: 'center' }}>
            <form onSubmit={(e) => { e.preventDefault(); const login = e.target.login.value; const password = e.target.password.value; handleLogin(login, password); }}>
              <input name="login" type="text" placeholder="Логин или электронная почта" style={{ width: '100%', padding: '12px 17px', border: '1px solid #6A7787', borderRadius: '10px', fontSize: '17px', boxSizing: 'border-box', background: '#11171F', color: '#ffffff', outline: 'none', marginBottom: '17px' }} required />
              <div style={{ position: 'relative', marginBottom: '17px' }}>
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Пароль" style={{ width: '100%', padding: '12px 50px 12px 17px', border: '1px solid #6A7787', borderRadius: '10px', fontSize: '17px', boxSizing: 'border-box', background: '#11171F', color: '#ffffff', outline: 'none' }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', lineHeight: '1', display: 'flex', alignItems: 'center' }}>
                  {showPassword
                    ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6A7787" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6A7787" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '4px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Вход</button>
              {error && <p style={{ color: '#ef4444', fontSize: '15px', marginTop: '17px' }}>{error}</p>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- КАРТОЧКА КАНДИДАТА ---
  const renderCandidateCard = () => {
    if (!selectedCandidate) return null;
    const getDisplayValue = (value) => value || 'Не указано';
    const canEdit = hasPermission('candidates.edit');
    const canArchive = hasPermission('candidates.archive');

    // Собираем компетенции из последних завершённых собеседований
    const candidateInterviews = interviews.filter(i => i.candidateId === selectedCandidate.id);
    const concludedInterviews = candidateInterviews.filter(i => i.status === 'Проведено');
    const competencyMap = {};
    concludedInterviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    concludedInterviews.forEach(interview => {
      (interview.matrix || []).forEach(m => {
        if (!competencyMap[m.competencyId]) {
          competencyMap[m.competencyId] = { name: m.competencyName || m.name, score: m.score, maxScore: m.maxScore || 5 };
        }
      });
    });
    const competencyEntries = Object.values(competencyMap);

    // Форматирование телефона для редактирования
    const formatPhoneForEdit = (digits) => {
      if (!digits) return '';
      const p = digits.replace(/\D/g, '');
      if (p.length <= 1) return '+' + p;
      if (p.length <= 4) return '+' + p.slice(0,1) + ' (' + p.slice(1);
      if (p.length <= 7) return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4);
      return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4,7) + '-' + p.slice(7,9) + '-' + p.slice(9);
    };

    return (
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => { setSelectedCandidate(null); setRatings({}); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '14px', cursor: 'pointer', padding: '8px 0', marginBottom: '24px', fontFamily: "'Unbounded', sans-serif" }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>← Назад к списку</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>{selectedCandidate.name}</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {candidateInterviews.length > 0 && (
              <button onClick={() => { navigate('interviews', { state: { searchQuery: selectedCandidate.name } }); setSelectedCandidate(null); setRatings({}); setIsEditing(false); }} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Перейти к собеседованиям</button>
            )}
            {!isEditing ? (
              <>
                {canEdit && <button onClick={() => { setIsEditing(true); setEditData({ phone: selectedCandidate.phone || '', city: selectedCandidate.city || '', experience: selectedCandidate.experience || '', education: selectedCandidate.education || '', previousJob: selectedCandidate.previousJob || '', skills: Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills.join(', ') : '' }); }} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                {canArchive && <button onClick={() => { handleArchiveCandidate(selectedCandidate.id); setSelectedCandidate({ ...selectedCandidate, isArchived: !selectedCandidate.isArchived }); }} style={{ padding: '8px 20px', background: selectedCandidate.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = selectedCandidate.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = selectedCandidate.isArchived ? '#3E503A' : '#333F50'}>{selectedCandidate.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
                {hasPermission('candidates.delete') && <button onClick={() => handleDeleteCandidate(selectedCandidate.id)} style={{ padding: '8px 20px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
              </>
            ) : (
              <>
                <button onClick={handleSaveEdit} style={{ padding: '8px 20px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Сохранить</button>
                <button onClick={handleCancelEdit} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button>
              </>
            )}
          </div>
        </div>
        <div style={{ background: '#171D24', padding: '24px 28px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Номер телефона:</span>{isEditing ? <input type="tel" value={formatPhoneForEdit(editData.phone)} onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); if (value.length <= 11) handleEditChange('phone', value); }} onFocus={(e) => { if (!editData.phone) handleEditChange('phone', '7'); }} placeholder="+7 (___) ___-__-__" style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} maxLength="18" /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{formatPhone(selectedCandidate.phone)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Город:</span>{isEditing ? <input type="text" value={editData.city} onChange={(e) => handleEditChange('city', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.city)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Опыт работы:</span>{isEditing ? <input type="text" value={editData.experience} onChange={(e) => handleEditChange('experience', e.target.value)} placeholder="Например: 3 года в backend" style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.experience)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Образование:</span>{isEditing ? <input type="text" value={editData.education} onChange={(e) => handleEditChange('education', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.education)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Пред. место работы:</span>{isEditing ? <input type="text" value={editData.previousJob} onChange={(e) => handleEditChange('previousJob', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1, wordBreak: 'break-word' }}>{getDisplayValue(selectedCandidate.previousJob)}</span>}</div>
        </div>
        <div style={{ background: '#171D24', padding: '24px 28px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}>
            <span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Навыки:</span>
            <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{selectedCandidate.skills && selectedCandidate.skills.length > 0 ? selectedCandidate.skills.join(', ') : 'Не указаны'}</span>
          </div>
          <div style={{ padding: '10px 0' }}>
            <span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px', display: 'block', marginBottom: '12px' }}>Компетенции:</span>
            {competencyEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {competencyEntries.map((comp, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#11171F', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{comp.name}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ fontSize: '18px', color: star <= comp.score ? '#7F7B6D' : '#3A3F4A', textShadow: star <= comp.score ? 'none' : '0 0 0 1px #7F7B6D', opacity: star <= comp.score ? 1 : 0.4 }}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: '#6A7787' }}>Нет оценок по компетенциям</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ КАНДИДАТА ---
  const renderAddModal = () => {
    if (!showAddModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAddModal(false)}>
        <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Новый кандидат</h2>
            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>✕</button>
          </div>
          <form onSubmit={handleAddCandidate}>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>ФИО *</label><input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="Иванов Иван Иванович" style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required pattern="^[А-Яа-яЁёA-Za-z]+\s[А-Яа-яЁёA-Za-z]+(\s[А-Яа-яЁёA-Za-z]+)?$" title="Введите минимум два слова (Фамилия Имя)" /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Номер телефона *</label><input type="tel" value={(() => { const p = newCandidate.phone; if (!p || p.length === 0) return ''; if (p.length <= 1) return '+' + p; if (p.length <= 4) return '+' + p.slice(0,1) + ' (' + p.slice(1); if (p.length <= 7) return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4); return '+' + p.slice(0,1) + ' (' + p.slice(1,4) + ') ' + p.slice(4,7) + '-' + p.slice(7,9) + '-' + p.slice(9); })()} onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (!val.startsWith('7') && val.length > 0) val = '7' + val; if (val.length > 11) val = val.slice(0, 11); setNewCandidate({ ...newCandidate, phone: val }); setPhoneError(''); }} onFocus={(e) => { if (!newCandidate.phone) { setNewCandidate({ ...newCandidate, phone: '7' }); } }} placeholder="+7 (___) ___-__-__" style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required maxLength="18" />{phoneError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{phoneError}</p>}</div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Город *</label><input type="text" value={newCandidate.city} onChange={(e) => setNewCandidate({ ...newCandidate, city: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Образование *</label><input type="text" value={newCandidate.education} onChange={(e) => setNewCandidate({ ...newCandidate, education: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Опыт работы *</label><select value={newCandidate.experience} onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value, previousJob: (e.target.value === 'Без опыта') ? '' : newCandidate.previousJob })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите уровень</option><option value="Без опыта">Без опыта</option><option value="Junior (0-1 год)">Junior (0-1 год)</option><option value="Middle (2-4 года)">Middle (2-4 года)</option><option value="Senior (5+ лет)">Senior (5+ лет)</option></select></div>
            {newCandidate.experience && newCandidate.experience !== 'Без опыта' && <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Предыдущее место работы *</label><input type="text" value={newCandidate.previousJob} onChange={(e) => setNewCandidate({ ...newCandidate, previousJob: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>}
            <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Навыки (через запятую)</label><input type="text" value={newCandidate.skills} onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })} placeholder="Например: Python, SQL, Java" style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} /></div>
            <div style={{ display: 'flex', gap: '12px' }}><button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button><button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить</button></div>
          </form>
        </div>
      </div>
    );
  };

  // --- МОДАЛЬНОЕ ОКНО ПЛАНИРОВАНИЯ СОБЕСЕДОВАНИЯ ---
  const renderScheduleModal = () => {
    if (!showScheduleModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowScheduleModal(false)}>
        <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Запланировать собеседование</h2>
            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>✕</button>
          </div>
          <form onSubmit={handleScheduleSubmit}>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Кандидат *</label><select value={newInterview.candidateId} onChange={(e) => setNewInterview({ ...newInterview, candidateId: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите кандидата</option>{candidates.filter(c => !c.isArchived).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Вакансия *</label><select value={newInterview.vacancyId || ''} onChange={(e) => setNewInterview({ ...newInterview, vacancyId: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите вакансию</option>{vacanciesList.filter(v => !v.isArchived).map((vacancy) => <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>)}</select></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Интервьюер *</label><select value={newInterview.interviewer} onChange={(e) => setNewInterview({ ...newInterview, interviewer: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите интервьюера</option>{users.filter(u => u.role === 'hr').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div style={{ display: 'flex', gap: '12px' }}><div style={{ flex: 1, marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Дата *</label><input type="date" value={newInterview.date} onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div><div style={{ flex: 1, marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Время *</label><input type="time" value={newInterview.time} onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><button type="button" onClick={() => setShowScheduleModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button><button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Запланировать</button></div>
          </form>
        </div>
      </div>
    );
  };

  // --- МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ВАКАНСИИ ---
  const renderVacancyModal = () => {
    if (!showVacancyModal) return null;
    const availableSkills = getAvailableSkills();
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowVacancyModal(false)}>
        <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{editingVacancyId ? 'Редактировать вакансию' : 'Добавить вакансию'}</h2>
            <button onClick={() => setShowVacancyModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>✕</button>
          </div>
          <form onSubmit={handleSaveVacancy}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Название вакансии *</label>
              <input type="text" value={vacancyFormData.title} onChange={(e) => setVacancyFormData({ ...vacancyFormData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Описание *</label>
              <textarea value={vacancyFormData.description} onChange={(e) => setVacancyFormData({ ...vacancyFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Требования</label>
              <textarea value={vacancyFormData.requirements} onChange={(e) => setVacancyFormData({ ...vacancyFormData, requirements: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Необходимые компетенции *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', minHeight: '40px' }}>
                {availableSkills.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleSkillToggle(comp.id)}
                    style={{
                      padding: '4px 12px',
                      background: (vacancyFormData.requiredSkills || []).includes(comp.id) ? '#333F50' : 'transparent',
                      border: '1px solid ' + ((vacancyFormData.requiredSkills || []).includes(comp.id) ? '#333F50' : '#6A7787'),
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { if (!(vacancyFormData.requiredSkills || []).includes(comp.id)) e.target.style.borderColor = '#4A5A70'; }}
                    onMouseLeave={(e) => { if (!(vacancyFormData.requiredSkills || []).includes(comp.id)) e.target.style.borderColor = '#6A7787'; }}
                  >
                    {comp.name}
                  </button>
                ))}
                {availableSkills.length === 0 && (
                  <span style={{ color: '#6A7787', fontSize: '13px' }}>Нет доступных навыков. Добавьте их в Матрице компетенций.</span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Статус</label>
              <select value={vacancyFormData.status} onChange={(e) => setVacancyFormData({ ...vacancyFormData, status: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                <option value="Активна">Активна</option>
                <option value="Закрыта">Закрыта</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowVacancyModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{editingVacancyId ? 'Сохранить' : 'Добавить'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ================================================================
  // КАРТОЧКА СОБЕСЕДОВАНИЯ
  // ================================================================
  const renderInterviewCard = () => {
    if (!selectedInterview) return null;
    const matrix = selectedInterview.matrix || [];
    const skills = matrix.length > 0
      ? matrix.map(m => m.competencyName)
      : ['Навык 1', 'Навык 2', 'Навык 3'];
    const isConcluded = selectedInterview.status === 'Проведено' || selectedInterview.status === 'Отменено';
    const canEditMatrix = selectedInterview.status === 'Запланировано' && hasPermission('matrix.edit');
    const renderStars = (skillIndex) => {
      const rating = matrix[skillIndex]?.score || 0;
      const stars = [];
      for (let i = 0; i < 5; i++) {
        const isFilled = i < rating;
        stars.push(<span key={i} style={{ fontSize: '24px', cursor: canEditMatrix ? 'pointer' : 'default', userSelect: 'none', color: isFilled ? '#7F7B6D' : '#3A3F4A', textShadow: isFilled ? 'none' : '0 0 0 1px #7F7B6D', transition: 'color 0.2s, transform 0.2s', display: 'inline-block', margin: '0 2px', opacity: canEditMatrix ? 1 : 0.5 }} onClick={() => canEditMatrix && handleStarClickInterview(skillIndex, i)} onMouseEnter={(e) => { if (canEditMatrix) e.target.style.transform = 'scale(1.2)'; }} onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}>★</span>);
      }
      return stars;
    };
    const getStatusColor = (status) => { switch(status) { case 'Запланировано': return '#7F7B6D'; case 'Проведено': return '#3E503A'; case 'Отменено': return '#4E1717'; default: return '#6A7787'; } };
    return (
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => { setShowInterviewCard(false); setSelectedInterview(null); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '14px', cursor: 'pointer', padding: '8px 0', marginBottom: '24px', fontFamily: "'Unbounded', sans-serif" }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>← Назад к списку собеседований</button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '24px' }}>Собеседование: {selectedInterview.candidateName}</h1>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Информация о собеседовании</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Кандидат:</span><span style={{ color: '#ffffff' }}>{selectedInterview.candidateName}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Вакансия:</span><span style={{ color: '#ffffff' }}>{selectedInterview.vacancy}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Интервьюер:</span><span style={{ color: '#ffffff' }}>{selectedInterview.interviewer}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Дата:</span><span style={{ color: '#ffffff' }}>{formatDateTime(selectedInterview.date + 'T' + selectedInterview.time)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Статус:</span><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getStatusColor(selectedInterview.status) }}>{selectedInterview.status}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6A7787' }}>Решение:</span><span style={{ color: '#ffffff' }}>{selectedInterview.decision || '—'}</span></div>
              </div>
            </div>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Комментарии{isConcluded && <span style={{ fontSize: '12px', color: '#6A7787', marginLeft: '8px' }}>(только просмотр)</span>}</h3>
              <textarea value={selectedInterview.comments || ''} onChange={(e) => { setInterviewComments(e.target.value); setSelectedInterview({ ...selectedInterview, comments: e.target.value }); }} onBlur={saveComment} disabled={isConcluded} placeholder={isConcluded ? 'Комментарий сохранён' : 'Введите комментарий к собеседованию...'} style={{ width: '100%', padding: '12px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: "'Unbounded', sans-serif", boxSizing: 'border-box', opacity: isConcluded ? 0.6 : 1 }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Оценка компетенций{!canEditMatrix && <span style={{ fontSize: '12px', color: '#6A7787', marginLeft: '8px' }}>(только просмотр)</span>}</h3>
              {skills.map((skill, index) => (<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < skills.length - 1 ? '1px solid #2A3344' : 'none' }}><span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{skill}</span><div style={{ display: 'flex', gap: '4px' }}>{renderStars(index)}</div></div>))}
            </div>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Действия</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Завершить / Отменить — только для Запланировано */}
                {selectedInterview.status === 'Запланировано' && hasPermission('interviews.edit') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => {
                      const matrix = selectedInterview.matrix || [];
                      const allRated = matrix.length > 0 && matrix.every(m => m.score > 0);
                      const comment = interviewComments || selectedInterview?.comments || '';
                      if (!allRated) { alert('Оцените все компетенции звёздами перед завершением.'); return; }
                      if (!comment.trim()) { alert('Добавьте комментарий перед завершением.'); return; }
                      if (window.confirm('Завершить собеседование? Статус изменится на "Проведено".')) handleDecision(selectedInterview.id, 'Ожидает');
                    }} style={{ padding: '10px 16px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Завершить</button>
                    <button onClick={() => { if (window.confirm('Отменить собеседование? Статус изменится на "Отменено".')) handleDecision(selectedInterview.id, 'Без решения'); }} style={{ padding: '10px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Отменить</button>
                  </div>
                )}
                {/* Решения — только для Проведено + Ожидает */}
                {selectedInterview.status === 'Проведено' && selectedInterview.decision === 'Ожидает' && hasPermission('interviews.decide') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => handleDecision(selectedInterview.id, 'Принят')} style={{ padding: '10px 16px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Нанять</button>
                    <button onClick={() => handleDecision(selectedInterview.id, 'Отказан')} style={{ padding: '10px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Отклонить</button>
                    <button onClick={() => handleDecision(selectedInterview.id, 'Следующий этап')} style={{ padding: '10px 16px', background: '#0891b2', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#06b6d4'} onMouseLeave={(e) => e.target.style.background = '#0891b2'}>Следующий этап</button>
                    <button onClick={() => handleDecision(selectedInterview.id, 'Кадровый резерв')} style={{ padding: '10px 16px', background: '#854d0e', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#a16207'} onMouseLeave={(e) => e.target.style.background = '#854d0e'}>Кадровый резерв</button>
                  </div>
                )}
                {/* Разделитель перед скачиванием */}
                <div style={{ borderTop: '1px solid #2A3344', margin: '4px 0' }} />
                {/* Удаление */}
                {hasPermission('interviews.delete') && <button onClick={() => handleDeleteInterview(selectedInterview.id)} style={{ padding: '10px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить собеседование</button>}
                {/* Скачивание PDF */}
                <button onClick={() => pdfGenerate('Карточка кандидата', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать карточку кандидата</button>
                <button onClick={() => pdfGenerate('Протокол собеседования', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать протокол собеседования</button>
                <button onClick={() => pdfGenerate('Письмо о решении', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать письмо о решении</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- СТРАНИЦА СОБЕСЕДОВАНИЙ ---
  const renderInterviewsPage = () => {
    const filteredInterviews = getFilteredInterviews();
    const getStatusColor = (status) => { switch(status) { case 'Запланировано': return '#7F7B6D'; case 'Проведено': return '#3E503A'; case 'Отменено': return '#4E1717'; default: return '#6A7787'; } };
    const getDecisionColor = (decision) => { switch(decision) { case 'Принят': return '#3E503A'; case 'Отказан': return '#4E1717'; case 'Ожидает': return '#7F7B6D'; case 'Без решения': return '#4E1717'; case 'Следующий этап': return '#0891b2'; case 'Кадровый резерв': return '#854d0e'; default: return '#6A7787'; } };
    const isHRorAdmin = hasPermission('interviews.create') || hasPermission('interviews.edit');
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Собеседования</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {interviews.length}</span>
            <span style={{ fontSize: '14px', color: '#3b82f6' }}>Сегодня: {interviews.filter(i => i.date === today && !i.isArchived).length}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isHRorAdmin && <button onClick={() => setShowScheduleModal(true)} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Запланировать собеседование</button>}
            <button onClick={() => setShowArchivedInterviews(!showArchivedInterviews)} style={{ padding: '8px 20px', background: showArchivedInterviews ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedInterviews ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedInterviews ? '#3E503A' : '#333F50'}>{showArchivedInterviews ? 'Скрыть архив' : 'Показать архив'}</button>
          </div>
        </div>
        <SearchFilter
          searchQuery={searchQueryInterviews}
          setSearchQuery={setSearchQueryInterviews}
          placeholder="Поиск по кандидату, вакансии, интервьюеру..."
          filters={[
            { key: 'date', type: 'date', label: 'Дата собеседования' },
            { key: 'status', type: 'select', label: 'Статус', options: statuses.slice(1) },
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
              { value: 'alphabet', label: 'По алфавиту' },
            ]},
          ]}
          activeFilters={{
            dateFrom: dateFilterFrom, dateTo: dateFilterTo,
            status: Array.isArray(statusFilter) ? statusFilter : (statusFilter && statusFilter !== 'Все' ? [statusFilter] : []),
            sort: [interviewSortOption],
          }}
          setFilter={(key, val) => {
            if (key === 'dateFrom') setDateFilterFrom(val);
            else if (key === 'dateTo') setDateFilterTo(val);
            else if (key === 'status') setStatusFilter(val);
            else if (key === 'sort') setInterviewSortOption(val.length > 0 ? val[0] : 'newest');
          }}
          clearAllFilters={() => { setDateFilterFrom(''); setDateFilterTo(''); setStatusFilter([]); setSearchQueryInterviews(''); setInterviewSortOption('newest'); }}
          totalCount={interviews.length}
          filteredCount={filteredInterviews.length}
        />

        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead style={{ background: '#11171F' }}><tr><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Кандидат</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вакансия</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Интервьюер</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Дата</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Время</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Статус</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Решение</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действия</th></tr></thead>
            <tbody>
              {filteredInterviews.length > 0 ? filteredInterviews.map((interview) => {
                const isReshala = userRole === 'reshala';
                const isAdmin = userRole === 'admin';
                const canDecide = (isReshala || isAdmin) && interview.status === 'Проведено' && interview.decision === 'Ожидает';
                const isToday = interview.date === today;
                return (<tr key={interview.id} style={{ borderTop: '1px solid #2A3344', opacity: interview.isArchived ? 0.6 : 1, background: isToday && !interview.isArchived ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{interview.candidateName}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{interview.vacancy}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <select value={editInterviewData.interviewer} onChange={(e) => setEditInterviewData({ ...editInterviewData, interviewer: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }}>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select> : interview.interviewer}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <input type="date" value={editInterviewData.date} onChange={(e) => setEditInterviewData({ ...editInterviewData, date: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }} /> : formatDate(interview.date)}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <input type="time" value={editInterviewData.time} onChange={(e) => setEditInterviewData({ ...editInterviewData, time: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }} /> : interview.time}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getStatusColor(interview.status) }}>{interview.status}</span></td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getDecisionColor(interview.decision) }}>{interview.decision}</span></td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      {!interview.isArchived && <button onClick={() => openInterviewCard(interview)} style={{ padding: '4px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Открыть карточку</button>}
                      {hasPermission('interviews.edit') && editingInterviewId !== interview.id && !interview.isArchived && <button onClick={() => startEditInterview(interview)} style={{ padding: '4px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                      {editingInterviewId === interview.id && (<><button onClick={saveEditInterview} style={{ padding: '4px 16px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Сохранить</button><button onClick={cancelEditInterview} style={{ padding: '4px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Отмена</button></>)}
                      {isHRorAdmin && editingInterviewId !== interview.id && <button onClick={() => interview.isArchived ? handleUnarchiveInterview(interview.id) : handleArchiveInterview(interview.id)} style={{ padding: '4px 16px', background: interview.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = interview.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = interview.isArchived ? '#3E503A' : '#333F50'}>{interview.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
                      {hasPermission('interviews.delete') && editingInterviewId !== interview.id && <button onClick={() => handleDeleteInterview(interview.id)} style={{ padding: '4px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
                    </div>
                  </td>
                </tr>);
              }) : <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>Нет собеседований</td></tr>}
            </tbody>
          </table>
        </div>
        {renderScheduleModal()}
      </div>
    );
  };

  // --- ВЫЧИСЛЕНИЕ СТАТУСА КАНДИДАТА ---
  const getCandidateStatus = (candidateId) => {
    const candidateInterviews = interviews.filter(i => i.candidateId === candidateId && !i.isArchived);
    if (candidateInterviews.length === 0) return 'Активен';

    const statuses = candidateInterviews.map(i => ({ status: i.status, decision: i.decision, archived: i.isArchived }));
    const concluded = statuses.filter(i => i.status === 'Проведено');
    const pending = statuses.filter(i => i.status === 'Запланировано');

    const hasHired = concluded.some(i => i.decision === 'Принят');
    const hasTalentPool = concluded.some(i => i.decision === 'Кадровый резерв');
    const allRejectedOrNext = concluded.length > 0 && concluded.every(i => i.decision === 'Отказан' || i.decision === 'Без решения' || i.decision === 'Следующий этап');

    if (hasHired) return 'Нанят';
    if (hasTalentPool) return 'В кадровом резерве';
    if (pending.length > 0) {
      if (allRejectedOrNext || concluded.length === 0) return 'Ожидает собеседования';
      return 'Ожидает решения';
    }
    if (allRejectedOrNext) return 'Ожидает собеседования';
    if (concluded.length > 0 && concluded.every(i => i.decision === 'Отказан' || i.decision === 'Без решения')) return 'Отклонён';
    return 'Активен';
  };

  const CANDIDATE_STATUS_COLORS = {
    'Активен': { bg: '#3E503A', text: '#ffffff' },
    'Ожидает собеседования': { bg: '#7F7B6D', text: '#ffffff' },
    'Ожидает решения': { bg: '#0891b2', text: '#ffffff' },
    'Нанят': { bg: '#065f46', text: '#ffffff' },
    'В кадровом резерве': { bg: '#1d4ed8', text: '#ffffff' },
    'Отклонён': { bg: '#4E1717', text: '#ffffff' },
  };

  // --- СТРАНИЦА КАНДИДАТОВ ---
  const renderCandidatesPage = () => {
    const filteredCandidates = getFilteredCandidates();
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Кандидаты</h1><span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {candidates.length}</span></div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {hasPermission('candidates.create') && <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить кандидата</button>}
            <button onClick={() => setShowArchivedCandidates(!showArchivedCandidates)} style={{ padding: '8px 20px', background: showArchivedCandidates ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedCandidates ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedCandidates ? '#3E503A' : '#333F50'}>{showArchivedCandidates ? 'Скрыть архив' : 'Показать архив'}</button>
          </div>
        </div>
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Поиск по имени, телефону, вакансии..."
          filters={[
            { key: 'candidateStatus', type: 'select', label: 'Статус', options: ['Активен', 'Ожидает собеседования', 'Ожидает решения', 'Нанят', 'В кадровом резерве', 'Отклонён'] },
            { key: 'experience', type: 'select', label: 'Опыт работы', options: ['Junior (0-1 год)', 'Middle (2-4 года)', 'Senior (5+ лет)'] },
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
              { value: 'alphabet', label: 'По алфавиту' },
            ]},
          ]}
          activeFilters={{
            sort: Array.isArray(sortOption) ? sortOption : [sortOption],
            candidateStatus: Array.isArray(candidateStatusFilter) ? candidateStatusFilter : (candidateStatusFilter && candidateStatusFilter !== 'Все' ? [candidateStatusFilter] : []),
            experience: Array.isArray(experienceFilter) ? experienceFilter : (experienceFilter && experienceFilter !== 'Все' ? [experienceFilter] : []),
          }}
          setFilter={(key, val) => {
            if (key === 'sort') setSortOption(val.length > 0 ? val[0] : 'newest');
            else if (key === 'candidateStatus') setCandidateStatusFilter(val);
            else if (key === 'experience') setExperienceFilter(val);
          }}
          clearAllFilters={() => { setSortOption('newest'); setSearchQuery(''); setCandidateStatusFilter([]); setExperienceFilter([]); }}
          totalCount={candidates.length}
          filteredCount={filteredCandidates.length}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCandidates.map((candidate) => {
            const candidateStatus = getCandidateStatus(candidate.id);
            const statusColor = CANDIDATE_STATUS_COLORS[candidateStatus] || CANDIDATE_STATUS_COLORS['Активен'];
            return (<div key={candidate.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#171D24', borderRadius: '12px', transition: 'all 0.2s', opacity: candidate.isArchived ? 0.6 : 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{candidate.name}</h3>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}>{candidateStatus}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#6A7787' }}>{formatPhone(candidate.phone)}</span>
                {candidate.city && <span style={{ fontSize: '13px', color: '#6A7787' }}>{candidate.city}</span>}
                {candidate.experience && <span style={{ fontSize: '13px', color: '#6A7787' }}>{candidate.experience}</span>}
                {candidate.vacancy && <span style={{ fontSize: '13px', color: '#6A7787' }}>{candidate.vacancy}</span>}
                {candidate.createdAt && <span style={{ fontSize: '12px', color: '#4a5568' }}>с {formatDate(candidate.createdAt)}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!candidate.isArchived && <button onClick={() => { setSelectedCandidate(candidate); setRatings(candidate.ratings || {}); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '12px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>Перейти к карточке</button>}
              {hasPermission('candidates.archive') && <button onClick={() => handleArchiveCandidate(candidate.id)} style={{ background: 'none', border: 'none', color: candidate.isArchived ? '#3E503A' : '#6A7787', fontSize: '12px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = candidate.isArchived ? '#4A6A4A' : '#ffffff'} onMouseLeave={(e) => e.target.style.color = candidate.isArchived ? '#3E503A' : '#6A7787'}>{candidate.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
            </div>
          </div>);
          })}
        </div>
        {renderAddModal()}
      </div>
    );
  };

  // --- СТРАНИЦА МАТРИЦА КОМПЕТЕНЦИЙ ---
  const renderMatrixPage = () => {
    const filteredCompetencies = getFilteredCompetencies();
    const filterCategories = ['Все', ...categories];

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Компетенции</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {competencies.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {hasPermission('competencies.create') && <button onClick={openAddCompetencyModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить компетенцию</button>}
            <button onClick={() => setShowArchivedCompetencies(!showArchivedCompetencies)} style={{ padding: '8px 20px', background: showArchivedCompetencies ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedCompetencies ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedCompetencies ? '#3E503A' : '#333F50'}>{showArchivedCompetencies ? 'Скрыть архив' : 'Показать архив'}</button>
          </div>
        </div>

        <SearchFilter
          searchQuery={searchQueryCompetencies}
          setSearchQuery={setSearchQueryCompetencies}
          placeholder="Поиск по названию или описанию..."
          filters={[
            { key: 'category', type: 'select', label: 'Категория', options: categories },
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'alphabet', label: 'По алфавиту А-Я' },
              { value: 'reverse', label: 'По алфавиту Я-А' },
              { value: 'category', label: 'По категории' },
            ]},
          ]}
          activeFilters={{ category: Array.isArray(categoryFilter) ? categoryFilter : (categoryFilter && categoryFilter !== 'Все' ? [categoryFilter] : []), sort: [competencySortOption] }}
          setFilter={(key, val) => {
            if (key === 'category') setCategoryFilter(val);
            else if (key === 'sort') setCompetencySortOption(val.length > 0 ? val[0] : 'newest');
          }}
          clearAllFilters={() => { setCategoryFilter([]); setSearchQueryCompetencies(''); setCompetencySortOption('newest'); }}
          totalCount={competencies.length}
          filteredCount={filteredCompetencies.length}
        />

        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead style={{ background: '#11171F' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Навык</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категория</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Описание</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Макс. балл</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Статус</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetencies.length > 0 ? (
                filteredCompetencies.map((comp) => (
                  <tr key={comp.id} style={{ borderTop: '1px solid #2A3344', opacity: comp.isActive ? 1 : 0.6 }}>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{comp.name}</td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: getCategoryColor(comp.category), color: getCategoryTextColor(comp.category) }}>
                        {comp.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '13px', maxWidth: '300px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      {comp.description}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{comp.maxScore}</td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: comp.isArchived ? '#4E1717' : '#3E503A', color: '#ffffff' }}>
                        {comp.isArchived ? 'Архивирован' : 'Активен'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {!comp.isArchived && hasPermission('competencies.edit') && <button onClick={() => openEditCompetencyModal(comp)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                        {hasPermission('competencies.archive') && <button onClick={() => handleArchiveCompetency(comp.id)} style={{ padding: '4px 12px', background: comp.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = comp.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = comp.isArchived ? '#3E503A' : '#333F50'}>{comp.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
                        {!comp.isArchived && hasPermission('competencies.delete') && <button onClick={() => handleDeleteCompetency(comp.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>Компетенции не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {showCompetencyModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowCompetencyModal(false)}>
            <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{editingCompetencyId ? 'Редактировать компетенцию' : 'Добавить компетенцию'}</h2>
                <button onClick={() => setShowCompetencyModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>✕</button>
              </div>
              <form onSubmit={handleSaveCompetency}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Название навыка *</label>
                  <input type="text" value={competencyFormData.name} onChange={(e) => setCompetencyFormData({ ...competencyFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Категория *</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={competencyFormData.category}
                      onChange={(e) => {
                        setCompetencyFormData({ ...competencyFormData, category: e.target.value });
                        if (e.target.value === 'новый') {
                          setShowNewCategoryInput(true);
                        } else {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }
                      }}
                      style={{ flex: 1, padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="новый">+ Создать новую категорию</option>
                    </select>
                  </div>
                  {showNewCategoryInput && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        placeholder="Название новой категории"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        style={{ padding: '8px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        onMouseEnter={(e) => e.target.style.background = '#4A5A70'}
                        onMouseLeave={(e) => e.target.style.background = '#333F50'}
                      >
                        Добавить
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Описание *</label>
                  <textarea value={competencyFormData.description} onChange={(e) => setCompetencyFormData({ ...competencyFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} required />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Максимальный балл *</label>
                  <input type="number" min="1" max="5" value={competencyFormData.maxScore} onChange={(e) => setCompetencyFormData({ ...competencyFormData, maxScore: Number(e.target.value) })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowCompetencyModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{editingCompetencyId ? 'Сохранить' : 'Добавить'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- СТРАНИЦА ВАКАНСИЙ ---
  const renderVacanciesPage = () => {
    const filteredVacancies = getFilteredVacancies();

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Вакансии</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {vacanciesList.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {hasPermission('vacancies.create') && <button onClick={openAddVacancyModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>
              Добавить вакансию
            </button>}
            <button onClick={() => setShowArchivedVacancies(!showArchivedVacancies)} style={{ padding: '8px 20px', background: showArchivedVacancies ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedVacancies ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedVacancies ? '#3E503A' : '#333F50'}>
              {showArchivedVacancies ? 'Скрыть архив' : 'Показать архив'}
            </button>
          </div>
        </div>

        <SearchFilter
          searchQuery={searchQueryVacancies}
          setSearchQuery={setSearchQueryVacancies}
          placeholder="Поиск по названию или описанию..."
          filters={[
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
              { value: 'alphabet', label: 'По алфавиту' },
            ]},
          ]}
          activeFilters={{ sort: [vacancySortOption] }}
          setFilter={(key, val) => { if (key === 'sort') setVacancySortOption(val.length > 0 ? val[0] : 'newest'); }}
          clearAllFilters={() => { setSearchQueryVacancies(''); setVacancySortOption('newest'); }}
          totalCount={vacanciesList.length}
          filteredCount={filteredVacancies.length}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredVacancies.map((vacancy) => (
            <div key={vacancy.id} style={{ background: '#171D24', borderRadius: '12px', padding: '24px', border: vacancy.isArchived ? '1px solid #4E1717' : '1px solid #2A3344', opacity: vacancy.isArchived ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>{vacancy.title}</h2>
                    <span style={{ padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: vacancy.status === 'Активна' ? '#3E503A' : '#4E1717', color: '#ffffff', display: 'inline-block' }}>
                      {vacancy.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6A7787', marginTop: '4px' }}>{vacancy.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!vacancy.isArchived && hasPermission('vacancies.edit') && <button onClick={() => openEditVacancyModal(vacancy)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                  {hasPermission('vacancies.archive') && <button onClick={() => handleArchiveVacancy(vacancy.id)} style={{ padding: '4px 12px', background: vacancy.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = vacancy.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = vacancy.isArchived ? '#3E503A' : '#333F50'}>{vacancy.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
                  {!vacancy.isArchived && hasPermission('vacancies.delete') && <button onClick={() => handleDeleteVacancy(vacancy.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#6A7787' }}>Необходимые компетенции:</span>
                  {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 ? (
                    vacancy.requiredSkills.map((skillId, idx) => {
                      const comp = competencies.find(c => c.id === skillId);
                      const name = comp ? comp.name : skillId;
                      return <span key={idx} style={{ padding: '4px 12px', background: '#11171F', borderRadius: '6px', fontSize: '12px', color: '#ffffff', border: '1px solid #6A7787' }}>{name}</span>;
                    })
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6A7787' }}>Компетенции не указаны</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleRequirements(vacancy.id)}
                style={{
                  marginTop: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: "'Unbounded', sans-serif",
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
              >
                {expandedVacancyId === vacancy.id ? '▲ Скрыть требования' : '▼ Требования'}
              </button>

              {expandedVacancyId === vacancy.id && (
                <div style={{ marginTop: '12px', padding: '16px', background: '#11171F', borderRadius: '8px', border: '1px solid #2A3344' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>Требования к кандидату:</h4>
                  <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{vacancy.requirements || 'Требования не указаны'}</p>
                </div>
              )}
            </div>
          ))}
          {filteredVacancies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>Вакансии не найдены</div>
          )}
        </div>

        {renderVacancyModal()}
      </div>
    );
  };

  // --- СТРАНИЦА АРХИВ ---
  const renderArchivePage = () => {
    const archivedCandidates = candidates.filter(c => c.isArchived);
    const archivedInterviews = interviews.filter(i => i.isArchived);
    const archivedCompetencies = competencies.filter(c => c.isArchived);
    const totalCount = archivedCandidates.length + archivedInterviews.length + archivedCompetencies.length;
    
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Архив</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего в архиве: {totalCount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Архивированные кандидаты */}
          <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Кандидаты в архиве ({archivedCandidates.length})
            </h2>
            {archivedCandidates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {archivedCandidates.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: '500' }}>{c.name}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{c.vacancy}</span>
                    </div>
                    {hasPermission('candidates.archive') && <button
                      onClick={() => handleArchiveCandidate(c.id)}
                      style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = '#4A6A4A'}
                      onMouseLeave={(e) => e.target.style.background = '#3E503A'}
                    >
                      Разархивировать
                    </button>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных кандидатов</p>
            )}
          </div>

          {/* Архивированные собеседования */}
          <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Собеседования в архиве ({archivedInterviews.length})
            </h2>
            {archivedInterviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {archivedInterviews.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: '500' }}>{i.candidateName}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{formatDate(i.date)}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{i.status}</span>
                    </div>
                    {hasPermission('interviews.archive') && <button
                      onClick={() => handleUnarchiveInterview(i.id)}
                      style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = '#4A6A4A'}
                      onMouseLeave={(e) => e.target.style.background = '#3E503A'}
                    >
                      Разархивировать
                    </button>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных собеседований</p>
            )}
          </div>

          {/* Архивированные компетенции */}
          <div style={{ flex: 1, minWidth: '300px', background: '#171D24', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Компетенции в архиве ({archivedCompetencies.length})
            </h2>
            {archivedCompetencies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {archivedCompetencies.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#11171F', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: '500' }}>{c.name}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{c.category}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>до {c.maxScore} баллов</span>
                    </div>
                    {hasPermission('competencies.archive') && <button
                      onClick={() => handleArchiveCompetency(c.id)}
                      style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = '#4A6A4A'}
                      onMouseLeave={(e) => e.target.style.background = '#3E503A'}
                    >
                      Разархивировать
                    </button>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных компетенций</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- СТРАНИЦА ЖУРНАЛ ИЗМЕНЕНИЙ ---
  const renderLogsPage = () => {
    const filteredLogs = getFilteredLogs();
    const uniqueAreas = getUniqueAreas();
    const uniqueActions = getUniqueActions();

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Журнал изменений</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего записей: {logs.length}</span>
          </div>
          {userRole !== 'admin' && (
            <span style={{ padding: '8px 16px', color: '#6A7787', fontSize: '13px', border: '1px solid #6A7787', borderRadius: '8px' }}>
              Показаны только ваши действия
            </span>
          )}
        </div>

        <SearchFilter
          searchQuery={searchQueryLogs}
          setSearchQuery={setSearchQueryLogs}
          placeholder="Поиск по деталям, пользователю или ID объекта..."
          filters={[
            { key: 'area', type: 'select', label: 'Область', options: uniqueAreas },
            { key: 'action', type: 'select', label: 'Действие', options: uniqueActions },
            { key: 'date', type: 'date', label: 'Дата' },
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
            ]},
          ]}
          activeFilters={{
            area: Array.isArray(areaFilter) ? areaFilter : (areaFilter && areaFilter !== 'Все' ? [areaFilter] : []),
            action: Array.isArray(actionFilter) ? actionFilter : (actionFilter && actionFilter !== 'Все' ? [actionFilter] : []),
            sort: [logsSortOption],
          }}
          setFilter={(key, val) => {
            if (key === 'area') setAreaFilter(val);
            else if (key === 'action') setActionFilter(val);
            else if (key === 'sort') setLogsSortOption(val.length > 0 ? val[0] : 'newest');
          }}
          clearAllFilters={() => { setSearchQueryLogs(''); setAreaFilter([]); setActionFilter([]); setLogsSortOption('newest'); }}
          totalCount={logs.length}
          filteredCount={filteredLogs.length}
        />

        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ background: '#11171F' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Дата и время</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Область</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действие</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID объекта</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Пользователь</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Детали</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderTop: '1px solid #2A3344' }}>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '13px' }}>{log.date}</td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '13px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: areaColors[log.area] || '#6A7787', color: '#1e293b' }}>
                        {log.area}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '13px' }}>{log.action}</td>
                    <td style={{ padding: '12px 16px', color: '#6A7787', fontSize: '13px', fontWeight: '600' }}>{log.objectId}</td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '13px' }}>{log.user}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '13px' }}>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>
                    {logs.length === 0 ? 'Журнал пуст. Начните выполнять действия для заполнения.' : 'Записи не найдены'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- СТРАНИЦА ПОЛЬЗОВАТЕЛИ ---
  const renderUsersPage = () => {
    const filteredUsers = getFilteredUsers();

    const openAddRoleModal = () => {
      setEditingRoleId(null);
      setRoleFormData({ name: '', color: '#dbeafe', textColor: '#1d4ed8', permissions: [] });
      setShowRoleModal(true);
    };

    const openEditRoleModal = (role) => {
      setEditingRoleId(role.id);
      setRoleFormData({ name: role.name, color: role.color, textColor: role.textColor, permissions: [...role.permissions] });
      setShowRoleModal(true);
    };

    const handleSaveRole = (e) => {
      e.preventDefault();
      if (editingRoleId) {
        setRoles(roles.map(r => r.id === editingRoleId ? { ...r, name: roleFormData.name, color: roleFormData.color, textColor: roleFormData.textColor, permissions: roleFormData.permissions } : r));
      } else {
        const newId = roleFormData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        setRoles([...roles, { id: newId, name: roleFormData.name, color: roleFormData.color, textColor: roleFormData.textColor, permissions: roleFormData.permissions }]);
      }
      setShowRoleModal(false);
    };

    const handleDeleteRole = (roleId) => {
      if (window.confirm('Вы уверены, что хотите удалить эту роль?')) {
        setRoles(roles.filter(r => r.id !== roleId));
      }
    };

    const toggleRolePermission = (perm) => {
      const current = roleFormData.permissions;
      setRoleFormData({
        ...roleFormData,
        permissions: current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm]
      });
    };

    const toggleGroupPermissions = (groupPerms) => {
      const allSelected = groupPerms.every(p => roleFormData.permissions.includes(p));
      if (allSelected) {
        setRoleFormData({ ...roleFormData, permissions: roleFormData.permissions.filter(p => !groupPerms.includes(p)) });
      } else {
        setRoleFormData({ ...roleFormData, permissions: [...new Set([...roleFormData.permissions, ...groupPerms])] });
      }
    };

    // --- ВКЛАДКА РОЛИ И ПРАВА ---
    if (usersTab === 'roles') {
      return (
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Роли и права</h1>
              <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {roles.length}</span>
            </div>
            {hasPermission('users.create') && <button onClick={openAddRoleModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить роль</button>}
          </div>

          {/* Табы */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #2A3344' }}>
            <button onClick={() => setUsersTab('users')} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: usersTab === 'users' ? '2px solid #ffffff' : '2px solid transparent', color: usersTab === 'users' ? '#ffffff' : '#6A7787', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}>Пользователи</button>
            <button onClick={() => setUsersTab('roles')} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: usersTab === 'roles' ? '2px solid #ffffff' : '2px solid transparent', color: usersTab === 'roles' ? '#ffffff' : '#6A7787', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}>Роли и права</button>
          </div>

          {/* Список ролей */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roles.map((role) => (
              <div key={role.id} style={{ background: '#171D24', borderRadius: '12px', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', background: role.color, color: role.textColor }}>{role.name}</span>
                    <span style={{ fontSize: '13px', color: '#6A7787' }}>{role.permissions.length} прав</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {hasPermission('users.edit') && <button onClick={() => openEditRoleModal(role)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                    {hasPermission('users.delete') && <button onClick={() => handleDeleteRole(role.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {role.permissions.map((perm) => (
                    <span key={perm} style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', background: '#11171F', color: '#6A7787', border: '1px solid #2A3344' }}>{permissionLabels[perm] || perm}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Модальное окно роли */}
          {showRoleModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowRoleModal(false)}>
              <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{editingRoleId ? 'Редактировать роль' : 'Добавить роль'}</h2>
                  <button onClick={() => setShowRoleModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787' }}>✕</button>
                </div>
                <form onSubmit={handleSaveRole}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Название роли *</label>
                    <input type="text" value={roleFormData.name} onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Цвет фона</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['#dbeafe', '#d1fae5', '#fef3c7', '#fce7f3', '#e0e7ff', '#fee2e2', '#f1f5f9'].map(c => (
                        <button key={c} type="button" onClick={() => setRoleFormData({ ...roleFormData, color: c })} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: roleFormData.color === c ? '3px solid #ffffff' : '3px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '8px' }}>Права доступа</label>
                    {Object.entries(permissionGroups).map(([groupName, groupPerms]) => (
                      <div key={groupName} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }} onClick={() => toggleGroupPermissions(groupPerms)}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #6A7787', background: groupPerms.every(p => roleFormData.permissions.includes(p)) ? '#333F50' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ffffff' }}>
                            {groupPerms.every(p => roleFormData.permissions.includes(p)) && '✓'}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{groupName}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '26px' }}>
                          {groupPerms.map((perm) => (
                            <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '3px 8px', borderRadius: '6px', background: roleFormData.permissions.includes(perm) ? '#333F50' : 'transparent', border: '1px solid ' + (roleFormData.permissions.includes(perm) ? '#4A5A70' : '#2A3344'), transition: 'all 0.15s' }} onClick={() => toggleRolePermission(perm)}>
                              <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1.5px solid ' + (roleFormData.permissions.includes(perm) ? '#ffffff' : '#6A7787'), background: roleFormData.permissions.includes(perm) ? '#4A5A70' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#ffffff' }}>
                                {roleFormData.permissions.includes(perm) && '✓'}
                              </div>
                              <span style={{ fontSize: '11px', color: '#ffffff' }}>{permissionLabels[perm]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setShowRoleModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Отмена</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Сохранить</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // --- ВКЛАДКА ПОЛЬЗОВАТЕЛИ ---
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Пользователи</h1><span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {users.length}</span></div>
          {hasPermission('users.create') && <button onClick={openAddUserModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить пользователя</button>}
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #2A3344' }}>
          <button onClick={() => setUsersTab('users')} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: usersTab === 'users' ? '2px solid #ffffff' : '2px solid transparent', color: usersTab === 'users' ? '#ffffff' : '#6A7787', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}>Пользователи</button>
          <button onClick={() => setUsersTab('roles')} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: usersTab === 'roles' ? '2px solid #ffffff' : '2px solid transparent', color: usersTab === 'roles' ? '#ffffff' : '#6A7787', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}>Роли и права</button>
        </div>

        <SearchFilter
          searchQuery={searchQueryUsers}
          setSearchQuery={setSearchQueryUsers}
          placeholder="Поиск по имени или логину..."
          filters={[
            { key: 'role', type: 'select', label: 'Роль', options: ['Все', ...roles.map(r => r.name)] },
            { key: 'sort', type: 'sort', label: 'Сортировка', options: [
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
              { value: 'alphabet', label: 'По алфавиту' },
            ]},
          ]}
          activeFilters={{ role: roleFilter }}
          setFilter={(key, val) => {
            if (key === 'role') {
              setRoleFilter(val.length > 0 ? val.map(v => { const r = roles.find(r => r.name === v); return r ? r.id : v; }) : 'Все');
            }
          }}
          clearAllFilters={() => { setSearchQueryUsers(''); setRoleFilter('Все'); }}
          totalCount={users.length}
          filteredCount={filteredUsers.length}
        />
        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead style={{ background: '#11171F' }}><tr><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ФИО</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Логин</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Почта</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Роль</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действия</th></tr></thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const userRoleObj = roles.find(r => r.id === user.role);
                return (<tr key={user.id} style={{ borderTop: '1px solid #2A3344' }}>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>{user.name}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>{user.login}</td>
                  <td style={{ padding: '12px 16px', color: '#6A7787', fontSize: '14px' }}>{user.email || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: userRoleObj?.color || '#6A7787', color: userRoleObj?.textColor || '#ffffff' }}>{userRoleObj?.name || user.role}</span></td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {hasPermission('users.edit') && <button onClick={() => openEditUserModal(user)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                      {hasPermission('users.delete') && <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>}
                    </div>
                  </td>
                </tr>);
              }) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>Пользователи не найдены</td></tr>}
            </tbody>
          </table>
        </div>
        {showUserModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowUserModal(false)}>
            <div style={{ background: '#171D24', padding: '32px', borderRadius: '16px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{editingUserId ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
                <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6A7787', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>✕</button>
              </div>
              <form onSubmit={handleSaveUser}>
                <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>ФИО *</label><input type="text" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
                <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Логин *</label><input type="text" value={userFormData.login} onChange={(e) => setUserFormData({ ...userFormData, login: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
                <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Электронная почта</label><input type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} /></div>
                <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Пароль {editingUserId ? '(оставьте пустым, чтобы не менять)' : '*'}</label><input type="text" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required={!editingUserId} /></div>
                <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Роль *</label><select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                <div style={{ display: 'flex', gap: '12px' }}><button type="button" onClick={() => setShowUserModal(false)} style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button><button type="submit" style={{ flex: 1, padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{editingUserId ? 'Сохранить' : 'Добавить'}</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- ГЛАВНАЯ СТРАНИЦА ---
  const renderDashboardPage = () => {
    const getButtons = () => {
      if (userRole === 'reshala') return ['Список кандидатов', 'Список собеседований', 'Ожидают решения'];
      const btns = [];
      if (hasPermission('candidates.create')) btns.push('Добавить кандидата');
      if (hasPermission('interviews.create')) btns.push('Запланировать собеседование');
      if (hasPermission('vacancies.create')) btns.push('Создать вакансию');
      if (hasPermission('logs.view')) btns.push('Просмотр действий');
      if (hasPermission('users.view')) btns.push('Пользователи');
      return btns;
    };
    
    const todayInterviews = getTodayInterviews();

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Главная</h1>
          <div style={{ background: '#171D24', padding: '12px 24px', borderRadius: '12px' }}>
            <span style={{ fontSize: '16px', color: '#ffffff' }}>Сегодня назначено собеседований: <strong style={{ fontSize: '20px' }}>{getTodayInterviewsCount()}</strong></span>
          </div>
        </div>

        <div style={{ background: '#171D24', padding: '20px 24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {getButtons().map((label, idx) => {
            if (label === 'Добавить кандидата') return <button key={idx} onClick={() => setShowAddModal(true)} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            if (label === 'Запланировать собеседование') return <button key={idx} onClick={() => setShowScheduleModal(true)} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            if (label === 'Создать вакансию') return <button key={idx} onClick={() => openAddVacancyModal()} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            if (label === 'Просмотр действий') return <button key={idx} onClick={() => navigate('logs')} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            if (label === 'Пользователи') return <button key={idx} onClick={() => navigate('users')} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            return <button key={idx} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
          })}
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', background: '#171D24', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>Список кандидатов</h2>
            {candidates.filter(c => !c.isArchived).map((candidate, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#11171F', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{candidate.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6A7787', marginTop: '4px' }}>Вакансия: {candidate.vacancy}</p>
                </div>
                <button onClick={() => { setSelectedCandidate(candidate); setRatings(candidate.ratings || {}); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '12px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>Перейти к карточке →</button>
              </div>
            ))}
            {candidates.filter(c => c.isArchived).length > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center', color: '#6A7787', fontSize: '14px' }}>
                {candidates.filter(c => c.isArchived).length} кандидатов в архиве
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px', background: '#171D24', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
              Собеседования на сегодня ({todayInterviews.length})
            </h2>
            {todayInterviews.length > 0 ? (
              todayInterviews.map((interview) => (
                <div key={interview.id} style={{ padding: '16px 20px', background: '#11171F', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{interview.candidateName}</h3>
                      <p style={{ fontSize: '14px', color: '#6A7787', marginTop: '4px' }}>
                        {formatDateTime(interview.date + 'T' + interview.time)} · {interview.vacancy}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: interview.status === 'Запланировано' ? '#7F7B6D' : '#3E503A', color: '#ffffff' }}>
                      {interview.status}
                    </span>
                  </div>
                  <button
                    onClick={() => openInterviewCard(interview)}
                    style={{ marginTop: '8px', padding: '4px 12px', background: 'none', border: '1px solid #6A7787', borderRadius: '6px', color: '#6A7787', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.target.style.color = '#6A7787'}
                  >
                    Перейти к карточке →
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>На сегодня собеседований нет</p>
            )}
          </div>
        </div>

        {renderAddModal()}
        {renderScheduleModal()}
        {renderVacancyModal()}
      </div>
    );
  };

  // --- МЕНЮ ---
  const menuItems = [
    { path: 'dashboard', label: 'Главная', perm: 'dashboard.view' },
    { path: 'candidates', label: 'Кандидаты', perm: 'candidates.view' },
    { path: 'interviews', label: 'Собеседования', perm: 'interviews.view' },
    { path: 'matrix', label: 'Компетенции', perm: 'competencies.view' },
    { path: 'vacancies', label: 'Вакансии', perm: 'vacancies.view' },
    { path: 'logs', label: 'Журнал изменений', perm: 'logs.view' },
    { path: 'archive', label: 'Архив', perm: 'archive.view' },
    { path: 'deleted', label: 'Удалённое', perm: 'deleted.view' },
  ];
  if (hasPermission('users.view')) {
    menuItems.splice(1, 0, { path: 'users', label: 'Пользователи', perm: 'users.view' });
  }
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.perm));

  // --- РЕНДЕР СТРАНИЦЫ ---
  const renderPage = () => {
    if (showInterviewCard && selectedInterview) return renderInterviewCard();
    if (selectedCandidate) return renderCandidateCard();
    if (currentPage === 'users') return renderUsersPage();
    if (currentPage === 'interviews') return renderInterviewsPage();
    if (currentPage === 'candidates') return renderCandidatesPage();
    if (currentPage === 'matrix') return renderMatrixPage();
    if (currentPage === 'vacancies') return renderVacanciesPage();
    if (currentPage === 'logs') return renderLogsPage();
    if (currentPage === 'archive') return <ArchivePage candidates={candidates} interviews={interviews} competencies={competencies} handleArchiveCandidate={handleArchiveCandidate} handleUnarchiveInterview={handleUnarchiveInterview} handleArchiveCompetency={handleArchiveCompetency} />;
    if (currentPage === 'deleted') return <DeletedPage hasPermission={hasPermission} />;
    return renderDashboardPage();
  };

  // ================================================================
  // ОСНОВНОЙ РЕНДЕР
  // ================================================================
  return (
    <div style={{ fontFamily: "'Unbounded', sans-serif", minHeight: '100vh', color: '#ffffff', animation: 'fadeIn 0.4s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', padding: '0 24px', background: '#11171F', borderBottom: '1px solid #6A7787', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px 8px', color: '#ffffff' }}>☰</button>
          <img src="/logo.png?v=2" alt="Логотип" style={{ height: '64px' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>HR-platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setIsProfileOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#333F50', border: 'none', cursor: 'pointer', color: '#ffffff', fontSize: '18px', fontWeight: '700', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{userName.charAt(0).toUpperCase()}</button>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#171D24', color: '#ffffff', zIndex: 1000, paddingTop: '64px', boxShadow: '4px 0 12px rgba(0,0,0,0.3)', borderRight: '1px solid #6A7787' }}>
            <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#ffffff', padding: '4px 8px' }}>✕</button>
            <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #6A7787' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Меню</h2>
            </div>
            <nav style={{ padding: '16px 12px' }}>
              {visibleMenuItems.map((item) => (
                <div key={item.path} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '4px', fontSize: '15px', fontWeight: '500', background: currentPage === item.path ? '#4F4F50' : 'transparent' }} onMouseEnter={(e) => { if (currentPage !== item.path) e.target.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={(e) => { if (currentPage !== item.path) e.target.style.background = 'transparent'; }}>{item.label}</div>
              ))}
            </nav>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #6A7787', fontSize: '12px', color: '#6A7787', textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 }}>v1.0.0</div>
          </div>
        </>
      )}

      <main style={{ marginTop: '64px', padding: '24px', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;