// =============================================================================
// Loading Screen Component
// =============================================================================
// Pantalla de carga mientras se verifica la autenticación
// =============================================================================

import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Stack spacing={3} alignItems="center">
        {/* Logo animado */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              },
              '50%': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
              },
              '100%': {
                transform: 'scale(1)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              },
            },
          }}
        >
          <DashboardIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        {/* Spinner */}
        <CircularProgress size={32} thickness={4} />

        {/* Texto */}
        <Typography variant="body2" color="text.secondary">
          Cargando Nexo...
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingScreen;
