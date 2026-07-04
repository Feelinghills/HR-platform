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
  MenuItem,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Add, Block, CheckCircle } from '@mui/icons-material';
import { usersApi } from '../api/users';
import { UserRole, roleLabels, type UserDto } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: UserRole.HR });

  const load = () => {
    setLoading(true);
    usersApi.list().then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError('');
    try {
      await usersApi.create(form);
      setDialogOpen(false);
      setForm({ email: '', password: '', fullName: '', role: UserRole.HR });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка создания');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await usersApi.setStatus(id, !isActive);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Пользователи</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Добавить пользователя
        </Button>
      </Box>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
              <TableCell sx={{ fontWeight: 700 }}>ФИО</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Роль</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Дата создания</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={roleLabels[u.role] || u.role}
                    sx={{
                      backgroundColor: u.role === UserRole.Admin ? '#1976D2' : u.role === UserRole.HR ? '#43A047' : '#FB8C00',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.isActive ? 'Активен' : 'Заблокирован'} color={u.isActive ? 'success' : 'error'} />
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell align="right">
                  <Tooltip title={u.isActive ? 'Заблокировать' : 'Активировать'}>
                    <IconButton size="small" onClick={() => handleToggleStatus(u.id, u.isActive)}>
                      {u.isActive ? <Block fontSize="small" color="error" /> : <CheckCircle fontSize="small" color="success" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый пользователь</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="ФИО *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Пароль *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField select label="Роль *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <MenuItem value={UserRole.Admin}>{roleLabels[UserRole.Admin]}</MenuItem>
              <MenuItem value={UserRole.HR}>{roleLabels[UserRole.HR]}</MenuItem>
              <MenuItem value={UserRole.DecisionMaker}>{roleLabels[UserRole.DecisionMaker]}</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
