import { useEffect, useState, useMemo } from 'react';
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
  Tooltip,
  LinearProgress,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Add, Archive, Visibility, FilterList, Search, Clear, Delete } from '@mui/icons-material';
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

const statusOptions = [
  { key: 'active', label: 'Активен' },
  { key: 'archived', label: 'Архив' },
];

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDto | null>(null);
  const [form, setForm] = useState(emptyCandidate);
  const [error, setError] = useState('');

  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const formValid = useCandidateValid(form);
  const hasActiveFilters = searchName || dateFrom || dateTo || selectedStatuses.length > 0;

  const load = () => {
    setLoading(true);
    candidatesApi.list(undefined, true)
      .then((res) => setCandidates(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (searchName) {
        const term = searchName.toLowerCase();
        if (!c.fullName.toLowerCase().includes(term) && !c.desiredPosition.toLowerCase().includes(term) && !c.city.toLowerCase().includes(term)) return false;
      }
      if (dateFrom && new Date(c.createdAt) < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(c.createdAt) > to) return false;
      }
      if (selectedStatuses.length > 0) {
        const matches = (selectedStatuses.includes('active') && !c.isArchived) || (selectedStatuses.includes('archived') && c.isArchived);
        if (!matches) return false;
      }
      return true;
    });
  }, [candidates, searchName, dateFrom, dateTo, selectedStatuses]);

  const toggleStatus = (key: string) => {
    setSelectedStatuses((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const clearAllFilters = () => {
    setSearchName('');
    setDateFrom('');
    setDateTo('');
    setSelectedStatuses([]);
  };

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить кандидата?')) return;
    await candidatesApi.delete(id, 'Удаление из списка');
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
                  {(selectedStatuses.length > 0 ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                </Typography>
              )}
            </IconButton>

            <TextField
              size="small"
              placeholder="Поиск по ФИО, должности, городу..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              slotProps={{ input: { startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} /> } }}
              sx={{ flex: 1, minWidth: 250 }}
            />

            {hasActiveFilters && (
              <Button size="small" startIcon={<Clear />} onClick={clearAllFilters}>Сбросить фильтры</Button>
            )}
          </Box>
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
              <FormControlLabel
                key={s.key}
                control={<Checkbox size="small" checked={selectedStatuses.includes(s.key)} onChange={() => toggleStatus(s.key)} />}
                label={s.label}
              />
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
            {filteredCandidates.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.fullName}</TableCell>
                <TableCell>{c.desiredPosition}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  <Chip size="small" label={c.isArchived ? 'Архив' : 'Активен'} color={c.isArchived ? 'default' : 'success'} />
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
                  {canEdit && (
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredCandidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {candidates.length === 0 ? 'Кандидаты не найдены' : 'Нет записей, соответствующих фильтрам'}
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
            <TextField label="ФИО *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={form.fullName.length > 0 && (!required(form.fullName) || !hasAtLeastTwoWords(form.fullName))} helperText={form.fullName.length > 0 && !hasAtLeastTwoWords(form.fullName) ? 'Укажите минимум 2 слова' : ''} />
            <TextField label="Телефон *" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} placeholder="+7 (XXX) XXX-XX-XX" error={form.phone.length > 0 && !isValidPhone(form.phone)} helperText={form.phone.length > 0 && !isValidPhone(form.phone) ? 'Формат: +7 (XXX) XXX-XX-XX' : ''} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={form.email.length > 0 && !isValidEmail(form.email)} helperText={form.email.length > 0 && !isValidEmail(form.email) ? 'Некорректный email' : ''} />
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
