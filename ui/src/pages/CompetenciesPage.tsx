import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
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
} from '@mui/material';
import { Add, Edit, Archive, Delete } from '@mui/icons-material';
import { competenciesApi } from '../api/competencies';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type CompetencyDto } from '../types';
import { required } from '../utils/validation';

export default function CompetenciesPage() {
  const { user } = useAuth();
  const [competencies, setCompetencies] = useState<CompetencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CompetencyDto | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', category: '', maxScore: 5, isActive: true });
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const formValid = required(form.name) && required(form.description) && required(form.category) && form.maxScore >= 1 && form.maxScore <= 5;

  const load = () => {
    setLoading(true);
    competenciesApi.list(false).then((res) => setCompetencies(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!formValid) return;
    setError('');
    try {
      if (editItem) {
        await competenciesApi.update(editItem.id, form);
      } else {
        await competenciesApi.create(form);
      }
      setDialogOpen(false);
      setEditItem(null);
      setForm({ name: '', description: '', category: '', maxScore: 5, isActive: true });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const openEdit = (c: CompetencyDto) => {
    setEditItem(c);
    setForm({ name: c.name, description: c.description, category: c.category, maxScore: c.maxScore, isActive: c.isActive });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '', category: '', maxScore: 5, isActive: true });
    setDialogOpen(true);
  };

  const categories = [...new Set(competencies.map((c) => c.category))];

  const handleArchive = async (id: string) => {
    if (!window.confirm('Архивировать компетенцию?')) return;
    await competenciesApi.archive(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить компетенцию?')) return;
    await competenciesApi.delete(id, 'Удаление из списка');
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Компетенции</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Добавить компетенцию
          </Button>
        )}
      </Box>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      {categories.map((cat) => (
        <Box key={cat} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>{cat}</Typography>
          <TableContainer component={Card}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Описание</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Макс. балл</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                  {canEdit && <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {competencies.filter((c) => c.category === cat).map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>{c.maxScore}</TableCell>
                    <TableCell>
                      <Chip size="small" label={c.isActive ? 'Активна' : 'Неактивна'} color={c.isActive ? 'success' : 'default'} />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Архивировать">
                          <IconButton size="small" color="warning" onClick={() => handleArchive(c.id)}><Archive fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Delete fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {competencies.length === 0 && !loading && (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Компетенции не найдены</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Редактировать компетенцию' : 'Новая компетенция'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Название *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Описание *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
            <TextField label="Категория *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <TextField label="Макс. балл" type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })} slotProps={{ htmlInput: { min: 1, max: 5 } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" disabled={!formValid} onClick={handleSave}>{editItem ? 'Сохранить' : 'Создать'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
