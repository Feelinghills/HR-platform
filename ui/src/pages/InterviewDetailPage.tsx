import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import { interviewsApi } from '../api/interviews';
import { reportsApi } from '../api/reports';
import { useAuth } from '../contexts/AuthContext';
import {
  UserRole,
  InterviewStatus,
  InterviewDecision,
  statusLabels,
  decisionLabels,
  type InterviewDto,
} from '../types';

const statusColors: Record<string, 'info' | 'success' | 'default' | 'error'> = {
  Planned: 'info',
  Completed: 'success',
  Cancelled: 'default',
};

const decisionColors: Record<string, 'default' | 'success' | 'error' | 'info' | 'warning'> = {
  Pending: 'default',
  Hired: 'success',
  Rejected: 'error',
  NextStage: 'info',
  TalentPool: 'warning',
};

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState<InterviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [matrixScores, setMatrixScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canEditMatrix = (user?.role === UserRole.Admin || user?.role === UserRole.HR) && interview?.status === InterviewStatus.Planned;
  const canDecide = user?.role === UserRole.DecisionMaker;

  useEffect(() => {
    if (id) {
      interviewsApi.get(id)
        .then((res) => {
          setInterview(res.data);
          const scores: Record<string, { score: number; comment: string }> = {};
          res.data.matrix.forEach((m) => {
            scores[m.competencyId] = { score: m.score, comment: m.comment || '' };
          });
          setMatrixScores(scores);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveMatrix = async () => {
    if (!id) return;
    setError('');
    setSuccess('');
    try {
      const items = Object.entries(matrixScores).map(([competencyId, v]) => ({
        competencyId,
        score: v.score,
        comment: v.comment || null,
      }));
      const res = await interviewsApi.upsertMatrix(id, { items });
      setInterview(res.data);
      setSuccess('Матрица оценок сохранена');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDecision = async (decision: InterviewDecision) => {
    if (!id) return;
    setError('');
    try {
      const res = await interviewsApi.decide(id, { decision, comments: null });
      setInterview(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка');
    }
  };

  const handleStatusChange = async (status: InterviewStatus) => {
    if (!id) return;
    try {
      const res = await interviewsApi.updateStatus(id, { status, comments: null });
      setInterview(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка');
    }
  };

  const downloadPdf = async (type: 'card' | 'protocol' | 'decision') => {
    if (!interview) return;
    try {
      let res;
      if (type === 'card') res = await reportsApi.candidateCard(interview.candidateId);
      else if (type === 'protocol') res = await reportsApi.interviewProtocol(interview.id);
      else res = await reportsApi.decisionLetter(interview.id);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', type === 'card' ? 'candidate_card.pdf' : type === 'protocol' ? 'protocol.pdf' : 'decision_letter.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Ошибка скачивания PDF');
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;
  if (!interview) return <Typography>Собеседование не найдено</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/interviews')} sx={{ mb: 2 }}>
        Назад к списку
      </Button>

      <Typography variant="h4" gutterBottom>Собеседование</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Информация</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography><strong>Кандидат:</strong> {interview.candidateName}</Typography>
                <Typography><strong>Вакансия:</strong> {interview.vacancyTitle}</Typography>
                <Typography><strong>Интервьюер:</strong> {interview.interviewerName}</Typography>
                <Typography>
                  <strong>Дата:</strong>{' '}
                  {new Date(interview.plannedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography>
                  <strong>Статус:</strong>{' '}
                  <Chip size="small" label={statusLabels[interview.status]} color={statusColors[interview.status]} />
                </Typography>
                <Typography>
                  <strong>Решение:</strong>{' '}
                  <Chip size="small" label={decisionLabels[interview.decision]} color={decisionColors[interview.decision]} />
                </Typography>
                {interview.comments && (
                  <Typography><strong>Комментарий:</strong> {interview.comments}</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Действия</Typography>
              <Divider sx={{ mb: 2 }} />

              {canEditMatrix && interview.status === InterviewStatus.Planned && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" onClick={() => handleStatusChange(InterviewStatus.Completed)}>
                    Завершить
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleStatusChange(InterviewStatus.Cancelled)}>
                    Отменить
                  </Button>
                </Box>
              )}

              {canDecide && interview.status === InterviewStatus.Completed && interview.decision === InterviewDecision.Pending && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button size="small" variant="contained" color="success" onClick={() => handleDecision(InterviewDecision.Hired)}>
                    Нанять
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => handleDecision(InterviewDecision.Rejected)}>
                    Отклонить
                  </Button>
                  <Button size="small" variant="contained" color="info" onClick={() => handleDecision(InterviewDecision.NextStage)}>
                    Следующий этап
                  </Button>
                  <Button size="small" variant="contained" color="warning" onClick={() => handleDecision(InterviewDecision.TalentPool)}>
                    Кадровый резерв
                  </Button>
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>PDF-отчёты</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" startIcon={<Download />} onClick={() => downloadPdf('card')}>Карточка кандидата</Button>
                <Button size="small" startIcon={<Download />} onClick={() => downloadPdf('protocol')}>Протокол</Button>
                <Button size="small" startIcon={<Download />} onClick={() => downloadPdf('decision')}>Письмо о решении</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Matrix */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Матрица оценок компетенций</Typography>
                {canEditMatrix && (
                  <Button variant="contained" size="small" onClick={handleSaveMatrix}>
                    Сохранить оценки
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {interview.matrix.length === 0 ? (
                <Typography color="text.secondary">Компетенции не назначены. Создайте собеседование с компетенциями.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Компетенция</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Категория</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Макс. балл</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Оценка</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Комментарий</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interview.matrix.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.competencyName}</TableCell>
                          <TableCell>{m.competencyCategory}</TableCell>
                          <TableCell>{m.maxScore}</TableCell>
                          <TableCell>
                            {canEditMatrix ? (
                              <TextField
                                type="number"
                                size="small"
                                value={matrixScores[m.competencyId]?.score ?? m.score}
                                onChange={(e) => {
                                  const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), m.maxScore);
                                  setMatrixScores({
                                    ...matrixScores,
                                    [m.competencyId]: { ...matrixScores[m.competencyId], score: val, comment: matrixScores[m.competencyId]?.comment ?? '' },
                                  });
                                }}
                                slotProps={{ htmlInput: { min: 0, max: m.maxScore, style: { width: 60 } } }}
                              />
                            ) : (
                              m.score
                            )}
                          </TableCell>
                          <TableCell>
                            {canEditMatrix ? (
                              <TextField
                                size="small"
                                value={matrixScores[m.competencyId]?.comment ?? m.comment ?? ''}
                                onChange={(e) =>
                                  setMatrixScores({
                                    ...matrixScores,
                                    [m.competencyId]: { ...matrixScores[m.competencyId], score: matrixScores[m.competencyId]?.score ?? 0, comment: e.target.value },
                                  })
                                }
                                sx={{ minWidth: 200 }}
                              />
                            ) : (
                              m.comment || '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
