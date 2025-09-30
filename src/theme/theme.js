import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5b8def',
    },
    secondary: {
      main: '#7ef9a3',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(255, 255, 255, 0.04)',
    },
    text: {
      primary: '#e6eef8',
      secondary: '#97a0b4',
    },
  },
  components: {
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '& .MuiStepLabel-root': {
            '& .MuiStepLabel-label': {
              color: '#97a0b4',
              fontSize: '12px',
              '&.Mui-active': {
                color: '#5b8def',
                fontWeight: 600,
              },
              '&.Mui-completed': {
                color: '#7ef9a3',
              },
            },
            '& .MuiStepIcon-root': {
              color: 'rgba(255, 255, 255, 0.1)',
              '&.Mui-active': {
                color: '#5b8def',
              },
              '&.Mui-completed': {
                color: '#7ef9a3',
              },
            },
          },
          '& .MuiStepConnector-root': {
            '& .MuiStepConnector-line': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-active .MuiStepConnector-line': {
              borderColor: '#5b8def',
            },
            '&.Mui-completed .MuiStepConnector-line': {
              borderColor: '#7ef9a3',
            },
          },
          // Mobile responsive styles
          '@media (max-width: 768px)': {
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-label': {
                fontSize: '10px',
                display: 'none', // Hide labels on mobile
              },
            },
            '& .MuiStepIcon-root': {
              width: '24px',
              height: '24px',
            },
          },
          '@media (max-width: 480px)': {
            '& .MuiStepIcon-root': {
              width: '20px',
              height: '20px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
