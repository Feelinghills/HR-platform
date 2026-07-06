import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Alert,
  LinearProgress,
  IconButton,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { FilterList, Search, Clear } from '@mui/icons-material';
import { auditApi } from '../api/audit';
import { entityTypeLabels, actionLabels, type AuditLogDto } from '../types';

const actionColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  Create: 'success',
  Update: 'info',
  Archive: 'warning',
  SetStatus: 'info',
  Decide: 'info',
  UpsertMatrix: 'info',
};

const entityTypeColors: Record<string, 'primary' | 'secondary' | 'warning' | 'info' | 'success'> = {
  User: 'primary',
  Candidate: 'info',
  Vacancy: 'warning',
  Interview: 'success',
  Competency: 'secondary',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const availableEntityTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.entityType));
    return Object.entries(entityTypeLabels).filter(([k]) => types.has(k));
  }, [logs]);

  const availableActions = useMemo(() => {
    const actions = new Set(logs.map((l) => l.action));
    return Object.entries(actionLabels).filter(([k]) => actions.has(k));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchName && !(log.performedByName || '').toLowerCase().includes(searchName.toLowerCase())) return false;
      if (dateFrom && new Date(log.performedAt) < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(log.performedAt) > to) return false;
      }
      if (selectedEntityTypes.length > 0 && !selectedEntityTypes.includes(log.entityType)) return false;
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) return false;
      return true;
    });
  }, [logs, searchName, dateFrom, dateTo, selectedEntityTypes, selectedActions]);

  const hasActiveFilters = searchName || dateFrom || dateTo || selectedEntityTypes.length > 0 || selectedActions.length > 0;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await auditApi.list();
      setLogs(res.data);
    } catch {
      setError('Ошибка загрузки журнала');
    } finally {
      setLoading(false);
    }
  };

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const selectAllEntityTypes = () => setSelectedEntityTypes(availableEntityTypes.map(([k]) => k));
  const selectAllActions = () => setSelectedActions(availableActions.map(([k]) => k));

  const clearAllFilters = () => {
    setSearchName('');
    setDateFrom('');
    setDateTo('');
    setSelectedEntityTypes([]);
    setSelectedActions([]);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Журнал изменений</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              color={hasActiveFilters ? 'primary' : 'default'}
              sx={{
                border: '1px solid',
                borderColor: hasActiveFilters ? 'primary.main' : 'divider',
                borderRadius: 2,
                px: 1.5,
              }}
            >
              <FilterList />
              {hasActiveFilters && (
                <Typography variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 600 }}>
                  {(selectedEntityTypes.length > 0 ? 1 : 0) +
                   (selectedActions.length > 0 ? 1 : 0) +
                   (dateFrom ? 1 : 0) +
                   (dateTo ? 1 : 0)}
                </Typography>
              )}
            </IconButton>

            <TextField
              size="small"
              placeholder="Поиск по ФИО..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                },
              }}
              sx={{ minWidth: 250 }}
            />

            {hasActiveFilters && (
              <Button size="small" startIcon={<Clear />} onClick={clearAllFilters}>
                Сбросить фильтры
              </Button>
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
            <TextField
              size="small"
              type="date"
              label="Дата от"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="Дата до"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Область</Typography>
            <Button size="small" onClick={selectAllEntityTypes}>Выбрать все</Button>
          </Box>
          <FormGroup>
            {availableEntityTypes.map(([key, label]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedEntityTypes.includes(key)}
                    onChange={() => toggleEntityType(key)}
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Действие</Typography>
            <Button size="small" onClick={selectAllActions}>Выбрать все</Button>
          </Box>
          <FormGroup>
            {availableActions.map(([key, label]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedActions.includes(key)}
                    onChange={() => toggleAction(key)}
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" onClick={clearAllFilters} startIcon={<Clear />}>
              Удалить все фильтры
            </Button>
            <Button size="small" variant="contained" onClick={() => setFilterAnchor(null)}>
              Применить
            </Button>
          </Box>
        </Box>
      </Popover>

      {loading ? (
        <LinearProgress />
      ) : filteredLogs.length === 0 ? (
        <Typography color="text.secondary">
          {logs.length === 0 ? 'Записей не найдено' : 'Нет записей, соответствующих фильтрам'}
        </Typography>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F9FD' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Область</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Действие</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ID объекта</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Пользователь</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{formatDate(log.performedAt)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={entityTypeLabels[log.entityType] || log.entityType}
                          color={entityTypeColors[log.entityType] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={actionLabels[log.action] || log.action}
                          color={actionColors[log.action] || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {log.entityId.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>{log.performedByName || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
