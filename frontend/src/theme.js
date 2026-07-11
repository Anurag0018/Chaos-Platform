import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d0e12',
      paper: '#161920',
      panel: '#1e2230',
    },
    primary: {
      main: '#7c3aed', // violet
      dark: '#6d28d9',
      light: '#a78bfa',
    },
    secondary: {
      main: '#10b981', // green for Pod Kill / Success
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#3b82f6', // blue for Network Latency
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    warning: {
      main: '#f97316', // orange for CPU Stress
      light: '#fb923c',
      dark: '#ea580c',
    },
    error: {
      main: '#ef4444', // red for Failed status
      light: '#f87171',
      dark: '#dc2626',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
      disabled: '#6b7280',
    },
    action: {
      active: '#9ca3af',
      hover: 'rgba(255, 255, 255, 0.05)',
      selected: 'rgba(124, 58, 237, 0.15)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
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
          backgroundColor: 'rgba(22, 25, 32, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15), 0 0 1px rgba(255, 255, 255, 0.1) inset',
            borderColor: 'rgba(124, 58, 237, 0.3)',
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
