import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import VacanciesPage from './pages/VacanciesPage';
import InterviewsPage from './pages/InterviewsPage';
import InterviewDetailPage from './pages/InterviewDetailPage';
import CompetenciesPage from './pages/CompetenciesPage';
import UsersPage from './pages/UsersPage';
import AuditLogPage from './pages/AuditLogPage';
import ArchivePage from './pages/ArchivePage';
import theme from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/vacancies" element={<VacanciesPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/interviews/:id" element={<InterviewDetailPage />} />
              <Route path="/competencies" element={<CompetenciesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
              <Route path="/archive" element={<ArchivePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
