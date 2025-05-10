import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  typography: {
    fontFamily: 'Roboto Slab, Arial, sans-serif',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#d05ce3',
      dark: '#6a0080',
      contrastText: '#ffffff',
    },
    background: {
      default: '#D8D8D8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    action: {
      active: 'rgb(73, 12, 180)',                                
      hover: 'rgb(113, 65, 197)',
      selected: 'rgba(63, 15, 145, 0.93)',
      disabled: 'rgba(124, 58, 237, 0.38)',
      disabledBackground: 'rgba(124, 58, 237, 0.12)',
      focus: 'rgba(124, 58, 237, 0.83)',
    },
  },
});
