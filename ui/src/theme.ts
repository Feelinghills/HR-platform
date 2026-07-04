import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#90CAF9',
      light: '#BBDEFB',
      dark: '#64B5F6',
      contrastText: '#0D47A1',
    },
    background: {
      default: '#F5F9FD',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#546E7A',
    },
    divider: '#E3EBF2',
    success: { main: '#43A047' },
    warning: { main: '#FB8C00' },
    error: { main: '#E53935' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(25,118,210,0.08)',
          border: '1px solid #E3EBF2',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
