// =============================================================================
// Dashboard Page
// =============================================================================
// Página principal del dashboard con Kanban y gestión de tareas
// Optimizado para experiencia móvil responsiva
// =============================================================================

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ViewListIcon from '@mui/icons-material/ViewList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../contexts/useAuth';
import { useTasks } from '../hooks/useTasks';
import { usePreferences } from '../hooks/usePreferences';
import { KanbanBoard } from '../components/Kanban';
import { ListView } from '../components/ListView';
import { SummaryDialog } from '../components/Summary';
import { generateSummary } from '../services/summaryService';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, stats } = useTasks();
  const { tasks: tasksWithArchived } = useTasks(true); // Para el resumen, incluir archivadas
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado para el diálogo de resumen
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Usar preferencias persistentes
  const { preferences, updatePreference } = usePreferences('dashboard');
  const { activeTab } = preferences;

  // Handler para cambiar tab
  const handleTabChange = (_, newValue) => {
    updatePreference('activeTab', newValue);
  };

  // Handler para generar resumen con IA
  const handleGenerateSummary = async () => {
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryText('');

    try {
      const response = await generateSummary(tasksWithArchived);
      if (response.success) {
        setSummaryText(response.summary);
      } else {
        setSummaryError(response.error || 'Error desconocido al generar el resumen');
      }
    } catch (error) {
      setSummaryError(error.message || 'Error de conexión con el servidor');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handler para cerrar el diálogo de resumen
  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
  };

  // Obtener el saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        mb: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            {getGreeting()}, {firstName} 👋
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Aquí tienes un resumen de tu productividad
          </Typography>
        </Box>
        {/* Botón de Resumen AI - Adaptativo */}
        {isMobile ? (
          <IconButton
            onClick={handleGenerateSummary}
            sx={{
              alignSelf: 'flex-end',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              },
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        ) : (
          <Tooltip title="Generar resumen para Daily Stand-up con IA">
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleGenerateSummary}
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                },
              }}
            >
              Resumen
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<AssignmentIcon />}
            title="Tareas Totales"
            value={String(stats.total)}
            color="primary"
            isMobile={isMobile}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<TrendingUpIcon />}
            title="En Progreso"
            value={String(stats.inProgress)}
            color="warning"
            isMobile={isMobile}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<CheckCircleIcon />}
            title="Completadas"
            value={String(stats.done)}
            color="success"
            isMobile={isMobile}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            icon={<BlockIcon />}
            title="Bloqueadas"
            value={String(stats.blocked)}
            color="error"
            isMobile={isMobile}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 56 },
              py: { xs: 1, sm: 1.5 },
            },
          }}
        >
          <Tab
            icon={<DashboardIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            iconPosition="start"
            label={isMobile ? "" : "Kanban"}
            aria-label="Kanban"
            sx={{ minWidth: { xs: 'auto', sm: 90 } }}
          />
          <Tab
            icon={<ViewListIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            iconPosition="start"
            label={isMobile ? "" : "Lista"}
            aria-label="Lista"
            sx={{ minWidth: { xs: 'auto', sm: 90 } }}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <KanbanBoard />
      )}
      {activeTab === 1 && (
        <ListView />
      )}

      {/* Dialog de Resumen AI */}
      <SummaryDialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        summary={summaryText}
        loading={summaryLoading}
        error={summaryError}
      />
    </Box>
  );
};

// Stat Card Component - Responsivo
const StatCard = ({ icon, title, value, color, isMobile }) => (
  <Paper
    sx={{
      p: { xs: 1.5, sm: 2, md: 3 },
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 1, sm: 1.5, md: 2 },
    }}
  >
    <Box
      sx={{
        width: { xs: 36, sm: 40, md: 48 },
        height: { xs: 36, sm: 40, md: 48 },
        borderRadius: { xs: 1.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}.main`,
        color: 'white',
        opacity: 0.9,
        '& svg': {
          fontSize: { xs: 18, sm: 20, md: 24 },
        },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        noWrap
        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } }}
      >
        {isMobile ? title.split(' ')[0] : title}
      </Typography>
    </Box>
  </Paper>
);

export default Dashboard;
