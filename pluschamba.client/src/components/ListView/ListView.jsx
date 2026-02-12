// =============================================================================
// ListView Component
// =============================================================================
// Vista de tabla estilo Notion para mostrar todas las tareas (incluyendo archivadas)
// Optimizada para móvil: cards en lugar de tabla
// =============================================================================

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Switch,
  FormControlLabel,
  alpha,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ArchiveIcon from '@mui/icons-material/Archive';
import BlockIcon from '@mui/icons-material/Block';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useTasks } from '../../hooks/useTasks';
import { usePreferences } from '../../hooks/usePreferences';
import { TaskDialog, DeleteTaskDialog } from '../Kanban';
import {
  TASK_STATUS,
  PRIORITY_LEVELS,
  getEisenhowerColor,
} from '../../services/taskService';

const ListView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Incluir tareas archivadas
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    unarchiveTask,
  } = useTasks(true); // true para incluir archivadas

  // Preferencias persistentes para ListView
  const { preferences, updatePreference } = usePreferences('listView');
  const {
    showArchived,
    orderBy,
    orderDirection
  } = preferences;

  // Setters que persisten en localStorage
  const setShowArchived = (value) => updatePreference('showArchived', value);
  const setOrderBy = (value) => updatePreference('orderBy', value);
  const setOrderDirection = (value) => updatePreference('orderDirection', value);

  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  // Filtrar y ordenar tareas
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtrar archivadas
    if (!showArchived) {
      filtered = filtered.filter(t => !t.archived);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Manejo especial para fechas
      if (orderBy === 'createdAt' || orderBy === 'updatedAt' || orderBy === 'archivedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      // Manejo especial para strings
      else if (typeof aValue === 'string') {
        return orderDirection === 'asc'
          ? aValue.localeCompare(bValue || '')
          : (bValue || '').localeCompare(aValue);
      }

      if (orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, showArchived, orderBy, orderDirection]);

  // Handlers de ordenamiento
  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('desc');
    }
  };

  // Open edit dialog
  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setDialogError(null);
    setTaskDialogOpen(true);
  };

  // Close task dialog
  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
    setDialogError(null);
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData) => {
    setDialogLoading(true);
    setDialogError(null);

    try {
      if (selectedTask) {
        // Update existing
        await updateTask(selectedTask.id, taskData);
      } else {
        // Create new
        await createTask(taskData);
      }
      handleCloseTaskDialog();
    } catch (err) {
      setDialogError(err.message || 'Error al guardar la tarea');
    } finally {
      setDialogLoading(false);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (task) => {
    setSelectedTask(task);
    setDialogError(null);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedTask(null);
    setDialogError(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    setDialogLoading(true);
    setDialogError(null);

    try {
      await deleteTask(selectedTask.id);
      handleCloseDelete();
      handleCloseTaskDialog();
    } catch (err) {
      setDialogError(err.message || 'Error al eliminar la tarea');
    } finally {
      setDialogLoading(false);
    }
  };

  // Desarchivar tarea
  const handleUnarchive = async (taskId) => {
    try {
      await unarchiveTask(taskId);
    } catch (err) {
      console.error('Error al desarchivar:', err);
    }
  };

  const loading = tasksLoading;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener chip de estado
  const getStatusChip = (status) => {
    const statusConfig = {
      [TASK_STATUS.BACKLOG]: { label: 'Backlog', color: 'default' },
      [TASK_STATUS.TODO]: { label: 'Por Hacer', color: 'primary' },
      [TASK_STATUS.IN_PROGRESS]: { label: 'En Progreso', color: 'warning' },
      [TASK_STATUS.DONE]: { label: 'Completado', color: 'success' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ minWidth: 100 }}
      />
    );
  };

  // Obtener chip de prioridad
  const getPriorityChip = (urgency, importance) => {
    const color = getEisenhowerColor(urgency, importance);
    const labels = {
      [PRIORITY_LEVELS.HIGH]: 'Alta',
      [PRIORITY_LEVELS.MEDIUM]: 'Media',
      [PRIORITY_LEVELS.LOW]: 'Baja',
    };

    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Chip
          label={`U: ${labels[urgency]}`}
          size="small"
          sx={{
            backgroundColor: alpha(color, 0.2),
            color: color,
            fontWeight: 'bold',
            fontSize: '0.7rem'
          }}
        />
        <Chip
          label={`I: ${labels[importance]}`}
          size="small"
          sx={{
            backgroundColor: alpha(color, 0.2),
            color: color,
            fontWeight: 'bold',
            fontSize: '0.7rem'
          }}
        />
      </Box>
    );
  };

  const getCommentsCount = (task) => {
    return Array.isArray(task.comments) ? task.comments.length : 0;
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 2 }} />
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <ViewListIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Vista de Lista
          </Typography>
          <Chip
            label={`${filteredAndSortedTasks.length} tareas`}
            size="small"
            sx={{ ml: { xs: 0, sm: 1 } }}
          />
        </Box>

        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
        }}>
          {/* Toggle mostrar archivadas */}
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            }
            label={isMobile ? 'Archivadas' : 'Mostrar archivadas'}
            sx={{
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {tasksError && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
          {tasksError}
        </Alert>
      )}

      {/* Vista Móvil: Cards */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredAndSortedTasks.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No hay tareas para mostrar
              </Typography>
            </Paper>
          ) : (
            filteredAndSortedTasks.map((task) => (
              <MobileTaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onUnarchive={handleUnarchive}
                formatDate={formatDate}
              />
            ))
          )}
        </Box>
      ) : (
        /* Vista Desktop: Tabla */
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? orderDirection : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Título
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? orderDirection : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prioridad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Comentarios</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'effort'}
                    direction={orderBy === 'effort' ? orderDirection : 'asc'}
                    onClick={() => handleSort('effort')}
                  >
                    Esfuerzo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? orderDirection : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Creada
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'updatedAt'}
                    direction={orderBy === 'updatedAt' ? orderDirection : 'asc'}
                    onClick={() => handleSort('updatedAt')}
                  >
                    Actualizada
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay tareas para mostrar
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    hover
                    sx={{
                      opacity: task.archived ? 0.6 : 1,
                      backgroundColor: task.archived ? (theme) => alpha(theme.palette.action.hover, 0.05) : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.archived && (
                          <Tooltip title="Archivada">
                            <ArchiveIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </Tooltip>
                        )}
                        {task.isBlocked && (
                          <Tooltip title={task.blockedReason || 'Bloqueada'}>
                            <BlockIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          </Tooltip>
                        )}
                        <Typography variant="body2" fontWeight={task.archived ? 'normal' : 'medium'}>
                          {task.title}
                        </Typography>
                      </Box>
                      {task.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 300
                          }}
                        >
                          {task.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getStatusChip(task.status)}</TableCell>
                    <TableCell>{getPriorityChip(task.urgency, task.importance)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          {getCommentsCount(task)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${task.effort || 1}h`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(task.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(task.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {task.archived ? (
                          <Tooltip title="Desarchivar">
                            <IconButton
                              size="small"
                              onClick={() => handleUnarchive(task.id)}
                              color="primary"
                            >
                              <UnarchiveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(task)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(task)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      {taskDialogOpen && (
        <TaskDialog
          open={taskDialogOpen}
          onClose={handleCloseTaskDialog}
          onSave={handleSaveTask}
          onAddComment={async (taskId, updatedComments) => updateTask(taskId, { comments: updatedComments })}
          task={selectedTask}
          initialStatus={selectedTask?.status}
          loading={dialogLoading}
          error={dialogError}
          isMobile={isMobile}
        />
      )}

      {deleteDialogOpen && selectedTask && (
        <DeleteTaskDialog
          open={deleteDialogOpen}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          task={selectedTask}
          loading={dialogLoading}
          error={dialogError}
        />
      )}
    </Box>
  );
};

// =============================================================================
// Mobile Task Card Component
// =============================================================================
// Card compacta para vista de lista en móvil
// =============================================================================
const MobileTaskCard = ({
  task,
  onEdit,
  onDelete,
  onUnarchive,
  formatDate,
}) => {
  const eisenhowerColor = getEisenhowerColor(task.urgency, task.importance);

  const statusConfig = {
    [TASK_STATUS.BACKLOG]: { label: 'Backlog', color: 'default' },
    [TASK_STATUS.TODO]: { label: 'Por Hacer', color: 'primary' },
    [TASK_STATUS.IN_PROGRESS]: { label: 'En Progreso', color: 'warning' },
    [TASK_STATUS.DONE]: { label: 'Completado', color: 'success' },
  };

  const config = statusConfig[task.status] || { label: task.status, color: 'default' };

  return (
    <Card
      sx={{
        opacity: task.archived ? 0.7 : 1,
        borderLeft: `4px solid ${eisenhowerColor}`,
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Header: Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.archived && (
              <Tooltip title="Archivada">
                <ArchiveIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Tooltip>
            )}
            {task.isBlocked && (
              <Tooltip title={task.blockedReason || 'Bloqueada'}>
                <BlockIcon sx={{ fontSize: 14, color: 'error.main' }} />
              </Tooltip>
            )}
            <Chip
              label={config.label}
              color={config.color}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.title}
        </Typography>

        {/* Description */}
        {task.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1,
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Footer: Priority + Date + Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Priority indicators */}
            {(task.urgency === PRIORITY_LEVELS.HIGH || task.urgency === PRIORITY_LEVELS.MEDIUM) && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: alpha(
                  task.urgency === PRIORITY_LEVELS.HIGH ? '#EF4444' : '#F59E0B',
                  0.1
                ),
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
              }}>
                <AccessTimeIcon sx={{ fontSize: 12, color: task.urgency === PRIORITY_LEVELS.HIGH ? '#EF4444' : '#F59E0B' }} />
              </Box>
            )}
            {(task.importance === PRIORITY_LEVELS.HIGH || task.importance === PRIORITY_LEVELS.MEDIUM) && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: alpha(
                  task.importance === PRIORITY_LEVELS.HIGH ? '#EF4444' : '#F59E0B',
                  0.1
                ),
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
              }}>
                <FlagIcon sx={{ fontSize: 12, color: task.importance === PRIORITY_LEVELS.HIGH ? '#EF4444' : '#F59E0B' }} />
              </Box>
            )}
            {/* Date */}
            <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
              {formatDate(task.updatedAt || task.createdAt)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.75 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {Array.isArray(task.comments) ? task.comments.length : 0}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {task.archived ? (
              <IconButton
                size="small"
                onClick={() => onUnarchive(task.id)}
                color="primary"
                sx={{ p: 0.5 }}
              >
                <UnarchiveIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
                color="primary"
                sx={{ p: 0.5 }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onDelete(task)}
              color="error"
              sx={{ p: 0.5 }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ListView;
