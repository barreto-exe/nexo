// =============================================================================
// Kanban Board Component
// =============================================================================
// Tablero Kanban principal con Drag & Drop
// Optimizado para experiencia móvil con scroll horizontal
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
  Fab,
  Tooltip,
} from '@mui/material';
import { DragDropContext } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import KanbanColumn from './KanbanColumn';
import TaskDialog from './TaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';
import SortMenu from './SortMenu';
import { useTasks } from '../../hooks/useTasks';
import { usePreferences } from '../../hooks/usePreferences';
import {
  KANBAN_COLUMNS,
  TASK_STATUS,
  SORT_OPTIONS,
  sortTasks,
} from '../../services/taskService';

const KanbanBoard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    tasks,
    tasksByStatus,
    stats,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    updateTaskStatus,
    reorderTasks,
    deleteTask,
    archiveCompletedTasks,
  } = useTasks();

  // Preferencias persistentes para el Kanban
  const { preferences, updatePreference } = usePreferences('kanban');

  // Sort state - persistente
  const sortOption = preferences.sortOption ?? SORT_OPTIONS.MANUAL;
  const setSortOption = (value) => updatePreference('sortOption', value);

  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialStatus, setInitialStatus] = useState(TASK_STATUS.BACKLOG);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [archiving, setArchiving] = useState(false);

  // Apply sorting to tasks
  const getSortedTasks = useCallback((statusTasks) => {
    return sortTasks(statusTasks, sortOption);
  }, [sortOption]);

  // Drag & Drop handler
  const handleDragEnd = useCallback(async (result) => {
    const { draggableId, source, destination } = result;

    // No destination = dropped outside
    if (!destination) return;

    // Same position = no change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    try {
      // Obtener las tareas de las columnas afectadas
      const sourceColumnTasks = getSortedTasks(tasksByStatus[sourceStatus] || []);
      const destColumnTasks = sourceStatus === destStatus
        ? sourceColumnTasks
        : getSortedTasks(tasksByStatus[destStatus] || []);

      // Encontrar la tarea que se movió
      const movedTask = sourceColumnTasks.find(t => t.id === draggableId);
      if (!movedTask) return;

      if (sourceStatus === destStatus) {
        // Reordenamiento dentro de la misma columna
        const reorderedTasks = Array.from(sourceColumnTasks);
        reorderedTasks.splice(source.index, 1);
        reorderedTasks.splice(destination.index, 0, movedTask);

        // Calcular nuevos órdenes
        const tasksToUpdate = reorderedTasks.map((task, index) => ({
          taskId: task.id,
          order: index * 1000, // Usar múltiplos de 1000 para dejar espacio
        }));

        await reorderTasks(tasksToUpdate);
      } else {
        // Movimiento entre columnas
        // Calcular el nuevo orden basado en la posición de destino
        let newOrder;

        if (destColumnTasks.length === 0) {
          // Columna vacía
          newOrder = 0;
        } else if (destination.index === 0) {
          // Primer lugar
          const firstTask = destColumnTasks[0];
          newOrder = (firstTask.order ?? 0) - 1000;
        } else if (destination.index >= destColumnTasks.length) {
          // Último lugar
          const lastTask = destColumnTasks[destColumnTasks.length - 1];
          newOrder = (lastTask.order ?? 0) + 1000;
        } else {
          // En medio
          const prevTask = destColumnTasks[destination.index - 1];
          const nextTask = destColumnTasks[destination.index];
          const prevOrder = prevTask.order ?? 0;
          const nextOrder = nextTask.order ?? prevOrder + 2000;
          newOrder = Math.floor((prevOrder + nextOrder) / 2);
        }

        await updateTaskStatus(draggableId, destStatus, newOrder);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  }, [updateTaskStatus, reorderTasks, tasksByStatus, getSortedTasks]);

  // Open create dialog
  const handleOpenCreate = (status = TASK_STATUS.BACKLOG) => {
    setSelectedTask(null);
    setInitialStatus(status);
    setDialogError(null);
    setTaskDialogOpen(true);
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

  // Save task
  const handleSaveTask = async (data) => {
    setDialogLoading(true);
    setDialogError(null);

    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, data);
      } else {
        await createTask(data);
      }
      handleCloseTaskDialog();
    } catch (err) {
      setDialogError(err.message || 'Error al guardar la tarea');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleAddComment = async (taskId, updatedComments) => {
    setDialogError(null);

    try {
      await updateTask(taskId, { comments: updatedComments });
    } catch (err) {
      setDialogError(err.message || 'Error al guardar comentario');
      throw err;
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
      handleCloseTaskDialog(); // Close edit dialog if open
    } catch (err) {
      setDialogError(err.message || 'Error al eliminar la tarea');
    } finally {
      setDialogLoading(false);
    }
  };

  // Atajo de teclado global para crear nueva tarea (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K (o Cmd+K en Mac) para abrir diálogo de nueva tarea
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        // Evitar que se abra la barra de búsqueda del navegador
        e.preventDefault();
        // Solo si no hay un diálogo ya abierto
        if (!taskDialogOpen && !deleteDialogOpen) {
          handleOpenCreate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskDialogOpen, deleteDialogOpen]);

  // Handler para archivar tareas completadas
  const handleArchiveCompleted = useCallback(async () => {
    if (stats.done === 0) return;

    setArchiving(true);
    try {
      const count = await archiveCompletedTasks();
      console.log(`${count} tareas archivadas`);
    } catch (err) {
      console.error('Error archivando tareas:', err);
    } finally {
      setArchiving(false);
    }
  }, [archiveCompletedTasks, stats.done]);

  // Loading state
  if (tasksLoading) {
    return (
      <Box>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          gap: 1,
        }}>
          <Skeleton variant="text" width={isMobile ? 150 : 200} height={40} />
          <Skeleton variant="rectangular" width={isMobile ? 100 : 140} height={40} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          overflowX: 'auto',
          pb: 2,
        }}>
          {KANBAN_COLUMNS.map((col) => (
            <Skeleton
              key={col.id}
              variant="rectangular"
              sx={{
                flex: '0 0 auto',
                width: { xs: 260, sm: 280, md: 'auto' },
                minWidth: { md: 280 },
                height: { xs: 300, sm: 400 },
                borderRadius: 2,
              }}
            />
          ))}
        </Box>
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
        {/* Título y badges */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 },
          flexWrap: 'wrap',
        }}>
          <DashboardIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Tablero Kanban
          </Typography>
          <Chip
            label={`${stats.total} tareas`}
            size="small"
            sx={{ ml: { xs: 0, sm: 1 } }}
          />
          {stats.blocked > 0 && (
            <Chip
              label={`${stats.blocked} bloqueadas`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        {/* Controles */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
        }}>
          {/* Sort Options */}
          <SortMenu
            value={sortOption}
            onChange={setSortOption}
            isMobile={isMobile}
          />

          {/* Nueva Tarea - Desktop */}
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCreate()}
            >
              Nueva Tarea
              <Box
                component="kbd"
                sx={{
                  ml: 1,
                  px: 0.5,
                  py: 0.25,
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                  opacity: 0.7,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                }}
              >
                Ctrl + K
              </Box>
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {tasksError && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
          {tasksError}
        </Alert>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            overflowX: 'auto',
            pb: 2,
            minHeight: { xs: 400, sm: 500 },
            // Scroll suave en móvil
            scrollSnapType: { xs: 'x mandatory', sm: 'none' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getSortedTasks(tasksByStatus[column.id] || [])}
              onAddTask={handleOpenCreate}
              onEditTask={handleOpenEdit}
              // Props para archivar - solo columna Done
              canArchive={column.id === TASK_STATUS.DONE}
              archiveCount={stats.done}
              archiving={archiving}
              onArchive={handleArchiveCompleted}
              isMobile={isMobile}
            />
          ))}
        </Box>
      </DragDropContext>

      {/* FAB para nueva tarea en móvil */}
      {isMobile && (
        <Tooltip title="Nueva Tarea">
          <Fab
            color="primary"
            onClick={() => handleOpenCreate()}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={handleCloseTaskDialog}
        onSave={handleSaveTask}
        onAddComment={handleAddComment}
        onDelete={handleOpenDelete}
        task={selectedTask}
        initialStatus={initialStatus}
        loading={dialogLoading}
        error={dialogError}
        isMobile={isMobile}
      />

      {/* Delete Confirmation */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        task={selectedTask}
        loading={dialogLoading}
        error={dialogError}
      />
    </Box>
  );
};

export default KanbanBoard;
