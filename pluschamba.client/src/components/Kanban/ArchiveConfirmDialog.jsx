// =============================================================================
// Archive Confirm Dialog Component
// =============================================================================
// Confirmación para archivar tareas completadas
// =============================================================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';

const ArchiveConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  count = 0,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArchiveIcon sx={{ color: 'white' }} />
        </Box>
        <Typography variant="h6">Archivar Tareas</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas archivar{' '}
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {count} {count === 1 ? 'tarea completada' : 'tareas completadas'}
          </Box>
          ?
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Las tareas archivadas se moverán al historial y no aparecerán en el tablero.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArchiveIcon />}
        >
          {loading ? 'Archivando...' : 'Archivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveConfirmDialog;
