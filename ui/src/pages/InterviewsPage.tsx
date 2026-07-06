import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
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

export default function InterviewsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [allCompetencies, setAllCompetencies] = useState<CompetencyDto[]>([]);
  const [form, setForm] = useState({
    candidateId: '',
    vacancyId: '',
    interviewerId: '',
    plannedDate: '',
  });
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;

  const formValid = required(form.candidateId) && required(form.vacancyId) && required(form.interviewerId) && required(form.plannedDate);

  const load = () => {
    setLoading(true);
    interviewsApi.list(search ? { search } : undefined)
      .then((res) => setInterviews(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
      await interviewsApi.create({
        ...form,
        plannedDate: new Date(form.plannedDate).toISOString(),
        comments: null,
      });
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
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Запланировать собеседование
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Поиск по кандидату, вакансии..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" onClick={load}>Найти</Button>
        </CardContent>
      </Card>

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
            {interviews.map((i) => (
              <TableRow key={i.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/interviews/${i.id}`)}>
                <TableCell>{i.candidateName}</TableCell>
                <TableCell>{i.vacancyTitle}</TableCell>
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
                    <Chip
                      size="small"
                      label={decisionLabels[i.decision]}
                      color={decisionColors[i.decision] || 'default'}
                    />
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
            {interviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Собеседования не найдены
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
              {candidates.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.fullName} — {c.desiredPosition}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Вакансия *" value={form.vacancyId} onChange={(e) => setForm({ ...form, vacancyId: e.target.value })}>
              {vacancies.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.title}</MenuItem>
              ))}
            </TextField>
            {vacancyCompetencies.length > 0 && (
              <Box sx={{ p: 1.5, bgcolor: '#F5F9FD', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Компетенции вакансии (будут добавлены в матрицу):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {vacancyCompetencies.map((c) => (
                    <Chip key={c.id} size="small" label={`${c.name} (${c.category})`} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            <TextField select label="Интервьюер *" value={form.interviewerId} onChange={(e) => setForm({ ...form, interviewerId: e.target.value })}>
              {users.filter((u) => u.isActive && u.role === UserRole.HR).map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Дата и время *"
              type="datetime-local"
              value={form.plannedDate}
              onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
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
