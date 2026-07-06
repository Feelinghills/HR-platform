import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  // --- СОСТОЯНИЯ ---
  const [step, setStep] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userName, setUserName] = useState('');
  const [userLogin, setUserLogin] = useState('');
  const [userRole, setUserRole] = useState('hr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [error, setError] = useState('');
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
  const [vacanciesList, setVacanciesList] = useState([
    {
      id: 1,
      title: 'Senior разработчик C#',
      description: 'Разработка и поддержка высоконагруженных систем на C# и .NET. Участие в архитектурных решениях, оптимизация производительности, написание тестов.',
      shortDescription: 'Разработка высоконагруженных систем на C# и .NET',
      requirements: 'Опыт работы от 5 лет. Глубокое знание C#, .NET, ASP.NET Core, Entity Framework, SQL. Опыт работы с микросервисной архитектурой, Docker, Kubernetes. Понимание SOLID, паттернов проектирования. Навыки Code Review и менторства.',
      requiredSkills: ['C# и .NET', 'SQL', 'Архитектура', 'Микросервисы'],
      status: 'Активна',
      isArchived: false,
      createdAt: '2025-07-01'
    },
    {
      id: 2,
      title: 'Middle аналитик данных',
      description: 'Сбор, обработка и анализ данных. Построение дашбордов, написание сложных SQL-запросов, визуализация данных.',
      shortDescription: 'Сбор и анализ данных, построение дашбордов',
      requirements: 'Опыт работы от 3 лет. Знание SQL, Python, аналитических инструментов. Умение работать с большими данными, навыки визуализации данных (Power BI, Tableau).',
      requiredSkills: ['SQL', 'Python', 'Аналитика', 'Визуализация данных'],
      status: 'Активна',
      isArchived: false,
      createdAt: '2025-07-05'
    },
    {
      id: 3,
      title: 'Junior Java разработчик',
      description: 'Участие в разработке бэкенд-сервисов на Java. Написание REST API, работа с базами данных, участие в Code Review.',
      shortDescription: 'Разработка бэкенд-сервисов на Java',
      requirements: 'Опыт работы от 1 года. Знание Java, Spring, SQL. Понимание ООП, алгоритмов, Git.',
      requiredSkills: ['Java', 'Spring', 'SQL', 'Git'],
      status: 'Закрыта',
      isArchived: true,
      createdAt: '2025-06-15'
    },
  ]);

  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingVacancyId, setEditingVacancyId] = useState(null);
  const [vacancyFormData, setVacancyFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    requirements: '',
    requiredSkills: [],
    status: 'Активна'
  });
  const [searchQueryVacancies, setSearchQueryVacancies] = useState('');
  const [showArchivedVacancies, setShowArchivedVacancies] = useState(false);
  const [expandedVacancyId, setExpandedVacancyId] = useState(null);

  // --- СОСТОЯНИЯ ДЛЯ ЖУРНАЛА ИЗМЕНЕНИЙ ---
  const [logs, setLogs] = useState([]);
  const [searchQueryLogs, setSearchQueryLogs] = useState('');
  const [areaFilter, setAreaFilter] = useState('Все');
  const [actionFilter, setActionFilter] = useState('Все');

  const areaColors = {
    'Кандидаты': '#dbeafe',
    'Собеседования': '#e9d5ff',
    'Вакансии': '#fce7f3',
    'Матрица компетенций': '#d1fae5',
    'Пользователи': '#fef3c7',
    'Авторизация': '#fee2e2',
    'Журнал': '#e0e7ff',
  };

  // --- ФУНКЦИЯ ДОБАВЛЕНИЯ ЗАПИСИ В ЖУРНАЛ ---
  const addLog = (area, action, objectId, details, username) => {
    const now = new Date();
    const mskTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const dateStr = mskTime.toISOString().replace('T', ' ').slice(0, 16);
    
    const roleLabels = {
      admin: 'Администратор',
      hr: 'HR',
      reshala: 'Согласующий'
    };
    
    const userDisplayName = username || userName;
    const roleDisplay = roleLabels[userRole] || userRole;
    
    const newLog = {
      id: Date.now(),
      date: dateStr,
      area: area,
      action: action,
      objectId: objectId || '—',
      user: userDisplayName + ' (' + roleDisplay + ')',
      details: details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- СОСТОЯНИЯ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ---
  const [users, setUsers] = useState([
    { id: 1, name: 'Администратор', login: 'admin', password: 'admin', role: 'admin' },
    { id: 2, name: 'HR', login: 'hr', password: 'hr', role: 'hr' },
    { id: 3, name: 'Согласующий', login: 'reshala', password: 'reshala', role: 'reshala' },
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    login: '',
    password: '',
    role: 'hr'
  });
  const [searchQueryUsers, setSearchQueryUsers] = useState('');
  const [roleFilter, setRoleFilter] = useState('Все');

  // --- СОСТОЯНИЯ ДЛЯ МАТРИЦЫ КОМПЕТЕНЦИЙ ---
  const [competencies, setCompetencies] = useState([
    {
      id: 1,
      name: 'Коммуникация',
      category: 'Soft Skills',
      description: 'Способность эффективно обмениваться информацией, слушать и понимать собеседника, ясно излагать мысли.',
      maxScore: 5,
      isActive: true
    },
    {
      id: 2,
      name: 'Работа в команде',
      category: 'Soft Skills',
      description: 'Умение взаимодействовать с коллегами, достигать общих целей, поддерживать здоровую атмосферу в коллективе.',
      maxScore: 5,
      isActive: true
    },
    {
      id: 3,
      name: 'C# и .NET',
      category: 'Backend',
      description: 'Знание языка C#, платформы .NET, ASP.NET Core, Entity Framework, LINQ, работа с REST API.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 4,
      name: 'SQL',
      category: 'Database',
      description: 'Знание языка SQL, написание сложных запросов, оптимизация, работа с индексами, транзакции.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 5,
      name: 'PostgreSQL',
      category: 'Database',
      description: 'Администрирование PostgreSQL, настройка, резервное копирование, работа с расширениями, оптимизация.',
      maxScore: 10,
      isActive: false
    },
    {
      id: 6,
      name: 'Архитектура',
      category: 'Backend',
      description: 'Понимание архитектурных паттернов, проектирование систем, выбор технологий.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 7,
      name: 'Микросервисы',
      category: 'Backend',
      description: 'Проектирование и разработка микросервисных систем, межсервисное взаимодействие.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 8,
      name: 'Python',
      category: 'Backend',
      description: 'Знание языка Python, фреймворков Django/Flask, написание скриптов и сервисов.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 9,
      name: 'Аналитика',
      category: 'Data',
      description: 'Сбор и обработка данных, построение моделей, визуализация, работа с BI-инструментами.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 10,
      name: 'Визуализация данных',
      category: 'Data',
      description: 'Построение дашбордов, работа с Power BI, Tableau, создание интерактивных отчетов.',
      maxScore: 5,
      isActive: true
    },
    {
      id: 11,
      name: 'Java',
      category: 'Backend',
      description: 'Знание языка Java, Spring Framework, написание бэкенд-сервисов.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 12,
      name: 'Spring',
      category: 'Backend',
      description: 'Работа с Spring Boot, Spring Data, Spring Security, Spring Cloud.',
      maxScore: 10,
      isActive: true
    },
    {
      id: 13,
      name: 'Git',
      category: 'DevOps',
      description: 'Работа с системой контроля версий Git, ветвление, merge, ревью кода.',
      maxScore: 5,
      isActive: true
    },
  ]);

  const [categories, setCategories] = useState(['Soft Skills', 'Backend', 'Database', 'Frontend', 'DevOps', 'Data']);
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

  // --- ДАННЫЕ ---
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Иванов Иван Иванович',
      phone: '89991234567',
      city: 'Казань',
      vacancy: 'Senior разработчик',
      experience: '5 лет',
      education: 'КНИТУ КАИ, Информатика и вычислительная техника',
      previousJob: 'Сбербанк',
      skills: ['C# / .Net знания', 'Архитектура', 'Самостоятельность', 'Командная работа', 'Code Review', 'Менторство', 'Бизнес-понимание', 'Микросервисы', 'Знание английского'],
      ratings: {},
      isArchived: false,
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      name: 'Сергеев Сергей Сергеевич',
      phone: '89998765432',
      city: 'Москва',
      vacancy: 'Middle аналитик',
      experience: '3 года',
      education: 'МГУ, Прикладная математика',
      previousJob: 'Яндекс',
      skills: ['SQL', 'Python', 'Аналитика', 'Командная работа', 'Визуализация данных', 'Статистика'],
      ratings: {},
      isArchived: false,
      createdAt: '2025-02-10'
    },
    {
      id: 3,
      name: 'Петров Петр Петрович',
      phone: '89991234568',
      city: 'Санкт-Петербург',
      vacancy: 'Junior Java разработчик',
      experience: '1 год',
      education: 'ИТМО, Программная инженерия',
      previousJob: 'Тинькофф',
      skills: ['Java', 'Spring', 'SQL', 'Git', 'Алгоритмы', 'ООП'],
      ratings: {},
      isArchived: false,
      createdAt: '2025-03-01'
    },
  ]);

  const [vacancies] = useState([
    'Senior разработчик',
    'Middle аналитик',
    'Junior Java разработчик',
    'React разработчик',
    'Python разработчик',
    'DevOps инженер',
    'QA инженер',
    'Project Manager',
    'UX/UI дизайнер',
  ]);

  // --- СОБЕСЕДОВАНИЯ ---
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      candidateId: 1,
      candidateName: 'Иванов Иван Иванович',
      vacancy: 'Senior разработчик',
      interviewer: 'HR-менеджер - Анна Иванова',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      status: 'Запланировано',
      decision: '—',
      isArchived: false,
      comments: '',
      ratings: {}
    },
    {
      id: 2,
      candidateId: 2,
      candidateName: 'Сергеев Сергей Сергеевич',
      vacancy: 'Middle аналитик',
      interviewer: 'Технический директор - Алексей Смирнов',
      date: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0],
      time: '11:30',
      status: 'Проведено',
      decision: 'Ожидает',
      isArchived: false,
      comments: 'Кандидат показал хорошие технические навыки, но слабые софт-скиллы',
      ratings: {}
    },
  ]);

  const interviewerOptions = [
    'HR-менеджер - Анна Иванова',
    'Технический директор - Алексей Смирнов',
    'Старший разработчик - Екатерина Козлова',
    'Руководитель отдела - Дмитрий Петров'
  ];

  const statuses = ['Все', 'Запланировано', 'Проведено', 'Отменено', 'Архив'];

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
      shortDescription: '',
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
      shortDescription: vacancy.shortDescription,
      requirements: vacancy.requirements,
      requiredSkills: [...vacancy.requiredSkills],
      status: vacancy.status
    });
    setShowVacancyModal(true);
  };

  const handleSaveVacancy = (e) => {
    e.preventDefault();
    const vacancyData = {
      title: vacancyFormData.title,
      description: vacancyFormData.description,
      shortDescription: vacancyFormData.shortDescription,
      requirements: vacancyFormData.requirements,
      requiredSkills: vacancyFormData.requiredSkills,
      status: vacancyFormData.status,
      isArchived: vacancyFormData.status === 'Закрыта' ? true : false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    let newVacancy;
    if (editingVacancyId) {
      setVacanciesList(vacanciesList.map(v =>
        v.id === editingVacancyId ? { ...v, ...vacancyData } : v
      ));
      newVacancy = { id: editingVacancyId, ...vacancyData };
      addLog('Вакансии', 'Редактирование', 'В-' + String(editingVacancyId).padStart(3, '0'), 'Отредактирована вакансия "' + vacancyData.title + '"');
    } else {
      newVacancy = { id: Date.now(), ...vacancyData };
      setVacanciesList([newVacancy, ...vacanciesList]);
      addLog('Вакансии', 'Добавление', 'В-' + String(newVacancy.id).padStart(3, '0'), 'Добавлена вакансия "' + vacancyData.title + '"');
    }
    setShowVacancyModal(false);
    setVacancyFormData({
      title: '',
      description: '',
      shortDescription: '',
      requirements: '',
      requiredSkills: [],
      status: 'Активна'
    });
  };

  const handleDeleteVacancy = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      const vacancy = vacanciesList.find(v => v.id === id);
      setVacanciesList(vacanciesList.filter(v => v.id !== id));
      addLog('Вакансии', 'Удаление', 'В-' + String(id).padStart(3, '0'), 'Удалена вакансия "' + vacancy.title + '"');
    }
  };

  const handleArchiveVacancy = (id) => {
    const vacancy = vacanciesList.find(v => v.id === id);
    setVacanciesList(vacanciesList.map(v =>
      v.id === id ? { ...v, isArchived: !v.isArchived, status: v.isArchived ? 'Активна' : 'Закрыта' } : v
    ));
    addLog('Вакансии', vacancy.isArchived ? 'Разархивация' : 'Архивация', 'В-' + String(id).padStart(3, '0'), vacancy.isArchived ? 'Разархивирована вакансия "' + vacancy.title + '"' : 'Архивирована вакансия "' + vacancy.title + '"');
  };

  const toggleRequirements = (id) => {
    setExpandedVacancyId(expandedVacancyId === id ? null : id);
  };

  const getFilteredVacancies = () => {
    let filtered = vacanciesList;
    if (searchQueryVacancies) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQueryVacancies.toLowerCase()) ||
        v.shortDescription.toLowerCase().includes(searchQueryVacancies.toLowerCase())
      );
    }
    if (!showArchivedVacancies) {
      filtered = filtered.filter(v => !v.isArchived);
    }
    return filtered;
  };

  const getAvailableSkills = () => {
    return competencies.filter(c => c.isActive).map(c => c.name);
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = vacancyFormData.requiredSkills || [];
    if (currentSkills.includes(skill)) {
      setVacancyFormData({
        ...vacancyFormData,
        requiredSkills: currentSkills.filter(s => s !== skill)
      });
    } else {
      setVacancyFormData({
        ...vacancyFormData,
        requiredSkills: [...currentSkills, skill]
      });
    }
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
    if (areaFilter !== 'Все') {
      filtered = filtered.filter(l => l.area === areaFilter);
    }
    if (actionFilter !== 'Все') {
      filtered = filtered.filter(l => l.action === actionFilter);
    }
    return filtered;
  };

  const getUniqueAreas = () => {
    const areas = logs.map(l => l.area);
    return ['Все', ...new Set(areas)];
  };

  const getUniqueActions = () => {
    const actions = logs.map(l => l.action);
    return ['Все', ...new Set(actions)];
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
  // ================================================================
  const openAddUserModal = () => {
    setEditingUserId(null);
    setUserFormData({ name: '', login: '', password: '', role: 'hr' });
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUserId(user.id);
    setUserFormData({
      name: user.name,
      login: user.login,
      password: user.password || '',
      role: user.role
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    let user;
    if (editingUserId) {
      setUsers(users.map(u =>
        u.id === editingUserId
          ? { ...u, ...userFormData }
          : u
      ));
      user = { id: editingUserId, ...userFormData };
      addLog('Пользователи', 'Редактирование', 'U-' + String(editingUserId).padStart(3, '0'), 'Отредактирован пользователь "' + userFormData.name + '"');
    } else {
      const newUser = { id: Date.now(), ...userFormData };
      setUsers([...users, newUser]);
      addLog('Пользователи', 'Добавление', 'U-' + String(newUser.id).padStart(3, '0'), 'Добавлен пользователь "' + newUser.name + '" с ролью ' + getRoleLabel(newUser.role));
    }
    setShowUserModal(false);
    setUserFormData({ name: '', login: '', password: '', role: 'hr' });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      const user = users.find(u => u.id === userId);
      setUsers(users.filter(u => u.id !== userId));
      addLog('Пользователи', 'Удаление', 'U-' + String(userId).padStart(3, '0'), 'Удалён пользователь "' + user.name + '"');
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

  const handleSaveCompetency = (e) => {
    e.preventDefault();
    let comp;
    if (editingCompetencyId) {
      setCompetencies(competencies.map(c =>
        c.id === editingCompetencyId ? { ...c, ...competencyFormData } : c
      ));
      comp = { id: editingCompetencyId, ...competencyFormData };
      addLog('Матрица компетенций', 'Редактирование', 'M-' + String(editingCompetencyId).padStart(3, '0'), 'Отредактирован навык "' + comp.name + '"');
    } else {
      const newComp = { id: Date.now(), ...competencyFormData };
      setCompetencies([...competencies, newComp]);
      addLog('Матрица компетенций', 'Добавление', 'M-' + String(newComp.id).padStart(3, '0'), 'Добавлен навык "' + newComp.name + '" в категорию ' + newComp.category);
    }
    setShowCompetencyModal(false);
    setCompetencyFormData({ name: '', category: '', description: '', maxScore: 5, isActive: true });
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  };

  const handleDeleteCompetency = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту компетенцию?')) {
      const comp = competencies.find(c => c.id === id);
      setCompetencies(competencies.filter(c => c.id !== id));
      addLog('Матрица компетенций', 'Удаление', 'M-' + String(id).padStart(3, '0'), 'Удалён навык "' + comp.name + '"');
    }
  };

  const handleArchiveCompetency = (id) => {
    const comp = competencies.find(c => c.id === id);
    setCompetencies(competencies.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
    addLog('Матрица компетенций', comp.isActive ? 'Архивация' : 'Разархивация', 'M-' + String(id).padStart(3, '0'), comp.isActive ? 'Архивирован навык "' + comp.name + '"' : 'Разархивирован навык "' + comp.name + '"');
  };

  const getFilteredCompetencies = () => {
    let filtered = competencies;
    if (searchQueryCompetencies) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQueryCompetencies.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQueryCompetencies.toLowerCase())
      );
    }
    if (categoryFilter !== 'Все') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    if (!showArchivedCompetencies) {
      filtered = filtered.filter(c => c.isActive);
    }
    return filtered;
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Soft Skills': return '#dbeafe';
      case 'Backend': return '#d1fae5';
      case 'Database': return '#fef3c7';
      case 'Frontend': return '#fce7f3';
      case 'DevOps': return '#e0e7ff';
      case 'Data': return '#e0f2fe';
      default: return '#f1f5f9';
    }
  };

  const getCategoryTextColor = (category) => {
    switch(category) {
      case 'Soft Skills': return '#1d4ed8';
      case 'Backend': return '#065f46';
      case 'Database': return '#92400e';
      case 'Frontend': return '#9d174d';
      case 'DevOps': return '#3730a3';
      case 'Data': return '#0369a1';
      default: return '#475569';
    }
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ КАНДИДАТОВ
  // ================================================================
  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!validatePhone(newCandidate.phone)) {
      setPhoneError('Введите корректный номер телефона (11 цифр)');
      return;
    }
    setPhoneError('');

    const vacancyName = vacancies.find(v => v === newCandidate.vacancy) || newCandidate.vacancy;
    const candidate = {
      id: Date.now(),
      name: newCandidate.name,
      phone: newCandidate.phone,
      city: newCandidate.city || 'Не указано',
      vacancy: vacancyName,
      experience: newCandidate.experience || 'Не указано',
      education: newCandidate.education || 'Не указано',
      previousJob: newCandidate.previousJob || 'Не указано',
      skills: newCandidate.skills ? newCandidate.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      ratings: {},
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCandidates([candidate, ...candidates]);
    setNewCandidate({ name: '', phone: '', vacancy: '', city: '', education: '', experience: '', previousJob: '', skills: '' });
    setPhoneError('');
    setShowAddModal(false);
    addLog('Кандидаты', 'Добавление', 'К-' + String(candidate.id).padStart(3, '0'), 'Добавлен кандидат "' + candidate.name + '" на вакансию "' + candidate.vacancy + '"');
  };

  const handleArchiveCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setCandidates(candidates.map(c =>
      c.id === candidateId ? { ...c, isArchived: !c.isArchived } : c
    ));
    addLog('Кандидаты', candidate.isArchived ? 'Разархивация' : 'Архивация', 'К-' + String(candidateId).padStart(3, '0'), candidate.isArchived ? 'Разархивирован кандидат "' + candidate.name + '"' : 'Архивирован кандидат "' + candidate.name + '"');
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    const updatedCandidate = { ...selectedCandidate, ...editData };
    const updatedCandidates = candidates.map(c =>
      c.id === selectedCandidate.id ? updatedCandidate : c
    );
    setCandidates(updatedCandidates);
    setSelectedCandidate(updatedCandidate);
    setIsEditing(false);
    setEditData({});
    addLog('Кандидаты', 'Редактирование', 'К-' + String(selectedCandidate.id).padStart(3, '0'), 'Отредактированы данные кандидата "' + selectedCandidate.name + '"');
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
        c.vacancy.toLowerCase().includes(searchQuery.toLowerCase());
      const archiveMatch = showArchivedCandidates ? true : !c.isArchived;
      return matchesSearch && archiveMatch;
    });
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabet':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: break;
    }
    return filtered;
  };

  // ================================================================
  // ОБРАБОТЧИКИ ДЛЯ СОБЕСЕДОВАНИЙ
  // ================================================================
  const handleArchiveInterview = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId);
    setInterviews(interviews.map(i =>
      i.id === interviewId ? { ...i, isArchived: !i.isArchived } : i
    ));
    addLog('Собеседования', interview.isArchived ? 'Разархивация' : 'Архивация', 'С-' + String(interviewId).padStart(3, '0'), interview.isArchived ? 'Разархивировано собеседование с "' + interview.candidateName + '"' : 'Архивировано собеседование с "' + interview.candidateName + '"');
  };

  const startEditInterview = (interview) => {
    setEditingInterviewId(interview.id);
    setEditInterviewData({
      date: interview.date,
      time: interview.time,
      interviewer: interview.interviewer,
      status: interview.status
    });
  };

  const saveEditInterview = () => {
    const interview = interviews.find(i => i.id === editingInterviewId);
    setInterviews(interviews.map(i =>
      i.id === editingInterviewId ? { ...i, ...editInterviewData } : i
    ));
    setEditingInterviewId(null);
    setEditInterviewData({});
    addLog('Собеседования', 'Редактирование', 'С-' + String(editingInterviewId).padStart(3, '0'), 'Отредактировано собеседование с "' + interview.candidateName + '"');
  };

  const cancelEditInterview = () => {
    setEditingInterviewId(null);
    setEditInterviewData({});
  };

  const handleDecision = (interviewId, decision) => {
    const interview = interviews.find(i => i.id === interviewId);
    setInterviews(interviews.map(i =>
      i.id === interviewId ? { ...i, decision: decision, status: 'Проведено' } : i
    ));
    setTimeout(() => {
      setInterviews(prev => prev.map(i =>
        i.id === interviewId ? { ...i, isArchived: true } : i
      ));
    }, 500);
    addLog('Собеседования', 'Решение', 'С-' + String(interviewId).padStart(3, '0'), 'По собеседованию с "' + interview.candidateName + '" принято решение: ' + decision);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const selectedCandidate = candidates.find(c => c.id === Number(newInterview.candidateId));
    const newInterviewObj = {
      id: Date.now(),
      candidateId: Number(newInterview.candidateId),
      candidateName: selectedCandidate ? selectedCandidate.name : 'Неизвестный кандидат',
      vacancy: selectedCandidate ? selectedCandidate.vacancy : '—',
      interviewer: newInterview.interviewer,
      date: newInterview.date,
      time: newInterview.time,
      status: 'Запланировано',
      decision: '—',
      isArchived: false,
      comments: '',
      ratings: {}
    };
    setInterviews([newInterviewObj, ...interviews]);
    setNewInterview({ candidateId: '', interviewer: '', date: '', time: '' });
    setShowScheduleModal(false);
    addLog('Собеседования', 'Планирование', 'С-' + String(newInterviewObj.id).padStart(3, '0'), 'Запланировано собеседование с "' + newInterviewObj.candidateName + '" на ' + newInterviewObj.date + ' ' + newInterviewObj.time);
  };

  const openInterviewCard = (interview) => {
    setSelectedInterview(interview);
    setShowInterviewCard(true);
    const candidate = candidates.find(c => c.id === interview.candidateId);
    if (candidate) {
      setRatings(candidate.ratings || {});
    }
  };

  const saveComment = () => {
    setInterviews(interviews.map(i =>
      i.id === selectedInterview.id ? { ...i, comments: interviewComments } : i
    ));
    setSelectedInterview({ ...selectedInterview, comments: interviewComments });
  };

  const handleStarClickInterview = (skillIndex, starIndex) => {
    const newRatings = { ...ratings, [skillIndex]: starIndex + 1 };
    setRatings(newRatings);
    if (selectedInterview) {
      const updatedInterview = { ...selectedInterview, ratings: newRatings };
      setSelectedInterview(updatedInterview);
      setInterviews(interviews.map(i =>
        i.id === selectedInterview.id ? updatedInterview : i
      ));
    }
  };

  const getFilteredInterviews = () => {
    let filtered = interviews;
    
    // Фильтр по статусу
    if (statusFilter !== 'Все' && statusFilter !== 'Архив') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    if (statusFilter === 'Архив') {
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
        i.vacancy.toLowerCase().includes(searchQueryInterviews.toLowerCase())
      );
    }
    return filtered;
  };

  // --- ГЕНЕРАЦИЯ PDF ---
  const generatePDF = (type, interview) => {
    const candidate = candidates.find(c => c.id === interview.candidateId);
    const currentDate = new Date().toLocaleDateString('ru-RU');
    let content = '', title = '';
    switch(type) {
      case 'Карточка кандидата':
        title = 'КАРТОЧКА КАНДИДАТА';
        content = `ФИО: ${candidate ? candidate.name : 'Не указано'}\nТелефон: ${candidate ? candidate.phone : 'Не указано'}\nГород: ${candidate ? candidate.city : 'Не указано'}\nВакансия: ${interview.vacancy}\nОпыт работы: ${candidate ? candidate.experience : 'Не указано'}\nОбразование: ${candidate ? candidate.education : 'Не указано'}\nПредыдущее место работы: ${candidate ? candidate.previousJob : 'Не указано'}\nНавыки: ${candidate && candidate.skills ? candidate.skills.join(', ') : 'Не указаны'}`;
        break;
      case 'Протокол собеседования':
        title = 'ПРОТОКОЛ СОБЕСЕДОВАНИЯ';
        content = `Кандидат: ${interview.candidateName}\nВакансия: ${interview.vacancy}\nИнтервьюер: ${interview.interviewer}\nДата: ${interview.date}\nВремя: ${interview.time}\nСтатус: ${interview.status}\nРешение: ${interview.decision || 'Ожидается'}\nКомментарии: ${interview.comments || 'Нет комментариев'}`;
        break;
      case 'Письмо о решении':
        title = 'ПИСЬМО О РЕШЕНИИ';
        const decisionText = interview.decision === 'Принят' ? 'Поздравляем! Вы приняты.' : interview.decision === 'Отказан' ? 'К сожалению, мы вынуждены отказать.' : 'Решение ещё не принято.';
        content = `Дата: ${currentDate}\nКандидат: ${interview.candidateName}\nВакансия: ${interview.vacancy}\nРешение: ${interview.decision || 'Ожидается'}\n${decisionText}`;
        break;
      default: return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${title}</title>
        <style>body{font-family:Arial;padding:40px;max-width:700px;margin:0 auto;color:#1e293b} h1{text-align:center;font-size:24px;border-bottom:2px solid #1e293b;padding-bottom:12px;margin-bottom:24px;text-transform:uppercase;letter-spacing:1px} .header{text-align:center;font-size:14px;color:#64748b;margin-bottom:32px} .row{display:flex;padding:10px 0;border-bottom:1px solid #e2e8f0} .label{font-weight:600;width:180px;flex-shrink:0;color:#475569} .value{color:#0f172a} .footer{margin-top:40px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px} .signature{margin-top:32px;display:flex;justify-content:space-between;font-size:14px} .signature-line{border-top:1px solid #1e293b;width:200px;padding-top:4px} .decision-box{margin-top:20px;padding:16px;background:${interview.decision === 'Принят' ? '#dcfce7' : interview.decision === 'Отказан' ? '#fee2e2' : '#fef9c3'};border-radius:8px;text-align:center;font-weight:600;font-size:18px} .company-name{text-align:center;font-size:18px;font-weight:700;color:#1e293b;margin-bottom:8px}
        </style></head><body>
        <div class="company-name">HR-platform</div><h1>${title}</h1><div class="header">Дата генерации: ${currentDate}</div>
        ${content.split('\n').filter(line => line.trim()).map(line => {
          const [label, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          if (label && value) return `<div class="row"><span class="label">${label.trim()}:</span><span class="value">${value}</span></div>`;
          return '';
        }).join('')}
        ${type === 'Письмо о решении' ? `<div class="decision-box">${interview.decision === 'Принят' ? 'ПРИНЯТ' : interview.decision === 'Отказан' ? 'ОТКАЗАН' : 'ОЖИДАЕТ РЕШЕНИЯ'}</div>` : ''}
        <div class="signature"><div><span>Подпись: </span><span class="signature-line">&nbsp;</span></div><div><span>Дата: </span><span class="signature-line">&nbsp;</span></div></div>
        <div class="footer">Документ сгенерирован в системе HR-platform</div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } else {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
    }
  };

  // --- ЛОГИКА ВХОДА ---
  const handleLogin = (login, password) => {
    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
      setUserName(user.name);
      setUserLogin(user.login);
      setUserRole(user.role);
      setError('');
      setStep('greeting');
      addLog('Авторизация', 'Вход', '—', 'Пользователь "' + user.name + '" вошёл в систему', user.name);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    if (userName) {
      addLog('Авторизация', 'Выход', '—', 'Пользователь "' + userName + '" вышел из системы');
    }
    setStep('login');
    setUserName('');
    setUserLogin('');
    setUserRole('hr');
    setIsProfileOpen(false);
    setCurrentPage('dashboard');
    setSelectedCandidate(null);
    setSelectedInterview(null);
    setRatings({});
    setIsEditing(false);
    setShowInterviewCard(false);
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
    setStatusFilter('Все');
    setDateFilterFrom('');
    setDateFilterTo('');
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
          <img src="/logo.png" alt="Логотип" style={{ height: '80px', marginBottom: '32px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png" alt="Логотип" style={{ height: '32px' }} /><span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>HR-platform</span></div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png" alt="Логотип" style={{ height: '32px' }} /><span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>HR-platform</span></div>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: '8px' }}>Технические собеседования</h1>
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: '#ffffff', textAlign: 'center', marginBottom: '32px' }}>Авторизация</h2>
          <div style={{ background: '#171D24', padding: '32px 32px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <form onSubmit={(e) => { e.preventDefault(); const login = e.target.login.value; const password = e.target.password.value; handleLogin(login, password); }}>
              <input name="login" type="text" placeholder="Логин" style={{ width: '100%', padding: '10px 14px', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#11171F', color: '#ffffff', outline: 'none', marginBottom: '14px' }} required />
              <input name="password" type="password" placeholder="Пароль" style={{ width: '100%', padding: '10px 14px', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#11171F', color: '#ffffff', outline: 'none', marginBottom: '14px' }} required />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '4px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Вход</button>
              {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '14px' }}>{error}</p>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- КАРТОЧКА КАНДИДАТА ---
  const renderCandidateCard = () => {
    if (!selectedCandidate) return null;
    const skillsMap = {
      'Senior разработчик': ['C# / .Net знания', 'Архитектура', 'Самостоятельность', 'Командная работа', 'Code Review', 'Менторство', 'Бизнес-понимание', 'Микросервисы', 'Знание английского'],
      'Middle аналитик': ['SQL', 'Python', 'Аналитика', 'Командная работа', 'Визуализация данных', 'Статистика'],
      'Junior Java разработчик': ['Java', 'Spring', 'SQL', 'Git', 'Алгоритмы', 'ООП'],
      'React разработчик': ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux', 'Адаптивная верстка'],
      'Python разработчик': ['Python', 'Django', 'SQL', 'API', 'Алгоритмы', 'Pandas']
    };
    const skills = skillsMap[selectedCandidate.vacancy] || ['Навык 1', 'Навык 2', 'Навык 3', 'Навык 4', 'Навык 5'];
    const renderStars = (skillIndex) => {
      const rating = ratings[skillIndex] || 0;
      const stars = [];
      for (let i = 0; i < 5; i++) {
        const isFilled = i < rating;
        stars.push(<span key={i} style={{ fontSize: '24px', cursor: isEditing ? 'pointer' : 'default', userSelect: 'none', color: isFilled ? '#7F7B6D' : '#3A3F4A', textShadow: isFilled ? 'none' : '0 0 0 1px #7F7B6D', transition: 'color 0.2s, transform 0.2s', display: 'inline-block', opacity: isEditing ? 1 : 0.5, margin: '0 2px' }} onClick={() => isEditing && handleStarClick(skillIndex, i)} onMouseEnter={(e) => { if (isEditing && i >= rating) e.target.style.transform = 'scale(1.2)'; }} onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}>★</span>);
      }
      return stars;
    };
    const getDisplayValue = (value) => value || 'Не указано';
    const isHRorAdmin = userRole === 'hr' || userRole === 'admin';
    
    // Находим собеседование этого кандидата
    const candidateInterview = interviews.find(i => i.candidateId === selectedCandidate.id);

    return (
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => { setSelectedCandidate(null); setRatings({}); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '14px', cursor: 'pointer', padding: '8px 0', marginBottom: '24px', fontFamily: "'Unbounded', sans-serif" }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>← Назад к списку</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>{selectedCandidate.name}</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {candidateInterview && (
              <button onClick={() => { setSelectedInterview(candidateInterview); setShowInterviewCard(true); }} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Перейти к собеседованию</button>
            )}
            {isHRorAdmin && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {!isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(true); setEditData({ phone: selectedCandidate.phone || '', city: selectedCandidate.city || '', vacancy: selectedCandidate.vacancy || '', experience: selectedCandidate.experience || '', education: selectedCandidate.education || '', previousJob: selectedCandidate.previousJob || '', skills: Array.isArray(selectedCandidate.skills) ? selectedCandidate.skills.join(', ') : '' }); }} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>
                    <button onClick={() => handleArchiveCandidate(selectedCandidate.id)} style={{ padding: '8px 20px', background: selectedCandidate.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = selectedCandidate.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = selectedCandidate.isArchived ? '#3E503A' : '#333F50'}>{selectedCandidate.isArchived ? 'Разархивировать' : 'Архивировать'}</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSaveEdit} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Сохранить</button>
                    <button onClick={handleCancelEdit} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Отмена</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ background: '#171D24', padding: '24px 28px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Номер телефона:</span>{isEditing ? <input type="tel" value={editData.phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); if (value.length <= 11) handleEditChange('phone', value); }} placeholder="89991234567" style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} maxLength="11" /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.phone)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Город:</span>{isEditing ? <input type="text" value={editData.city} onChange={(e) => handleEditChange('city', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.city)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Вакансия:</span>{isEditing ? <select value={editData.vacancy} onChange={(e) => handleEditChange('vacancy', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }}><option value="">Выберите вакансию</option>{vacancies.map((v) => <option key={v} value={v}>{v}</option>)}</select> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.vacancy)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Опыт работы:</span>{isEditing ? <select value={editData.experience} onChange={(e) => handleEditChange('experience', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }}><option value="">Выберите уровень</option><option value="Junior (0-1 год)">Junior (0-1 год)</option><option value="Middle (2-4 года)">Middle (2-4 года)</option><option value="Senior (5+ лет)">Senior (5+ лет)</option></select> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.experience)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Образование:</span>{isEditing ? <input type="text" value={editData.education} onChange={(e) => handleEditChange('education', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.education)}</span>}</div>
          <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #2A3344' }}><span style={{ fontSize: '14px', color: '#6A7787', minWidth: '180px' }}>Предыдущее место работы:</span>{isEditing ? <input type="text" value={editData.previousJob} onChange={(e) => handleEditChange('previousJob', e.target.value)} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 12px', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '200px', flex: 1, boxSizing: 'border-box' }} /> : <span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{getDisplayValue(selectedCandidate.previousJob)}</span>}</div>
        </div>
        <div style={{ background: '#171D24', padding: '24px 28px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>Навыки{userRole === 'reshala' && <span style={{ fontSize: '12px', color: '#6A7787', marginLeft: '12px' }}>(только просмотр)</span>}{!isEditing && userRole !== 'reshala' && <span style={{ fontSize: '12px', color: '#6A7787', marginLeft: '12px' }}>(для оценки нажмите "Редактировать")</span>}</h2>
          {skills.map((skill, index) => (<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < skills.length - 1 ? '1px solid #2A3344' : 'none' }}><span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{skill}</span><div style={{ display: 'flex', gap: '4px' }}>{renderStars(index)}</div></div>))}
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
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>ФИО *</label><input type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="Иванов Иван Иванович" style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required pattern="^[А-Яа-яЁёA-Za-z]+\s[А-Яа-яЁёA-Za-z]+\s?[А-Яа-яЁёA-Za-z]*$" title="Введите минимум два слова (Имя Фамилия)" /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Номер телефона *</label><input type="tel" value={newCandidate.phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); if (value.length <= 11) setNewCandidate({ ...newCandidate, phone: value }); setPhoneError(''); }} placeholder="89991234567" style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required maxLength="11" />{phoneError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{phoneError}</p>}</div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Вакансия *</label><select value={newCandidate.vacancy} onChange={(e) => setNewCandidate({ ...newCandidate, vacancy: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите вакансию</option>{vacancies.map((vacancy) => <option key={vacancy} value={vacancy}>{vacancy}</option>)}</select></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Город *</label><input type="text" value={newCandidate.city} onChange={(e) => setNewCandidate({ ...newCandidate, city: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Образование *</label><input type="text" value={newCandidate.education} onChange={(e) => setNewCandidate({ ...newCandidate, education: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Опыт работы *</label><select value={newCandidate.experience} onChange={(e) => setNewCandidate({ ...newCandidate, experience: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите уровень</option><option value="Junior (0-1 год)">Junior (0-1 год)</option><option value="Middle (2-4 года)">Middle (2-4 года)</option><option value="Senior (5+ лет)">Senior (5+ лет)</option></select></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Предыдущее место работы</label><input type="text" value={newCandidate.previousJob} onChange={(e) => setNewCandidate({ ...newCandidate, previousJob: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} /></div>
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
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Кандидат *</label><select value={newInterview.candidateId} onChange={(e) => setNewInterview({ ...newInterview, candidateId: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите кандидата</option>{candidates.filter(c => !c.isArchived).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.vacancy}</option>)}</select></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Интервьюер *</label><select value={newInterview.interviewer} onChange={(e) => setNewInterview({ ...newInterview, interviewer: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="">Выберите интервьюера</option>{interviewerOptions.map((interviewer) => <option key={interviewer} value={interviewer}>{interviewer}</option>)}</select></div>
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
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Краткое описание *</label>
              <input type="text" value={vacancyFormData.shortDescription} onChange={(e) => setVacancyFormData({ ...vacancyFormData, shortDescription: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Полное описание</label>
              <textarea value={vacancyFormData.description} onChange={(e) => setVacancyFormData({ ...vacancyFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Требования</label>
              <textarea value={vacancyFormData.requirements} onChange={(e) => setVacancyFormData({ ...vacancyFormData, requirements: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Необходимые навыки</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', minHeight: '40px' }}>
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    style={{
                      padding: '4px 12px',
                      background: (vacancyFormData.requiredSkills || []).includes(skill) ? '#333F50' : 'transparent',
                      border: '1px solid ' + ((vacancyFormData.requiredSkills || []).includes(skill) ? '#333F50' : '#6A7787'),
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { if (!(vacancyFormData.requiredSkills || []).includes(skill)) e.target.style.borderColor = '#4A5A70'; }}
                    onMouseLeave={(e) => { if (!(vacancyFormData.requiredSkills || []).includes(skill)) e.target.style.borderColor = '#6A7787'; }}
                  >
                    {skill}
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
    const skillsMap = {
      'Senior разработчик': ['C# / .Net знания', 'Архитектура', 'Самостоятельность', 'Командная работа', 'Code Review', 'Менторство', 'Бизнес-понимание', 'Микросервисы', 'Знание английского'],
      'Middle аналитик': ['SQL', 'Python', 'Аналитика', 'Командная работа', 'Визуализация данных', 'Статистика'],
      'Junior Java разработчик': ['Java', 'Spring', 'SQL', 'Git', 'Алгоритмы', 'ООП'],
      'React разработчик': ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux', 'Адаптивная верстка'],
      'Python разработчик': ['Python', 'Django', 'SQL', 'API', 'Алгоритмы', 'Pandas']
    };
    const skills = skillsMap[selectedInterview.vacancy] || ['Навык 1', 'Навык 2', 'Навык 3', 'Навык 4', 'Навык 5'];
    const renderStars = (skillIndex) => {
      const rating = selectedInterview.ratings?.[skillIndex] || 0;
      const stars = [];
      for (let i = 0; i < 5; i++) {
        const isFilled = i < rating;
        stars.push(<span key={i} style={{ fontSize: '24px', cursor: 'pointer', userSelect: 'none', color: isFilled ? '#7F7B6D' : '#3A3F4A', textShadow: isFilled ? 'none' : '0 0 0 1px #7F7B6D', transition: 'color 0.2s, transform 0.2s', display: 'inline-block', margin: '0 2px' }} onClick={() => handleStarClickInterview(skillIndex, i)} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>★</span>);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Дата:</span><span style={{ color: '#ffffff' }}>{selectedInterview.date}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Время:</span><span style={{ color: '#ffffff' }}>{selectedInterview.time}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A3344', paddingBottom: '8px' }}><span style={{ color: '#6A7787' }}>Статус:</span><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getStatusColor(selectedInterview.status) }}>{selectedInterview.status}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6A7787' }}>Решение:</span><span style={{ color: '#ffffff' }}>{selectedInterview.decision || '—'}</span></div>
              </div>
            </div>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Комментарии</h3>
              <textarea value={selectedInterview.comments || ''} onChange={(e) => { setInterviewComments(e.target.value); setSelectedInterview({ ...selectedInterview, comments: e.target.value }); }} onBlur={saveComment} placeholder="Введите комментарий к собеседованию..." style={{ width: '100%', padding: '12px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: "'Unbounded', sans-serif", boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Матрица компетенций</h3>
              {skills.map((skill, index) => (<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < skills.length - 1 ? '1px solid #2A3344' : 'none' }}><span style={{ fontSize: '14px', color: '#ffffff', flex: 1 }}>{skill}</span><div style={{ display: 'flex', gap: '4px' }}>{renderStars(index)}</div></div>))}
            </div>
            <div style={{ background: '#171D24', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Действия</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => generatePDF('Карточка кандидата', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать карточку кандидата</button>
                <button onClick={() => generatePDF('Протокол собеседования', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать протокол собеседования</button>
                <button onClick={() => generatePDF('Письмо о решении', selectedInterview)} style={{ padding: '10px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif", textAlign: 'left' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Скачать письмо о решении</button>
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
    const getDecisionColor = (decision) => { switch(decision) { case 'Принят': return '#3E503A'; case 'Отказан': return '#4E1717'; case 'Ожидает': return '#7F7B6D'; default: return '#6A7787'; } };
    const isHRorAdmin = userRole === 'hr' || userRole === 'admin';
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

        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Поиск по кандидату или вакансии..."
              value={searchQueryInterviews}
              onChange={(e) => setSearchQueryInterviews(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minWidth: '180px' }}
            />
            <input
              type="date"
              placeholder="Дата от"
              value={dateFilterFrom}
              onChange={(e) => setDateFilterFrom(e.target.value)}
              style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            />
            <input
              type="date"
              placeholder="Дата до"
              value={dateFilterTo}
              onChange={(e) => setDateFilterTo(e.target.value)}
              style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
            />
            {(dateFilterFrom || dateFilterTo) && (
              <button
                onClick={() => { setDateFilterFrom(''); setDateFilterTo(''); }}
                style={{ padding: '8px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                onMouseEnter={(e) => e.target.style.background = '#6E2727'}
                onMouseLeave={(e) => e.target.style.background = '#4E1717'}
              >
                Сбросить даты
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statuses.map((status) => (<button key={status} onClick={() => setStatusFilter(status)} style={{ padding: '6px 16px', background: statusFilter === status ? '#333F50' : 'transparent', border: '1px solid #6A7787', borderRadius: '20px', color: statusFilter === status ? '#ffffff' : '#6A7787', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', fontFamily: "'Unbounded', sans-serif" }} onMouseEnter={(e) => { if (statusFilter !== status) e.target.style.color = '#ffffff'; }} onMouseLeave={(e) => { if (statusFilter !== status) e.target.style.color = '#6A7787'; }}>{status}</button>))}
          </div>
        </div>

        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead style={{ background: '#11171F' }}><tr><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Кандидат</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Вакансия</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Интервьюер</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Дата</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Время</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Статус</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Решение</th><th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действия</th></tr></thead>
            <tbody>
              {filteredInterviews.length > 0 ? filteredInterviews.map((interview) => {
                const isReshala = userRole === 'reshala';
                const canDecide = isReshala && interview.status === 'Проведено' && interview.decision === 'Ожидает';
                const isToday = interview.date === today;
                return (<tr key={interview.id} style={{ borderTop: '1px solid #2A3344', opacity: interview.isArchived ? 0.6 : 1, background: isToday && !interview.isArchived ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{interview.candidateName}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{interview.vacancy}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <select value={editInterviewData.interviewer} onChange={(e) => setEditInterviewData({ ...editInterviewData, interviewer: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }}>{interviewerOptions.map((i) => <option key={i} value={i}>{i}</option>)}</select> : interview.interviewer}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <input type="date" value={editInterviewData.date} onChange={(e) => setEditInterviewData({ ...editInterviewData, date: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }} /> : interview.date}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <input type="time" value={editInterviewData.time} onChange={(e) => setEditInterviewData({ ...editInterviewData, time: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }} /> : interview.time}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{editingInterviewId === interview.id ? <select value={editInterviewData.status} onChange={(e) => setEditInterviewData({ ...editInterviewData, status: e.target.value })} style={{ background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', padding: '4px 8px', fontSize: '14px', outline: 'none', width: '100%' }}><option value="Запланировано">Запланировано</option><option value="Проведено">Проведено</option><option value="Отменено">Отменено</option></select> : <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getStatusColor(interview.status) }}>{interview.status}</span>}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>{canDecide ? <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}><button onClick={() => handleDecision(interview.id, 'Принят')} style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Принять</button><button onClick={() => handleDecision(interview.id, 'Отказан')} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Отказать</button></div> : <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#ffffff', display: 'inline-block', background: getDecisionColor(interview.decision) }}>{interview.decision}</span>}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      <button onClick={() => openInterviewCard(interview)} style={{ padding: '4px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Открыть карточку</button>
                      {isHRorAdmin && editingInterviewId !== interview.id && !interview.isArchived && <button onClick={() => startEditInterview(interview)} style={{ padding: '4px 16px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>}
                      {editingInterviewId === interview.id && (<><button onClick={saveEditInterview} style={{ padding: '4px 16px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#4A6A4A'} onMouseLeave={(e) => e.target.style.background = '#3E503A'}>Сохранить</button><button onClick={cancelEditInterview} style={{ padding: '4px 16px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Отмена</button></>)}
                      {isHRorAdmin && editingInterviewId !== interview.id && <button onClick={() => handleArchiveInterview(interview.id)} style={{ padding: '4px 16px', background: interview.isArchived ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', width: '100%', maxWidth: '140px' }} onMouseEnter={(e) => e.target.style.background = interview.isArchived ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = interview.isArchived ? '#3E503A' : '#333F50'}>{interview.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
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

  // --- СТРАНИЦА КАНДИДАТОВ ---
  const renderCandidatesPage = () => {
    const filteredCandidates = getFilteredCandidates();
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Кандидаты</h1><span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {candidates.length}</span></div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить кандидата</button>
            <button onClick={() => setShowArchivedCandidates(!showArchivedCandidates)} style={{ padding: '8px 20px', background: showArchivedCandidates ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedCandidates ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedCandidates ? '#3E503A' : '#333F50'}>{showArchivedCandidates ? 'Скрыть архив' : 'Показать архив'}</button>
          </div>
        </div>
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="Поиск" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
            <button onClick={() => setShowSortMenu(!showSortMenu)} style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Фильтр ▼</button>
          </div>
          {showSortMenu && <div style={{ position: 'absolute', top: '50px', right: 0, background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', padding: '8px 0', minWidth: '180px', zIndex: 10 }}><button onClick={() => { setSortOption('newest'); setShowSortMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: sortOption === 'newest' ? '#4F4F50' : 'none', border: 'none', color: '#ffffff', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}>Сначала новые</button><button onClick={() => { setSortOption('oldest'); setShowSortMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: sortOption === 'oldest' ? '#4F4F50' : 'none', border: 'none', color: '#ffffff', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}>Сначала старые</button><button onClick={() => { setSortOption('alphabet'); setShowSortMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: sortOption === 'alphabet' ? '#4F4F50' : 'none', border: 'none', color: '#ffffff', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}>По алфавиту</button></div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredCandidates.map((candidate) => (<div key={candidate.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#171D24', borderRadius: '12px', transition: 'all 0.2s', opacity: candidate.isArchived ? 0.6 : 1 }}>
            <div><h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{candidate.name}</h3><p style={{ fontSize: '14px', color: '#6A7787', marginTop: '4px' }}>{candidate.phone}</p><p style={{ fontSize: '14px', color: '#6A7787', marginTop: '2px' }}>{candidate.vacancy}</p></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setSelectedCandidate(candidate); setRatings(candidate.ratings || {}); setIsEditing(false); }} style={{ background: 'none', border: 'none', color: '#6A7787', fontSize: '12px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#6A7787'}>Перейти к карточке</button>
              {(userRole === 'hr' || userRole === 'admin') && <button onClick={() => handleArchiveCandidate(candidate.id)} style={{ background: 'none', border: 'none', color: candidate.isArchived ? '#3E503A' : '#6A7787', fontSize: '12px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = candidate.isArchived ? '#4A6A4A' : '#ffffff'} onMouseLeave={(e) => e.target.style.color = candidate.isArchived ? '#3E503A' : '#6A7787'}>{candidate.isArchived ? 'Разархивировать' : 'Архивировать'}</button>}
            </div>
          </div>))}
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
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Матрица компетенций</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {competencies.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={openAddCompetencyModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>
              Добавить компетенцию
            </button>
            <button onClick={() => setShowArchivedCompetencies(!showArchivedCompetencies)} style={{ padding: '8px 20px', background: showArchivedCompetencies ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedCompetencies ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedCompetencies ? '#3E503A' : '#333F50'}>
              {showArchivedCompetencies ? 'Скрыть архив' : 'Показать архив'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQueryCompetencies}
            onChange={(e) => setSearchQueryCompetencies(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minWidth: '200px' }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            {filterCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

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
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: comp.isActive ? '#3E503A' : '#4E1717', color: '#ffffff' }}>
                        {comp.isActive ? 'Активен' : 'Архивирован'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={() => openEditCompetencyModal(comp)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>
                        <button onClick={() => handleArchiveCompetency(comp.id)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{comp.isActive ? 'Архивировать' : 'Разархивировать'}</button>
                        <button onClick={() => handleDeleteCompetency(comp.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>
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
                  <input type="number" min="1" max="10" value={competencyFormData.maxScore} onChange={(e) => setCompetencyFormData({ ...competencyFormData, maxScore: Number(e.target.value) })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Статус</label>
                  <select value={competencyFormData.isActive ? 'active' : 'archived'} onChange={(e) => setCompetencyFormData({ ...competencyFormData, isActive: e.target.value === 'active' })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="active">Активен</option>
                    <option value="archived">Архивирован</option>
                  </select>
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
            <button onClick={openAddVacancyModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>
              Добавить вакансию
            </button>
            <button onClick={() => setShowArchivedVacancies(!showArchivedVacancies)} style={{ padding: '8px 20px', background: showArchivedVacancies ? '#3E503A' : '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = showArchivedVacancies ? '#4A6A4A' : '#4A5A70'} onMouseLeave={(e) => e.target.style.background = showArchivedVacancies ? '#3E503A' : '#333F50'}>
              {showArchivedVacancies ? 'Скрыть архив' : 'Показать архив'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQueryVacancies}
            onChange={(e) => setSearchQueryVacancies(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minWidth: '200px' }}
          />
        </div>

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
                  <p style={{ fontSize: '14px', color: '#6A7787', marginTop: '4px' }}>{vacancy.shortDescription}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => openEditVacancyModal(vacancy)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>
                  <button onClick={() => handleArchiveVacancy(vacancy.id)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>{vacancy.isArchived ? 'Разархивировать' : 'Архивировать'}</button>
                  <button onClick={() => handleDeleteVacancy(vacancy.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#6A7787' }}>Необходимые навыки:</span>
                  {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 ? (
                    vacancy.requiredSkills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '4px 12px', background: '#11171F', borderRadius: '6px', fontSize: '12px', color: '#ffffff', border: '1px solid #6A7787' }}>{skill}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6A7787' }}>Навыки не указаны</span>
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
    
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Архив</h1>
            <span style={{ fontSize: '16px', color: '#6A7787' }}>Всего в архиве: {archivedCandidates.length + archivedInterviews.length}</span>
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
                    <button
                      onClick={() => handleArchiveCandidate(c.id)}
                      style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = '#4A6A4A'}
                      onMouseLeave={(e) => e.target.style.background = '#3E503A'}
                    >
                      Разархивировать
                    </button>
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
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{i.date}</span>
                      <span style={{ color: '#6A7787', fontSize: '12px', marginLeft: '12px' }}>{i.status}</span>
                    </div>
                    <button
                      onClick={() => handleArchiveInterview(i.id)}
                      style={{ padding: '4px 12px', background: '#3E503A', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = '#4A6A4A'}
                      onMouseLeave={(e) => e.target.style.background = '#3E503A'}
                    >
                      Разархивировать
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6A7787', textAlign: 'center', padding: '20px' }}>Нет архивированных собеседований</p>
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

        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по деталям, пользователю или ID объекта..."
            value={searchQueryLogs}
            onChange={(e) => setSearchQueryLogs(e.target.value)}
            style={{ flex: 2, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minWidth: '200px' }}
          />
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            {uniqueAreas.map((area) => <option key={area} value={area}>{area}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            {uniqueActions.map((action) => <option key={action} value={action}>{action}</option>)}
          </select>
          {(searchQueryLogs || areaFilter !== 'Все' || actionFilter !== 'Все') && (
            <button
              onClick={() => { setSearchQueryLogs(''); setAreaFilter('Все'); setActionFilter('Все'); }}
              style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#4A5A70'}
              onMouseLeave={(e) => e.target.style.background = '#333F50'}
            >
              Сбросить
            </button>
          )}
        </div>

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
    const roleColors = { admin: '#dbeafe', hr: '#d1fae5', reshala: '#fef3c7' };
    const roleTextColors = { admin: '#1d4ed8', hr: '#065f46', reshala: '#92400e' };
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>Пользователи</h1><span style={{ fontSize: '16px', color: '#6A7787' }}>Всего: {users.length}</span></div>
          <button onClick={openAddUserModal} style={{ padding: '8px 20px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Добавить пользователя</button>
        </div>
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Поиск по имени или логину..." value={searchQueryUsers} onChange={(e) => setSearchQueryUsers(e.target.value)} style={{ flex: 1, padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', minWidth: '200px' }} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '10px 16px', background: '#171D24', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}><option value="Все">Все роли</option><option value="admin">Администратор</option><option value="hr">HR</option><option value="reshala">Согласующий</option></select>
        </div>
        <div style={{ background: '#171D24', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead style={{ background: '#11171F' }}><tr><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ФИО</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Логин</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Роль</th><th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6A7787', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Действия</th></tr></thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (<tr key={user.id} style={{ borderTop: '1px solid #2A3344' }}>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>{user.name}</td>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>{user.login}</td>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block', background: roleColors[user.role] || '#6A7787', color: roleTextColors[user.role] || '#ffffff' }}>{getRoleLabel(user.role)}</span></td>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => openEditUserModal(user)} style={{ padding: '4px 12px', background: '#333F50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#333F50'}>Редактировать</button>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '4px 12px', background: '#4E1717', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.target.style.background = '#6E2727'} onMouseLeave={(e) => e.target.style.background = '#4E1717'}>Удалить</button>
                  </div>
                </td>
              </tr>)) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#6A7787', fontSize: '16px' }}>Пользователи не найдены</td></tr>}
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
                <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Пароль {editingUserId ? '(оставьте пустым, чтобы не менять)' : '*'}</label><input type="text" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required={!editingUserId} /></div>
                <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', color: '#6A7787', display: 'block', marginBottom: '4px' }}>Роль *</label><select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required><option value="admin">Администратор</option><option value="hr">HR</option><option value="reshala">Согласующий</option></select></div>
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
      const btns = ['Добавить кандидата', 'Запланировать собеседование', 'Создать вакансию', 'Просмотр действий'];
      if (userRole === 'admin') btns.push('Пользователи');
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
            if (label === 'Просмотр действий') return <button key={idx} onClick={() => setCurrentPage('logs')} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
            if (label === 'Пользователи') return <button key={idx} onClick={() => setCurrentPage('users')} style={{ padding: '8px 18px', background: '#11171F', border: '1px solid #6A7787', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#4A5A70'} onMouseLeave={(e) => e.target.style.background = '#11171F'}>{label}</button>;
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
                        {interview.time} · {interview.vacancy}
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
    { path: 'dashboard', label: 'Главная' },
    { path: 'candidates', label: 'Кандидаты' },
    { path: 'interviews', label: 'Собеседования' },
    { path: 'matrix', label: 'Матрица компетенций' },
    { path: 'vacancies', label: 'Вакансии' },
    { path: 'logs', label: 'Журнал изменений' },
    { path: 'archive', label: 'Архив' },
  ];
  if (userRole === 'admin') {
    menuItems.splice(1, 0, { path: 'users', label: 'Пользователи' });
  }

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
    if (currentPage === 'archive') return renderArchivePage();
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
          <img src="/logo.png" alt="Логотип" style={{ height: '32px' }} />
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
              {menuItems.map((item) => (
                <div key={item.path} onClick={() => { setCurrentPage(item.path); setIsMenuOpen(false); }} style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '4px', fontSize: '15px', fontWeight: '500', background: currentPage === item.path ? '#4F4F50' : 'transparent' }} onMouseEnter={(e) => { if (currentPage !== item.path) e.target.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={(e) => { if (currentPage !== item.path) e.target.style.background = 'transparent'; }}>{item.label}</div>
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