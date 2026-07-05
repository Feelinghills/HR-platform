import { useEffect, useState } from 'react';
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
  Switch,
  FormControlLabel,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Add, Archive, Visibility } from '@mui/icons-material';
import { candidatesApi } from '../api/candidates';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type CandidateDto } from '../types';
import { required, hasAtLeastTwoWords, isValidPhone, isValidEmail, formatPhone } from '../utils/validation';

const emptyCandidate = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  desiredPosition: '',
  education: '',
  previousJob: '',
  skills: '',
};

function useCandidateValid(form: typeof emptyCandidate) {
  return (
    required(form.fullName) && hasAtLeastTwoWords(form.fullName) &&
    required(form.phone) && isValidPhone(form.phone) &&
    isValidEmail(form.email) &&
    required(form.city) &&
    required(form.desiredPosition) &&
    required(form.education) &&
    required(form.previousJob) &&
    required(form.skills)
  );
}

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDto | null>(null);
  const [form, setForm] = useState(emptyCandidate);
  const [error, setError] = useState('');
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const formValid = useCandidateValid(form);

  const load = () => {
    setLoading(true);
    candidatesApi.list(search || undefined, showArchived)
      .then((res) => setCandidates(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [showArchived]);

  const handleSearch = () => load();

  const handleCreate = async () => {
    if (!formValid) return;
    setError('');
    try {
      await candidatesApi.create(form as any);
      setDialogOpen(false);
      setForm(emptyCandidate);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка создания');
    }
  };

  const handleArchive = async (id: string) => {
    await candidatesApi.archive(id);
    load();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Кандидаты</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ ...emptyCandidate, phone: '+7' }); setDialogOpen(true); }}>
            Добавить кандидата
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Поиск по ФИО, должности, городу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <Button variant="outlined" onClick={handleSearch}>Найти</Button>
          <FormControlLabel
            control={<Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
            label="Архивные"
          />
        </CardContent>
      </Card>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
              <TableCell sx={{ fontWeight: 700 }}>ФИО</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Желаемая должность</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Город</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Телефон</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Дата создания</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.fullName}</TableCell>
                <TableCell>{c.desiredPosition}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={c.isArchived ? 'Архив' : 'Активен'}
                    color={c.isArchived ? 'default' : 'success'}
                  />
                </TableCell>
                <TableCell>{formatDate(c.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Просмотр">
                    <IconButton size="small" onClick={() => { setSelectedCandidate(c); setDetailOpen(true); }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canEdit && !c.isArchived && (
                    <Tooltip title="Архивировать">
                      <IconButton size="small" onClick={() => handleArchive(c.id)}>
                        <Archive fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {candidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Кандидаты не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый кандидат</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="ФИО *"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={form.fullName.length > 0 && (!required(form.fullName) || !hasAtLeastTwoWords(form.fullName))}
              helperText={form.fullName.length > 0 && !hasAtLeastTwoWords(form.fullName) ? 'Укажите минимум 2 слова' : ''}
            />
            <TextField
              label="Телефон *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              placeholder="+7 (XXX) XXX-XX-XX"
              error={form.phone.length > 0 && !isValidPhone(form.phone)}
              helperText={form.phone.length > 0 && !isValidPhone(form.phone) ? 'Формат: +7 (XXX) XXX-XX-XX' : ''}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={form.email.length > 0 && !isValidEmail(form.email)}
              helperText={form.email.length > 0 && !isValidEmail(form.email) ? 'Некорректный email' : ''}
            />
            <TextField label="Город *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="Желаемая должность *" value={form.desiredPosition} onChange={(e) => setForm({ ...form, desiredPosition: e.target.value })} />
            <TextField label="Образование *" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
            <TextField label="Предыдущее место работы *" value={form.previousJob} onChange={(e) => setForm({ ...form, previousJob: e.target.value })} />
            <TextField label="Навыки *" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" disabled={!formValid} onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Карточка кандидата</DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <Typography><strong>ФИО:</strong> {selectedCandidate.fullName}</Typography>
              <Typography><strong>Телефон:</strong> {selectedCandidate.phone}</Typography>
              <Typography><strong>Email:</strong> {selectedCandidate.email || '—'}</Typography>
              <Typography><strong>Город:</strong> {selectedCandidate.city}</Typography>
              <Typography><strong>Должность:</strong> {selectedCandidate.desiredPosition}</Typography>
              <Typography><strong>Образование:</strong> {selectedCandidate.education}</Typography>
              <Typography><strong>Пред. работа:</strong> {selectedCandidate.previousJob}</Typography>
              <Typography><strong>Навыки:</strong> {selectedCandidate.skills}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
