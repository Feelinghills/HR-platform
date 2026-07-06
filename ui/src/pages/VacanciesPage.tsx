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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Add, Edit, ExpandMore, ExpandLess, Archive, Delete } from '@mui/icons-material';
import { vacanciesApi } from '../api/vacancies';
import { competenciesApi } from '../api/competencies';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type VacancyDto, type CompetencyDto } from '../types';
import { required } from '../utils/validation';

export default function VacanciesPage() {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<VacancyDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<{ title: string; description: string; requirements: string; isActive: boolean; competencyIds: string[] }>({
    title: '', description: '', requirements: '', isActive: true, competencyIds: [],
  });
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const formValid = required(form.title) && required(form.description) && required(form.requirements);

  const load = () => {
    setLoading(true);
    Promise.all([
      vacanciesApi.list(false).then((res) => setVacancies(res.data)),
      competenciesApi.list(true).then((res) => setCompetencies(res.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!formValid) return;
    setError('');
    try {
      if (editItem) {
        await vacanciesApi.update(editItem.id, form);
      } else {
        await vacanciesApi.create(form);
      }
      setDialogOpen(false);
      setEditItem(null);
      setForm({ title: '', description: '', requirements: '', isActive: true, competencyIds: [] });
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const openEdit = (v: VacancyDto) => {
    setEditItem(v);
    setForm({ title: v.title, description: v.description, requirements: v.requirements, isActive: v.isActive, competencyIds: v.competencyIds || [] });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', description: '', requirements: '', isActive: true, competencyIds: [] });
    setDialogOpen(true);
  };

  const getCompetencyName = (id: string) => competencies.find((c) => c.id === id)?.name || id;

  const handleArchive = async (id: string) => {
    if (!window.confirm('Архивировать вакансию?')) return;
    await vacanciesApi.archive(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить вакансию?')) return;
    await vacanciesApi.delete(id, 'Удаление из списка');
    load();
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
                  {v.competencyIds && v.competencyIds.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {v.competencyIds.map((cid) => (
                        <Chip key={cid} size="small" label={getCompetencyName(cid)} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  )}
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
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Редактировать">
                      <IconButton onClick={() => openEdit(v)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Архивировать">
                      <IconButton color="warning" onClick={() => handleArchive(v.id)}><Archive /></IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton color="error" onClick={() => handleDelete(v.id)}><Delete /></IconButton>
                    </Tooltip>
                  </Box>
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
            <FormControl fullWidth>
              <InputLabel>Компетенции</InputLabel>
              <Select
                multiple
                value={form.competencyIds}
                onChange={(e) => setForm({ ...form, competencyIds: e.target.value as string[] })}
                input={<OutlinedInput label="Компетенции" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => (
                      <Chip key={id} size="small" label={getCompetencyName(id)} />
                    ))}
                  </Box>
                )}
              >
                {competencies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Checkbox checked={form.competencyIds.indexOf(c.id) > -1} />
                    <ListItemText primary={`${c.name} (${c.category})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
