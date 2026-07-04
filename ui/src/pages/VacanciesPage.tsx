import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  LinearProgress,
  Collapse,
} from '@mui/material';
import { Add, Edit, ExpandMore, ExpandLess } from '@mui/icons-material';
import { vacanciesApi } from '../api/vacancies';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type VacancyDto } from '../types';

export default function VacanciesPage() {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<VacancyDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', requirements: '', isActive: true });
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;

  const load = () => {
    setLoading(true);
    vacanciesApi.list(false).then((res) => setVacancies(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setError('');
    try {
      if (editItem) {
        await vacanciesApi.update(editItem.id, form);
      } else {
        await vacanciesApi.create(form);
      }
      setDialogOpen(false);
      setEditItem(null);
      setForm({ title: '', description: '', requirements: '', isActive: true });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const openEdit = (v: VacancyDto) => {
    setEditItem(v);
    setForm({ title: v.title, description: v.description, requirements: v.requirements, isActive: v.isActive });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '', requirements: '', isActive: true });
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Вакансии</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Добавить вакансию
          </Button>
        )}
      </Box>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {vacancies.map((v) => (
          <Card key={v.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6">{v.title}</Typography>
                    <Chip size="small" label={v.isActive ? 'Активна' : 'Неактивна'} color={v.isActive ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {v.description}
                  </Typography>
                  <IconButton size="small" onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                    {expandedId === v.id ? <ExpandLess /> : <ExpandMore />}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>Требования</Typography>
                  </IconButton>
                  <Collapse in={expandedId === v.id}>
                    <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: '#F5F9FD', borderRadius: 1 }}>
                      {v.requirements}
                    </Typography>
                  </Collapse>
                </Box>
                {canEdit && (
                  <Tooltip title="Редактировать">
                    <IconButton onClick={() => openEdit(v)}><Edit /></IconButton>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
        {vacancies.length === 0 && !loading && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Вакансии не найдены</Typography>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Редактировать вакансию' : 'Новая вакансия'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Название *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Описание *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} />
            <TextField label="Требования *" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>{editItem ? 'Сохранить' : 'Создать'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
