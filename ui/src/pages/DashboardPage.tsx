import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { candidatesApi } from '../api/candidates';
import { vacanciesApi } from '../api/vacancies';
import { interviewsApi } from '../api/interviews';
import { InterviewStatus, InterviewDecision, UserRole } from '../types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': onClick
          ? { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(25,118,210,0.15)' }
          : {},
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}15`,
            color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    candidates: 0,
    vacancies: 0,
    interviews: 0,
    planned: 0,
    completed: 0,
    cancelled: 0,
    hired: 0,
    rejected: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      candidatesApi.list(),
      vacanciesApi.list(false),
      interviewsApi.list(),
    ]).then(([c, v, i]) => {
      const interviews = i.data;
      setStats({
        candidates: c.data.length,
        vacancies: v.data.length,
        interviews: interviews.length,
        planned: interviews.filter((x) => x.status === InterviewStatus.Planned).length,
        completed: interviews.filter((x) => x.status === InterviewStatus.Completed).length,
        cancelled: interviews.filter((x) => x.status === InterviewStatus.Cancelled).length,
        hired: interviews.filter((x) => x.decision === InterviewDecision.Hired).length,
        rejected: interviews.filter((x) => x.decision === InterviewDecision.Rejected).length,
        pending: interviews.filter((x) => x.decision === InterviewDecision.Pending).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Добро пожаловать, {user?.fullName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Обзор платформы технических собеседований
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Кандидаты" value={stats.candidates} icon={<PeopleIcon />} color="#1976D2" onClick={() => navigate('/candidates')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Вакансии" value={stats.vacancies} icon={<WorkIcon />} color="#43A047" onClick={() => navigate('/vacancies')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Собеседования" value={stats.interviews} icon={<EventIcon />} color="#FB8C00" onClick={() => navigate('/interviews')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Ожидают решения" value={stats.pending} icon={<PendingIcon />} color="#E53935" />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Собеседования по статусу</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PendingIcon sx={{ color: '#1976D2', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.planned}</Typography>
                <Typography variant="body2" color="text.secondary">Запланировано</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckIcon sx={{ color: '#43A047', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.completed}</Typography>
                <Typography variant="body2" color="text.secondary">Завершено</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CancelIcon sx={{ color: '#E53935', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.cancelled}</Typography>
                <Typography variant="body2" color="text.secondary">Отменено</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {(user?.role === UserRole.Admin || user?.role === UserRole.DecisionMaker) && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>Решения по кандидатам</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckIcon sx={{ color: '#43A047', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.hired}</Typography>
                    <Typography variant="body2" color="text.secondary">Наняты</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CancelIcon sx={{ color: '#E53935', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.rejected}</Typography>
                    <Typography variant="body2" color="text.secondary">Отклонены</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
