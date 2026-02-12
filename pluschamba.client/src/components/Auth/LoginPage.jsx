// =============================================================================
// Login Page Component
// =============================================================================
// Página de inicio de sesión con Google OAuth
// =============================================================================

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../../contexts/useAuth';

const LoginPage = () => {
  const { signIn, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Card
        sx={{
          maxWidth: { xs: '100%', sm: 420 },
          width: '100%',
          textAlign: 'center',
          // On mobile, make the card more full-screen-like
          ...(isMobile && {
            borderRadius: 3,
            boxShadow: 'none',
            backgroundColor: 'background.paper',
          }),
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {/* Logo y Título */}
          <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ mb: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: { xs: '16px', sm: '20px' },
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}
            >
              <DashboardIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'white' }} />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
            >
              Nexo
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Suite de Gestión de Tareas Personal
            </Typography>
          </Stack>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {error}
            </Alert>
          )}

          {/* Features Preview */}
          <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'left' }}>
            <FeatureItem
              emoji="📋"
              text="Tablero Kanban con Matriz de Eisenhower"
              isMobile={isMobile}
            />
            <FeatureItem
              emoji="🎨"
              text="Organización visual con prioridades"
              isMobile={isMobile}
            />
            <FeatureItem
              emoji="🤖"
              text="Resúmenes automáticos para Daily Stand-ups"
              isMobile={isMobile}
            />
            <FeatureItem
              emoji="🔄"
              text="Sincronización en tiempo real"
              isMobile={isMobile}
            />
          </Stack>

          {/* Google Sign In Button */}
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading || isSigningIn}
            startIcon={
              isSigningIn ? (
                <CircularProgress size={isMobile ? 18 : 20} color="inherit" />
              ) : (
                <GoogleIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }} />
              )
            }
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              background: (theme) => theme.palette.primary.main,
              '&:hover': {
                background: (theme) => theme.palette.primary.dark,
              },
            }}
          >
            {isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google'}
          </Button>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              display: 'block',
              mt: { xs: 2, sm: 3 },
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
            }}
          >
            Al continuar, aceptas nuestros términos de servicio
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

// Feature Item Component
const FeatureItem = ({ emoji, text, isMobile }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
    <Typography fontSize={isMobile ? '1rem' : '1.25rem'}>{emoji}</Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
    >
      {text}
    </Typography>
  </Box>
);

export default LoginPage;
