// =============================================================================
// Task Dialog Component
// =============================================================================
// Modal para crear y editar tareas - Diseño inspirado en Jira
// Optimizado para experiencia móvil con layout vertical adaptativo
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  IconButton,
  Avatar,
  alpha,
  Divider,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import BlockIcon from '@mui/icons-material/Block';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../contexts/useAuth';
import {
  TASK_STATUS,
  PRIORITY_LEVELS,
  KANBAN_COLUMNS,
  getEisenhowerColor,
  CHANGE_TYPES,
  CHANGE_TYPE_LABELS,
} from '../../services/taskService';

const TaskDialog = ({
  open,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  task = null,
  initialStatus = TASK_STATUS.BACKLOG,
  loading = false,
  error = null,
  isMobile: isMobileProp,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = isMobileProp ?? isMobileQuery;
  const isEditing = !!task;
  const titleInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [urgency, setUrgency] = useState(PRIORITY_LEVELS.LOW);
  const [importance, setImportance] = useState(PRIORITY_LEVELS.LOW);
  const [effort, setEffort] = useState(1);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [excludeFromSummary, setExcludeFromSummary] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentActionError, setCommentActionError] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Reset form cuando se abre/cierra
  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || TASK_STATUS.BACKLOG);
        setUrgency(task.urgency || PRIORITY_LEVELS.LOW);
        setImportance(task.importance || PRIORITY_LEVELS.LOW);
        setEffort(task.effort || 1);
        setIsBlocked(task.isBlocked || false);
        setBlockedReason(task.blockedReason || '');
        setExcludeFromSummary(task.excludeFromSummary || false);
        setComments(Array.isArray(task.comments) ? task.comments : []);
      } else {
        setTitle('');
        setDescription('');
        setStatus(initialStatus);
        setUrgency(PRIORITY_LEVELS.LOW);
        setImportance(PRIORITY_LEVELS.LOW);
        setEffort(1);
        setIsBlocked(false);
        setBlockedReason('');
        setExcludeFromSummary(false);
        setComments([]);
      }
      setValidationError('');
      setCommentText('');
      setCommentError('');
      setCommentActionError('');
      setEditingCommentId(null);
      setEditingCommentText('');

      // Enfocar el input del título después de una pequeña pausa
      // para asegurar que el diálogo esté completamente renderizado
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open, task, initialStatus]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('El título es requerido');
      return;
    }

    await onSave({
      title: trimmedTitle,
      description: description.trim(),
      status,
      urgency,
      importance,
      effort,
      isBlocked,
      blockedReason: isBlocked ? blockedReason.trim() : '',
      excludeFromSummary,
      comments,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && !loading) {
      handleSubmit();
    }
  };

  const handleToggleExcludeFromSummary = () => {
    if (!loading) {
      setExcludeFromSummary((prev) => !prev);
    }
  };

  const eisenhowerColor = getEisenhowerColor(urgency, importance);


  // Formatear fechas
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear fecha relativa para historial
  const formatRelativeDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatDate(timestamp);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
    return initials.join('') || 'U';
  };

  const getCommentIdentity = (comment, index) => {
    return comment.id || comment.timestamp || `index-${index}`;
  };

  const persistComments = async (updatedComments) => {
    if (!task || !onAddComment) return false;
    setCommentSaving(true);
    setCommentActionError('');

    try {
      await onAddComment(task.id, updatedComments);
      setComments(updatedComments);
      return true;
    } catch (err) {
      setCommentActionError(err.message || 'Error al guardar comentarios');
      return false;
    } finally {
      setCommentSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!isEditing || !task || !onAddComment) return;
    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      setCommentError('El comentario no puede estar vacío');
      return;
    }

    const now = new Date().toISOString();
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: trimmedComment,
      timestamp: now,
      author: {
        uid: user?.uid || 'unknown',
        displayName: user?.displayName || 'Usuario',
        photoURL: user?.photoURL || null,
      },
    };

    const updatedComments = [...(comments || []), newComment];
    setCommentError('');

    const saved = await persistComments(updatedComments);
    if (saved) {
      setCommentText('');
    }
  };

  const handleStartEditComment = (comment, index) => {
    setEditingCommentId(getCommentIdentity(comment, index));
    setEditingCommentText(comment.text || '');
    setCommentActionError('');
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentActionError('');
  };

  const handleUpdateComment = async (comment, index) => {
    if (!isEditing) return;
    const trimmedComment = editingCommentText.trim();
    if (!trimmedComment) {
      setCommentActionError('El comentario no puede estar vacío');
      return;
    }

    const targetId = getCommentIdentity(comment, index);
    const updatedComments = comments.map((item, itemIndex) => {
      const identity = getCommentIdentity(item, itemIndex);
      if (identity === targetId) {
        return { ...item, text: trimmedComment };
      }
      return item;
    });

    const saved = await persistComments(updatedComments);
    if (saved) {
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  const handleDeleteComment = async (comment, index) => {
    if (!isEditing) return;
    const confirmDelete = window.confirm('¿Eliminar este comentario?');
    if (!confirmDelete) return;

    const targetId = getCommentIdentity(comment, index);
    const updatedComments = comments.filter((item, itemIndex) => {
      const identity = getCommentIdentity(item, itemIndex);
      return identity !== targetId;
    });

    const saved = await persistComments(updatedComments);
    if (saved && editingCommentId === targetId) {
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  // Obtener label legible para valores
  const getReadableValue = (type, value) => {
    if (!value) return '(vacío)';

    switch (type) {
      case CHANGE_TYPES.STATUS: {
        const col = KANBAN_COLUMNS.find(c => c.id === value);
        return col?.title || value;
      }

      case CHANGE_TYPES.URGENCY:
      case CHANGE_TYPES.IMPORTANCE:
        if (value === PRIORITY_LEVELS.LOW) return 'Baja';
        if (value === PRIORITY_LEVELS.MEDIUM) return 'Media';
        if (value === PRIORITY_LEVELS.HIGH) return 'Alta';
        return value;
      case CHANGE_TYPES.EFFORT:
        return `${value}/5`;
      default:
        return value;
    }
  };

  // Obtener icono para tipo de cambio
  const getChangeIcon = (type) => {
    switch (type) {
      case CHANGE_TYPES.CREATED:
        return <CreateIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.STATUS:
        return <SwapHorizIcon sx={{ fontSize: 14 }} />;

      case CHANGE_TYPES.URGENCY:
        return <AccessTimeIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.IMPORTANCE:
        return <FlagIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.BLOCKED:
        return <BlockIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.SUMMARY_EXCLUDED:
        return <SmartToyIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.ARCHIVED:
        return <ArchiveIcon sx={{ fontSize: 14 }} />;
      case CHANGE_TYPES.UNARCHIVED:
        return <UnarchiveIcon sx={{ fontSize: 14 }} />;
      default:
        return <UpdateIcon sx={{ fontSize: 14 }} />;
    }
  };

  // Obtener historial ordenado (más reciente primero)
  const sortedHistory = task?.history
    ? [...task.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  const sortedComments = comments.length > 0
    ? [...comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      onKeyDown={handleKeyDown}
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '100%' : '90vh',
          borderRadius: isMobile ? 0 : 2,
        }
      }}
    >
      {/* Header con botón cerrar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        pt: { xs: 1.5, sm: 2 },
        pb: 1,
        borderBottom: isMobile ? '1px solid' : 'none',
        borderColor: 'divider',
      }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 1, px: { xs: 2, sm: 3 } }}>
        {(error || validationError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || validationError}
          </Alert>
        )}

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          gap: { xs: 2, sm: 2, md: 3 },
        }}>
          {/* ============================================= */}
          {/* LADO IZQUIERDO - Título y Descripción */}
          {/* ============================================= */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <TextField
              inputRef={titleInputRef}
              autoFocus
              fullWidth
              variant="standard"
              placeholder="Título de la tarea"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={loading}
              error={!!validationError && !title.trim()}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                  tabIndex: 1,
                },
                input: {
                  sx: {
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 600,
                    '&::before': { borderBottom: 'none' },
                    '&:hover:not(.Mui-disabled)::before': { borderBottom: 'none' },
                  }
                }
              }}
              sx={{ mb: { xs: 2, sm: 3 } }}
            />

            {/* Description */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Descripción
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={isMobile ? 3 : 4}
              maxRows={isMobile ? 6 : 12}
              placeholder="Añade una descripción más detallada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              variant="outlined"
              slotProps={{
                htmlInput: {
                  tabIndex: 2,
                }
              }}
              sx={{
                mb: { xs: 2, sm: 3 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.elevated',
                }
              }}
            />


            {/* Blocked Section */}
            <Box sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              backgroundColor: isBlocked ? alpha('#EF4444', 0.1) : 'background.elevated',
              border: isBlocked ? `1px solid ${alpha('#EF4444', 0.3)}` : '1px solid transparent',
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isBlocked}
                    onChange={(e) => setIsBlocked(e.target.checked)}
                    color="error"
                    disabled={loading}
                    size="small"
                    inputProps={{ tabIndex: 3 }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BlockIcon
                      sx={{
                        fontSize: 18,
                        color: isBlocked ? 'error.main' : 'text.disabled'
                      }}
                    />
                    <Typography variant="body2">
                      Tarea bloqueada
                    </Typography>
                  </Box>
                }
              />
              {isBlocked && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="¿Por qué está bloqueada?"
                  value={blockedReason}
                  onChange={(e) => setBlockedReason(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    htmlInput: {
                      tabIndex: 4,
                    }
                  }}
                  sx={{ mt: 1.5 }}
                />
              )}
            </Box>

            {/* Summary Exclusion Section */}
            <Box
              onClick={handleToggleExcludeFromSummary}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                  e.preventDefault();
                  handleToggleExcludeFromSummary();
                }
              }}
              sx={{
                mt: 2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                backgroundColor: excludeFromSummary
                  ? alpha('#6366F1', 0.1)
                  : 'background.elevated',
                border: excludeFromSummary
                  ? `1px solid ${alpha('#6366F1', 0.3)}`
                  : '1px solid transparent',
                cursor: loading ? 'default' : 'pointer',
              }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={excludeFromSummary}
                    onChange={(e) => setExcludeFromSummary(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    color="primary"
                    disabled={loading}
                    size="small"
                    inputProps={{ tabIndex: 5 }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon
                      sx={{
                        fontSize: 18,
                        color: excludeFromSummary ? 'primary.main' : 'text.disabled',
                      }}
                    />
                    <Typography variant="body2">
                      Excluir de resumen IA
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                No se incluirá en el resumen diario.
              </Typography>
            </Box>

            {/* Comentarios */}
            <Box sx={{ my: { xs: 2, sm: 3 } }}>
              <Button
                onClick={() => setCommentsExpanded(!commentsExpanded)}
                startIcon={<ChatBubbleOutlineIcon />}
                endIcon={commentsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  px: 0,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'text.primary',
                  }
                }}
              >
                Comentarios ({sortedComments.length})
              </Button>

              <Collapse in={commentsExpanded}>
                {isEditing ? (
                  <Box sx={{ mt: 1.5 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={4}
                      placeholder="Añade un comentario para la bitácora..."
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        if (commentError) setCommentError('');
                      }}
                      disabled={loading || commentSaving}
                      variant="outlined"
                      error={!!commentError}
                      helperText={commentError || ' '}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.elevated',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        onClick={handleAddComment}
                        size="small"
                        variant="contained"
                        disabled={loading || commentSaving || !commentText.trim()}
                        startIcon={commentSaving ? <CircularProgress size={14} /> : null}
                        sx={{ mt: 1 }}
                      >
                        {commentSaving ? 'Guardando...' : 'Agregar comentario'}
                      </Button>
                    </Box>

                    {sortedComments.length === 0 ? (
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
                        Aún no hay comentarios para esta tarea.
                      </Typography>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        {sortedComments.map((comment, index) => {
                          const authorName = comment.author?.displayName || 'Usuario';
                          const authorInitials = getInitials(authorName);
                          const commentId = getCommentIdentity(comment, index);
                          const isEditingComment = editingCommentId === commentId;

                          return (
                            <Box
                              key={commentId}
                              sx={{
                                display: 'flex',
                                gap: 1.5,
                                mb: 1.5,
                                '&:last-child': { mb: 0 },
                              }}
                            >
                              <Avatar
                                src={comment.author?.photoURL || undefined}
                                sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
                              >
                                {authorInitials}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {authorName}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                      {formatRelativeDate(comment.timestamp)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {isEditingComment ? (
                                      <>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleUpdateComment(comment, index)}
                                          disabled={commentSaving || !editingCommentText.trim()}
                                          sx={{ color: 'success.main' }}
                                        >
                                          <CheckIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={handleCancelEditComment}
                                          disabled={commentSaving}
                                          sx={{ color: 'text.secondary' }}
                                        >
                                          <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </>
                                    ) : (
                                      <>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleStartEditComment(comment, index)}
                                          disabled={commentSaving}
                                          sx={{ color: 'text.secondary' }}
                                        >
                                          <EditIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDeleteComment(comment, index)}
                                          disabled={commentSaving}
                                          sx={{ color: 'error.main' }}
                                        >
                                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                                {isEditingComment ? (
                                  <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    value={editingCommentText}
                                    onChange={(e) => {
                                      setEditingCommentText(e.target.value);
                                      if (commentActionError) setCommentActionError('');
                                    }}
                                    disabled={commentSaving}
                                    variant="outlined"
                                    sx={{
                                      mt: 1,
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'background.elevated',
                                      }
                                    }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                    {comment.text}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    {commentActionError && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        {commentActionError}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                    Guarda la tarea para habilitar comentarios.
                  </Typography>
                )}
              </Collapse>
            </Box>

            {/* ============================================= */}
            {/* HISTORIAL DE CAMBIOS */}
            {/* ============================================= */}
            {isEditing && sortedHistory.length > 0 && (
              <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                <Button
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                  startIcon={<HistoryIcon />}
                  endIcon={historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    px: 0,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'text.primary',
                    }
                  }}
                >
                  Historial de cambios ({sortedHistory.length})
                </Button>

                <Collapse in={historyExpanded}>
                  <Box sx={{
                    mt: 2,
                    maxHeight: { xs: 200, sm: 300 },
                    overflowY: 'auto',
                    pr: 1,
                  }}>
                    {sortedHistory.map((change, index) => (
                      <Box
                        key={change.id || index}
                        sx={{
                          display: 'flex',
                          gap: { xs: 1, sm: 1.5 },
                          mb: 2,
                          '&:last-child': { mb: 0 },
                        }}
                      >
                        {/* Timeline dot */}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pt: 0.5,
                        }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: change.type === CHANGE_TYPES.CREATED
                              ? alpha('#10B981', 0.2)
                              : 'background.elevated',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: change.type === CHANGE_TYPES.CREATED
                              ? '#10B981'
                              : 'text.secondary',
                          }}>
                            {getChangeIcon(change.type)}
                          </Box>
                          {index < sortedHistory.length - 1 && (
                            <Box sx={{
                              width: 2,
                              flex: 1,
                              backgroundColor: 'divider',
                              mt: 0.5,
                              minHeight: 20,
                            }} />
                          )}
                        </Box>

                        {/* Change content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.25 }}>
                            {formatRelativeDate(change.timestamp)}
                          </Typography>

                          {change.type === CHANGE_TYPES.CREATED || change.type === CHANGE_TYPES.ARCHIVED || change.type === CHANGE_TYPES.UNARCHIVED ? (
                            <Typography variant="body2" color="text.secondary">
                              {change.description || 'Tarea creada'}
                            </Typography>
                          ) : (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {CHANGE_TYPE_LABELS[change.type] || change.type}
                              </Typography>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexWrap: 'wrap',
                              }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.disabled',
                                    textDecoration: 'line-through',
                                    maxWidth: 150,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {getReadableValue(change.type, change.oldValue)}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">→</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    maxWidth: 150,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {getReadableValue(change.type, change.newValue)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>

          {/* ============================================= */}
          {/* LADO DERECHO - Detalles y Configuración */}
          {/* ============================================= */}
          <Box sx={{
            width: { xs: '100%', sm: '100%', md: 280 },
            flexShrink: 0,
            borderLeft: { xs: 'none', sm: 'none', md: '1px solid' },
            borderTop: { xs: '1px solid', sm: '1px solid', md: 'none' },
            borderColor: 'divider',
            pl: { xs: 0, sm: 0, md: 3 },
            pt: { xs: 2, sm: 2, md: 0 },
          }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Detalles
            </Typography>

            {/* Estado */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr' },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
            }}>
              {/* Estado */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Estado
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                    inputProps={{ tabIndex: 5 }}
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <MenuItem key={col.id} value={col.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: col.color,
                            }}
                          />
                          <Typography noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {col.title}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Matriz de Eisenhower */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Matriz de Eisenhower
            </Typography>

            {/* Urgencia e Importancia en grid para móvil */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr' },
              gap: { xs: 1.5, sm: 2 },
              mb: 2,
            }}>
              {/* Urgencia */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Urgencia
                  </Typography>
                </Box>
                <FormControl fullWidth size="small">
                  <Select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    disabled={loading}
                    inputProps={{ tabIndex: 7 }}
                  >
                    <MenuItem value={PRIORITY_LEVELS.LOW}>Baja</MenuItem>
                    <MenuItem value={PRIORITY_LEVELS.MEDIUM}>Media</MenuItem>
                    <MenuItem value={PRIORITY_LEVELS.HIGH}>Alta</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Importancia */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <FlagIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Importancia
                  </Typography>
                </Box>
                <FormControl fullWidth size="small">
                  <Select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value)}
                    disabled={loading}
                    inputProps={{ tabIndex: 8 }}
                  >
                    <MenuItem value={PRIORITY_LEVELS.LOW}>Baja</MenuItem>
                    <MenuItem value={PRIORITY_LEVELS.MEDIUM}>Media</MenuItem>
                    <MenuItem value={PRIORITY_LEVELS.HIGH}>Alta</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Eisenhower Preview */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: alpha(eisenhowerColor, 0.1),
                border: `1px solid ${alpha(eisenhowerColor, 0.3)}`,
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: eisenhowerColor, fontWeight: 600, fontSize: '0.7rem' }}>
                {urgency === PRIORITY_LEVELS.HIGH && importance === PRIORITY_LEVELS.HIGH && '🔥 HACER YA'}
                {urgency !== PRIORITY_LEVELS.HIGH && importance === PRIORITY_LEVELS.HIGH && '📅 PLANIFICAR'}
                {urgency === PRIORITY_LEVELS.HIGH && importance !== PRIORITY_LEVELS.HIGH && '👥 DELEGAR'}
                {urgency !== PRIORITY_LEVELS.HIGH && importance !== PRIORITY_LEVELS.HIGH && '🗑️ REVISAR'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Esfuerzo */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Esfuerzo: {effort}/5
              </Typography>
              <Slider
                value={effort}
                onChange={(_, value) => setEffort(value)}
                min={1}
                max={5}
                step={1}
                marks
                disabled={loading}
                size="small"
                tabIndex={9}
              />
            </Box>

            {/* Metadata - Solo en modo edición y desktop */}
            {isEditing && task && !isMobile && (
              <>
                <Divider sx={{ my: 2 }} />

                {/* Fecha de creación */}
                {task.createdAt && (
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        Creada
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(task.createdAt)}
                    </Typography>
                  </Box>
                )}

                {/* Última actualización */}
                {task.updatedAt && (
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <UpdateIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        Actualizada
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(task.updatedAt)}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 2 },
        pt: { xs: 1, sm: 1 },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        gap: { xs: 1, sm: 0 },
        borderTop: isMobile ? '1px solid' : 'none',
        borderColor: 'divider',
      }}>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {isEditing && onDelete && (
            <Button
              onClick={() => onDelete(task)}
              color="error"
              disabled={loading}
              size="small"
              fullWidth={isMobile}
            >
              Eliminar
            </Button>
          )}
        </Box>
        <Box sx={{
          display: 'flex',
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
          flexDirection: { xs: 'row', sm: 'row' },
        }}>
          <Button
            onClick={onClose}
            disabled={loading}
            color="inherit"
            size="small"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !title.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            size="small"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
