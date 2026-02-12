// =============================================================================
// Sort Menu Component
// =============================================================================
// Menú de ordenamiento visual con categorías y iconos
// =============================================================================

import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import UpdateIcon from '@mui/icons-material/Update';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SpeedIcon from '@mui/icons-material/Speed';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { SORT_OPTIONS } from '../../services/taskService';

/**
 * Configuración de opciones de sorting agrupadas por categoría
 */
const SORT_GROUPS = [
  {
    label: 'Por Prioridad',
    options: [
      {
        id: SORT_OPTIONS.PRIORITY_HIGH,
        label: 'Alta primero',
        description: 'Urgente + Importante',
        icon: KeyboardArrowUpIcon,
        iconColor: '#EF4444'
      },
      {
        id: SORT_OPTIONS.PRIORITY_LOW,
        label: 'Baja primero',
        description: 'Menos urgente',
        icon: KeyboardArrowDownIcon,
        iconColor: '#64748B'
      },
    ],
  },
  {
    label: 'Por Esfuerzo',
    options: [
      {
        id: SORT_OPTIONS.EFFORT_HIGH,
        label: 'Mayor esfuerzo',
        description: 'Tareas grandes',
        icon: FitnessCenterIcon
      },
      {
        id: SORT_OPTIONS.EFFORT_LOW,
        label: 'Menor esfuerzo',
        description: 'Tareas rápidas',
        icon: SpeedIcon
      },
    ],
  },
  {
    label: 'General',
    options: [
      {
        id: SORT_OPTIONS.MANUAL,
        label: 'Manual',
        description: 'Drag & Drop',
        icon: DragIndicatorIcon
      },
    ],
  },
  {
    label: 'Por Fecha',
    options: [
      {
        id: SORT_OPTIONS.CREATED_NEWEST,
        label: 'Más recientes',
        description: 'Creación ↓',
        icon: ScheduleIcon
      },
      {
        id: SORT_OPTIONS.CREATED_OLDEST,
        label: 'Más antiguas',
        description: 'Creación ↑',
        icon: HistoryIcon
      },
      {
        id: SORT_OPTIONS.UPDATED_NEWEST,
        label: 'Actualizadas',
        description: 'Última edición',
        icon: UpdateIcon
      },
    ],
  },
  {
    label: 'Organización',
    options: [
      {
        id: SORT_OPTIONS.ALPHABETICAL_AZ,
        label: 'A → Z',
        description: 'Título alfabético',
        icon: SortByAlphaIcon
      },
      {
        id: SORT_OPTIONS.ALPHABETICAL_ZA,
        label: 'Z → A',
        description: 'Título invertido',
        icon: SortByAlphaIcon
      },
    ],
  },
];

/**
 * Obtiene la opción actual para mostrar en el botón
 */
const getCurrentOption = (sortOption) => {
  for (const group of SORT_GROUPS) {
    const found = group.options.find(opt => opt.id === sortOption);
    if (found) return found;
  }
  return SORT_GROUPS[0].options[0];
};

const SortMenu = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const currentOption = getCurrentOption(value);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (optionId) => {
    onChange(optionId);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<SortIcon />}
        endIcon={<KeyboardArrowDownRoundedIcon
          sx={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />}
        sx={{
          borderColor: open ? 'primary.main' : 'divider',
          backgroundColor: open ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
          textTransform: 'none',
          px: 2,
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ordenar:
          </Typography>
          <Chip
            size="small"
            label={currentOption.label}
            icon={<currentOption.icon sx={{ fontSize: '16px !important' }} />}
            sx={{
              height: 24,
              '& .MuiChip-label': { px: 1 },
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 280,
              maxHeight: 450,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {SORT_GROUPS.map((group, groupIndex) => (
          <Box key={group.label}>
            {groupIndex > 0 && <Divider sx={{ my: 0.5 }} />}

            {/* Group Label */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 2,
                py: 1,
                display: 'block',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.65rem',
              }}
            >
              {group.label}
            </Typography>

            {/* Group Options */}
            {group.options.map((option) => {
              const isSelected = value === option.id;
              const IconComponent = option.icon;

              return (
                <MenuItem
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  selected={isSelected}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <IconComponent
                      fontSize="small"
                      sx={{
                        color: option.iconColor || (isSelected ? 'primary.main' : 'text.secondary')
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={option.label}
                    secondary={option.description}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { fontSize: '0.7rem' }
                    }}
                  />
                  {isSelected && (
                    <CheckIcon
                      fontSize="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </Box>
        ))}
      </Menu>
    </>
  );
};

export default SortMenu;
