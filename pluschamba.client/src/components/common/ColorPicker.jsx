// =============================================================================
// Color Picker Component
// =============================================================================
// Selector de colores simple usando MUI
// =============================================================================

import { Box, Tooltip, alpha } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

// Colores predefinidos para personalización
const DEFAULT_COLORS = [
  { hex: '#2196F3', name: 'Azul' },
  { hex: '#4CAF50', name: 'Verde' },
  { hex: '#FF9800', name: 'Naranja' },
  { hex: '#E91E63', name: 'Rosa' },
  { hex: '#9C27B0', name: 'Púrpura' },
  { hex: '#00BCD4', name: 'Cyan' },
  { hex: '#F44336', name: 'Rojo' },
  { hex: '#607D8B', name: 'Gris' },
  { hex: '#795548', name: 'Marrón' },
  { hex: '#3F51B5', name: 'Índigo' },
  { hex: '#009688', name: 'Teal' },
  { hex: '#FF5722', name: 'Naranja Oscuro' },
];

const ColorPicker = ({ value, onChange, colors = DEFAULT_COLORS }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 1,
      }}
    >
      {colors.map((color) => (
        <Tooltip key={color.hex} title={color.name} arrow>
          <Box
            onClick={() => onChange(color.hex)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: color.hex,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: value === color.hex
                ? '3px solid white'
                : '3px solid transparent',
              boxShadow: value === color.hex
                ? `0 0 0 2px ${color.hex}`
                : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 4px 12px ${alpha(color.hex, 0.4)}`,
              },
            }}
          >
            {value === color.hex && (
              <CheckIcon
                sx={{
                  color: 'white',
                  fontSize: 20,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                }}
              />
            )}
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default ColorPicker;
