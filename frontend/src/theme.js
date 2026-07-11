import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#06070a',
      paper: '#0c0e15',
      panel: '#101420',
    },
    primary: {
      main: '#7b2cff',
      dark: '#5a19d4',
      light: '#a78bfa',
    },
    secondary: {
      main: '#06f0b4',
      light: '#3df3c4',
      dark: '#03a37b',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    warning: {
      main: '#ff8c00',
      light: '#ffa534',
      dark: '#cc7000',
    },
    error: {
      main: '#ff3860',
      light: '#ff6b8b',
      dark: '#d6002f',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
      disabled: '#6b7280',
    },
    action: {
      active: '#9ca3af',
      hover: 'rgba(255, 255, 255, 0.05)',
      selected: 'rgba(123, 44, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    divider: 'rgba(123, 44, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontSize: '1.45rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontSize: '1.2rem', fontWeight: 600 },
    subtitle1: { fontSize: '1.05rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.95rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: '0.8rem', fontWeight: 400, letterSpacing: '0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #60a5fa 100%)',
            boxShadow: '0 6px 24px rgba(124, 58, 237, 0.5), 0 0 15px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(12, 14, 21, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(123, 44, 255, 0.08)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transition: 'box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(123, 44, 255, 0.08), 0 0 1px rgba(123, 44, 255, 0.08) inset',
            borderColor: 'rgba(123, 44, 255, 0.25)',
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
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#111319',
          '& .MuiTableCell-head': {
            color: '#9ca3af',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
