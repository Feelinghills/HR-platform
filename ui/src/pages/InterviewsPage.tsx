import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Tooltip,
  LinearProgress,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Add, Visibility, FilterList, Search, Clear } from '@mui/icons-material';
import { interviewsApi } from '../api/interviews';
import { candidatesApi } from '../api/candidates';
import { vacanciesApi } from '../api/vacancies';
import { usersApi } from '../api/users';
import { competenciesApi } from '../api/competencies';
import { useAuth } from '../contexts/AuthContext';
import {
  UserRole,
  InterviewStatus,
  statusLabels,
  decisionLabels,
  decisionColors,
  type InterviewDto,
  type CandidateDto,
  type VacancyDto,
  type UserDto,
  type CompetencyDto,
} from '../types';
import { required } from '../utils/validation';

const statusColors: Record<string, 'info' | 'success' | 'default' | 'error'> = {
  Planned: 'info',
  Completed: 'success',
  Cancelled: 'default',
};

const statusOptions = [
  { key: 'Planned', label: 'Запланировано' },
  { key: 'Completed', label: 'Завершено' },
  { key: 'Cancelled', label: 'Отменено' },
];

const decisionOptions = [
  { key: 'Pending', label: 'Ожидает решения' },
  { key: 'Hired', label: 'Нанят' },
  { key: 'Rejected', label: 'Отклонён' },
  { key: 'NextStage', label: 'Следующий этап' },
  { key: 'TalentPool', label: 'Кадровый резерв' },
];

export default function InterviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [allCompetencies, setAllCompetencies] = useState<CompetencyDto[]>([]);
  const [form, setForm] = useState({ candidateId: '', vacancyId: '', interviewerId: '', plannedDate: '' });

  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDecisions, setSelectedDecisions] = useState<string[]>([]);
  const [filterCandidateName, setFilterCandidateName] = useState('');
  const [filterVacancyTitle, setFilterVacancyTitle] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const formValid = required(form.candidateId) && required(form.vacancyId) && required(form.interviewerId) && required(form.plannedDate);
  const hasActiveFilters = searchName || dateFrom || dateTo || selectedStatuses.length > 0 || selectedDecisions.length > 0 || filterCandidateName || filterVacancyTitle;

  const load = () => {
    setLoading(true);
    interviewsApi.list()
      .then((res) => setInterviews(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => {
      if (filterCandidateName && i.candidateName !== filterCandidateName) return false;
      if (filterVacancyTitle && i.vacancyTitle !== filterVacancyTitle) return false;
      if (searchName) {
        const term = searchName.toLowerCase();
        if (!i.candidateName.toLowerCase().includes(term) && !i.vacancyTitle.toLowerCase().includes(term) && !i.interviewerName.toLowerCase().includes(term)) return false;
      }
      if (dateFrom && new Date(i.plannedDate) < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(i.plannedDate) > to) return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(i.status)) return false;
      if (selectedDecisions.length > 0) {
        if (i.status === InterviewStatus.Planned || i.status === InterviewStatus.Cancelled) return false;
        if (!selectedDecisions.includes(i.decision)) return false;
      }
      return true;
    });
  }, [interviews, searchName, dateFrom, dateTo, selectedStatuses, selectedDecisions, filterCandidateName, filterVacancyTitle]);

  const toggleStatus = (key: string) => setSelectedStatuses((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  const toggleDecision = (key: string) => setSelectedDecisions((prev) => prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]);

  const clearAllFilters = () => {
    setSearchName('');
    setDateFrom('');
    setDateTo('');
    setSelectedStatuses([]);
    setSelectedDecisions([]);
    setFilterCandidateName('');
    setFilterVacancyTitle('');
  };

  const openCreate = () => {
    Promise.all([
      candidatesApi.list(),
      vacanciesApi.list(),
      usersApi.list(),
      competenciesApi.list(true),
    ]).then(([c, v, u, comp]) => {
      setCandidates(c.data);
      setVacancies(v.data);
      setUsers(u.data);
      setAllCompetencies(comp.data);
      setForm({ candidateId: '', vacancyId: '', interviewerId: '', plannedDate: '' });
      setDialogOpen(true);
    });
  };

  const handleCreate = async () => {
    if (!formValid) return;
    setError('');
    try {
      await interviewsApi.create({ ...form, plannedDate: new Date(form.plannedDate).toISOString(), comments: null });
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Ошибка создания');
    }
  };

  const selectedVacancy = vacancies.find((v) => v.id === form.vacancyId);
  const vacancyCompetencyIds = selectedVacancy?.competencyIds || [];
  const vacancyCompetencies = allCompetencies.filter((c) => vacancyCompetencyIds.includes(c.id));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Собеседования</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Запланировать собеседование</Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              color={hasActiveFilters ? 'primary' : 'default'}
              sx={{ border: '1px solid', borderColor: hasActiveFilters ? 'primary.main' : 'divider', borderRadius: 2, px: 1.5 }}
            >
              <FilterList />
              {hasActiveFilters && (
                <Typography variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 600 }}>
                  {(selectedStatuses.length > 0 ? 1 : 0) + (selectedDecisions.length > 0 ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                </Typography>
              )}
            </IconButton>

            <TextField
              size="small"
              placeholder="Поиск по кандидату, вакансии, интервьюеру..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              slotProps={{ input: { startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} /> } }}
              sx={{ flex: 1, minWidth: 250 }}
            />

            {hasActiveFilters && (
              <Button size="small" startIcon={<Clear />} onClick={clearAllFilters}>Сбросить фильтры</Button>
            )}
          </Box>

          {(filterCandidateName || filterVacancyTitle) && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              {filterCandidateName && (
                <Chip
                  label={`Кандидат: ${filterCandidateName}`}
                  onDelete={() => setFilterCandidateName('')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filterVacancyTitle && (
                <Chip
                  label={`Вакансия: ${filterVacancyTitle}`}
                  onDelete={() => setFilterVacancyTitle('')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, minWidth: 320 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Фильтры</Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField size="small" type="date" label="Дата от" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
            <TextField size="small" type="date" label="Дата до" value={dateTo} onChange={(e) => setDateTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Статус</Typography>
            <Button size="small" onClick={() => setSelectedStatuses(statusOptions.map((s) => s.key))}>Выбрать все</Button>
          </Box>
          <FormGroup>
            {statusOptions.map((s) => (
              <FormControlLabel key={s.key} control={<Checkbox size="small" checked={selectedStatuses.includes(s.key)} onChange={() => toggleStatus(s.key)} />} label={s.label} />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Решение</Typography>
            <Button size="small" onClick={() => setSelectedDecisions(decisionOptions.map((d) => d.key))}>Выбрать все</Button>
          </Box>
          <FormGroup>
            {decisionOptions.map((d) => (
              <FormControlLabel key={d.key} control={<Checkbox size="small" checked={selectedDecisions.includes(d.key)} onChange={() => toggleDecision(d.key)} />} label={d.label} />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" onClick={clearAllFilters} startIcon={<Clear />}>Удалить все фильтры</Button>
            <Button size="small" variant="contained" onClick={() => setFilterAnchor(null)}>Применить</Button>
          </Box>
        </Box>
      </Popover>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
              <TableCell sx={{ fontWeight: 700 }}>Кандидат</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Вакансия</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Интервьюер</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Решение</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInterviews.map((i) => (
              <TableRow key={i.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/interviews/${i.id}`)}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {i.candidateName}
                    <Tooltip title="Фильтровать по кандидату">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterCandidateName(filterCandidateName === i.candidateName ? '' : i.candidateName);
                        }}
                        sx={{ color: filterCandidateName === i.candidateName ? 'primary.main' : 'action.active', '&:hover': { color: 'primary.main' } }}
                      >
                        <FilterList sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {i.vacancyTitle}
                    <Tooltip title="Фильтровать по вакансии">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterVacancyTitle(filterVacancyTitle === i.vacancyTitle ? '' : i.vacancyTitle);
                        }}
                        sx={{ color: filterVacancyTitle === i.vacancyTitle ? 'primary.main' : 'action.active', '&:hover': { color: 'primary.main' } }}
                      >
                        <FilterList sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{i.interviewerName}</TableCell>
                <TableCell>{formatDate(i.plannedDate)}</TableCell>
                <TableCell>
                  <Chip size="small" label={statusLabels[i.status]} color={statusColors[i.status] || 'default'} />
                </TableCell>
                <TableCell>
                  {i.status === InterviewStatus.Planned ? (
                    <Chip size="small" label="Ожидает завершения" color="info" variant="outlined" />
                  ) : i.status === InterviewStatus.Cancelled ? (
                    <Chip size="small" label="Без решения" color="default" variant="outlined" />
                  ) : (
                    <Chip size="small" label={decisionLabels[i.decision]} color={decisionColors[i.decision] || 'default'} />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Открыть">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/interviews/${i.id}`); }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredInterviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {interviews.length === 0 ? 'Собеседования не найдены' : 'Нет записей, соответствующих фильтрам'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новое собеседование</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Кандидат *" value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })}>
              {candidates.map((c) => <MenuItem key={c.id} value={c.id}>{c.fullName} — {c.desiredPosition}</MenuItem>)}
            </TextField>
            <TextField select label="Вакансия *" value={form.vacancyId} onChange={(e) => setForm({ ...form, vacancyId: e.target.value })}>
              {vacancies.map((v) => <MenuItem key={v.id} value={v.id}>{v.title}</MenuItem>)}
            </TextField>
            {vacancyCompetencies.length > 0 && (
              <Box sx={{ p: 1.5, bgcolor: '#F5F9FD', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Компетенции вакансии (будут добавлены в матрицу):</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {vacancyCompetencies.map((c) => <Chip key={c.id} size="small" label={`${c.name} (${c.category})`} color="primary" variant="outlined" />)}
                </Box>
              </Box>
            )}
            <TextField select label="Интервьюер *" value={form.interviewerId} onChange={(e) => setForm({ ...form, interviewerId: e.target.value })}>
              {users.filter((u) => u.isActive && u.role === UserRole.HR).map((u) => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
            </TextField>
            <TextField label="Дата и время *" type="datetime-local" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" disabled={!formValid} onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
