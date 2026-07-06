import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import { RestoreFromTrash, DeleteForever } from '@mui/icons-material';
import { candidatesApi } from '../api/candidates';
import { vacanciesApi } from '../api/vacancies';
import { competenciesApi } from '../api/competencies';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type CandidateDto, type VacancyDto, type CompetencyDto } from '../types';

export default function ArchivePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [vacancies, setVacancies] = useState<VacancyDto[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canEdit = user?.role === UserRole.Admin || user?.role === UserRole.HR;
  const isAdmin = user?.role === UserRole.Admin;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, vRes, coRes] = await Promise.all([
        candidatesApi.list(undefined, true),
        vacanciesApi.list(false, true),
        competenciesApi.list(false, true),
      ]);
      setCandidates(cRes.data.filter((c) => c.isArchived));
      setVacancies(vRes.data.filter((v) => v.isArchived || v.isDeleted));
      setCompetencies(coRes.data.filter((c) => c.isArchived || c.isDeleted));
    } catch {
      setError('Ошибка загрузки архива');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCandidateRestore = async (id: string) => {
    try {
      await candidatesApi.restore(id);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка восстановления');
    }
  };

  const handleCandidateDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить кандидата?')) return;
    try {
      await candidatesApi.delete(id, 'Удаление из архива');
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleVacancyRestore = async (id: string) => {
    try {
      await vacanciesApi.restore(id);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка восстановления');
    }
  };

  const handleVacancyDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить вакансию?')) return;
    try {
      await vacanciesApi.delete(id, 'Удаление из архива');
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleCompetencyRestore = async (id: string) => {
    try {
      await competenciesApi.restore(id);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка восстановления');
    }
  };

  const handleCompetencyDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить компетенцию?')) return;
    try {
      await competenciesApi.delete(id, 'Удаление из архива');
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка удаления');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Архив</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label={`Кандидаты (${candidates.length})`} />
          <Tab label={`Вакансии (${vacancies.length})`} />
          <Tab label={`Компетенции (${competencies.length})`} />
        </Tabs>
      </Card>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      {tab === 0 && (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                <TableCell sx={{ fontWeight: 700 }}>ФИО</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Должность</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Город</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Телефон</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Дата создания</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.fullName}</TableCell>
                  <TableCell>{c.desiredPosition}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <Tooltip title="Восстановить">
                        <IconButton size="small" color="success" onClick={() => handleCandidateRestore(c.id)}>
                          <RestoreFromTrash fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Удалить навсегда">
                          <IconButton size="small" color="error" onClick={() => handleCandidateDelete(c.id)}>
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Архив кандидатов пуст
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Описание</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Дата создания</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {vacancies.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.title}</TableCell>
                  <TableCell>{v.description}</TableCell>
                  <TableCell>{formatDate(v.createdAt)}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <Tooltip title="Восстановить">
                        <IconButton size="small" color="success" onClick={() => handleVacancyRestore(v.id)}>
                          <RestoreFromTrash fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Удалить навсегда">
                          <IconButton size="small" color="error" onClick={() => handleVacancyDelete(v.id)}>
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {vacancies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Архив вакансий пуст
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Категория</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Макс. балл</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {competencies.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell>{c.maxScore}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <Tooltip title="Восстановить">
                        <IconButton size="small" color="success" onClick={() => handleCompetencyRestore(c.id)}>
                          <RestoreFromTrash fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Удалить навсегда">
                          <IconButton size="small" color="error" onClick={() => handleCompetencyDelete(c.id)}>
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {competencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Архив компетенций пуст
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
