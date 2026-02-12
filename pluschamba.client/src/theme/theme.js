// =============================================================================
// Material UI Theme Configuration - Dark Mode
// =============================================================================
// Tema oscuro personalizado para PlusChamba
// Incluye: paleta de colores, tipografía, componentes personalizados
// Configuraciones responsivas para experiencia móvil optimizada
// =============================================================================

import { createTheme, alpha } from '@mui/material/styles';

// Breakpoints personalizados para mejor control responsive
const breakpoints = {
  values: {
    xs: 0,      // Móviles pequeños
    sm: 600,    // Móviles grandes / tablets pequeñas
    md: 900,    // Tablets
    lg: 1200,   // Desktop
    xl: 1536,   // Desktop grandes
  },
};

// Paleta de colores personalizada
const palette = {
  mode: 'dark',
  primary: {
    main: '#6366F1',      // Indigo moderno
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981',      // Emerald para acciones secundarias
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  background: {
    default: '#0F172A',   // Slate 900
    paper: '#1E293B',     // Slate 800
    elevated: '#334155',  // Slate 700
  },
  text: {
    primary: '#F8FAFC',   // Slate 50
    secondary: '#94A3B8', // Slate 400
    disabled: '#64748B',  // Slate 500
  },
  divider: alpha('#94A3B8', 0.12),
  // Colores para la matriz de Eisenhower
  eisenhower: {
    urgentImportant: '#EF4444',     // Rojo - Hacer ya
    notUrgentImportant: '#3B82F6',  // Azul - Planificar
    urgentNotImportant: '#F59E0B',  // Amarillo - Delegar
    notUrgentNotImportant: '#64748B', // Gris - Eliminar
  },
  // Estados del Kanban
  kanban: {
    backlog: '#64748B',
    todo: '#3B82F6',
    inProgress: '#F59E0B',
    done: '#10B981',
    blocked: '#EF4444',
  }
};

// Configuración de tipografía
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    // Responsive: móvil más pequeño
    '@media (max-width:600px)': {
      fontSize: '1.75rem',
    },
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    '@media (max-width:600px)': {
      fontSize: '1.5rem',
    },
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width:600px)': {
      fontSize: '1.25rem',
    },
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width:600px)': {
      fontSize: '1.1rem',
    },
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '0.95rem',
    },
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '0.9rem',
    },
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '0.8rem',
    },
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    '@media (max-width:600px)': {
      fontSize: '0.7rem',
    },
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
};

// Componentes personalizados
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: '#334155 #1E293B',
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: '#334155',
          border: '2px solid transparent',
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          backgroundColor: '#1E293B',
        },
        // Mejorar touch en móviles
        '-webkit-tap-highlight-color': 'transparent',
        touchAction: 'manipulation',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        // Touch targets más grandes en móvil
        '@media (max-width:600px)': {
          minHeight: 44,
          padding: '10px 16px',
        },
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        },
      },
      // Botones pequeños para móvil
      sizeSmall: {
        '@media (max-width:600px)': {
          minHeight: 36,
          padding: '6px 12px',
          fontSize: '0.8rem',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        '@media (max-width:600px)': {
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
      rounded: {
        borderRadius: 12,
        '@media (max-width:600px)': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
      },
      sizeSmall: {
        '@media (max-width:600px)': {
          height: 22,
          fontSize: '0.7rem',
        },
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
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        '@media (max-width:600px)': {
          borderRadius: 12,
          margin: 16,
          maxHeight: 'calc(100% - 32px)',
        },
      },
      // Fullscreen en móvil
      paperFullScreen: {
        borderRadius: 0,
      },
    },
  },
  // Tabs responsivos
  MuiTabs: {
    styleOverrides: {
      root: {
        '@media (max-width:600px)': {
          minHeight: 44,
        },
      },
      scrollButtons: {
        '&.Mui-disabled': {
          opacity: 0.3,
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        '@media (max-width:600px)': {
          minHeight: 44,
          padding: '8px 12px',
          fontSize: '0.8rem',
          minWidth: 'auto',
        },
      },
    },
  },
  // IconButton con touch targets adecuados
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '@media (max-width:600px)': {
          padding: 10,
        },
      },
      sizeSmall: {
        '@media (max-width:600px)': {
          padding: 8,
        },
      },
    },
  },
  // Select con mejor tap area
  MuiSelect: {
    styleOverrides: {
      select: {
        '@media (max-width:600px)': {
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
  },
  // FormControl compacto en móvil
  MuiFormControl: {
    styleOverrides: {
      sizeSmall: {
        '@media (max-width:600px)': {
          minWidth: 140,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: '#1E293B',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#1E293B',
        borderRight: '1px solid rgba(148, 163, 184, 0.12)',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#334155',
        borderRadius: 6,
        fontSize: '0.75rem',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

// Crear y exportar el tema
const theme = createTheme({
  breakpoints,
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    ...Array(18).fill('none'), // Rellenar el resto con 'none'
  ],
});

export default theme;
