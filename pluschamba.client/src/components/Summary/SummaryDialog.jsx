// =============================================================================
// Summary Dialog Component
// =============================================================================
// Modal para mostrar y copiar el resumen de Daily Stand-up generado con IA
// =============================================================================

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const SummaryDialog = ({ open, onClose, summary, loading, error }) => {
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;

    try {
      // Convertir markdown básico a texto plano para copiar
      const plainText = summary
        .replace(/\*\*/g, '') // Remover negrita
        .replace(/📋|🎯|🚧/g, (match) => match + ' '); // Añadir espacio después de emojis

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setSnackbarOpen(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  // Helper para renderizar texto con negritas
  const renderRichText = (text) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Box component="span" key={index} sx={{ color: 'primary.main', fontWeight: 600 }}>
            {part.slice(2, -2)}
          </Box>
        );
      }
      return part;
    });
  };

  // Parsear el contenido estructurado
  const parseContent = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const nodes = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        nodes.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('-')) {
        currentList.push(trimmed.substring(1).trim());
      } else {
        flushList();
        // Check for headers (starts with emoji)
        if (/^(📋|🎯|🚧)/.test(trimmed)) {
           nodes.push({ type: 'header', content: trimmed });
        } else {
           nodes.push({ type: 'paragraph', content: trimmed });
        }
      }
    });
    flushList();
    return nodes;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pr: 6,
          }}
        >
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" component="span">
            Resumen Daily Stand-up
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 4,
              }}
            >
              <CircularProgress size={40} />
              <Typography color="text.secondary">
                Generando resumen con IA...
              </Typography>
            </Box>
          )}

          {error && !loading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {summary && !loading && (
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {parseContent(summary).map((node, i) => {
                if (node.type === 'header') {
                  return (
                    <Typography 
                      key={i} 
                      variant="subtitle1" 
                      component="div" 
                      sx={{ 
                        mt: i === 0 ? 0 : 3, 
                        mb: 1.5, 
                      }}
                    >
                       {renderRichText(node.content)}
                    </Typography>
                  );
                }
                if (node.type === 'list') {
                  return (
                    <Box component="ul" key={i} sx={{ m: 0, pl: 2, '& li': { mb: 1, color: 'text.primary' } }}>
                      {node.items.map((item, j) => (
                        <li key={j}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {renderRichText(item)}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  );
                }
                return (
                   <Typography key={i} variant="body2" component="p" sx={{ mb: 1, lineHeight: 1.6 }}>
                      {renderRichText(node.content)}
                   </Typography>
                );
              })}
            </Box>
          )}

          {!summary && !loading && !error && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Presiona "Generar" para crear tu resumen de Daily Stand-up.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {summary && !loading && (
            <Tooltip title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}>
              <Button
                onClick={handleCopy}
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                color={copied ? 'success' : 'primary'}
                variant="outlined"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </Tooltip>
          )}
          <Button onClick={handleClose} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Resumen copiado al portapapeles"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default SummaryDialog;
