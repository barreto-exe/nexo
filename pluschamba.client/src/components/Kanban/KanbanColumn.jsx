// =============================================================================
// Kanban Column Component
// =============================================================================
// Columna del Kanban que recibe drops
// Optimizada para experiencia móvil con scroll snap
// =============================================================================

import { memo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  alpha,
} from '@mui/material';
import { Droppable } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import TaskCard from './TaskCard';
import ArchiveConfirmDialog from './ArchiveConfirmDialog';
import { TASK_STATUS } from '../../services/taskService';

const KanbanColumn = memo(({
  column,
  tasks,
  onAddTask,
  onEditTask,
  // Props para archivar (solo columna Done)
  canArchive = false,
  archiveCount = 0,
  archiving = false,
  onArchive,
  isMobile = false,
}) => {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  // Handlers para el dialog de archivar
  const handleOpenArchiveDialog = () => setArchiveDialogOpen(true);
  const handleCloseArchiveDialog = () => setArchiveDialogOpen(false);
  const handleConfirmArchive = async () => {
    if (onArchive) {
      await onArchive();
    }
    handleCloseArchiveDialog();
  };



  return (
    <Paper
      sx={{
        // Responsivo: ancho fijo en móvil para scroll horizontal
        flex: { xs: '0 0 auto', sm: '0 0 auto', md: '1 1 0' },
        width: { xs: 280, sm: 300 },
        minWidth: { xs: 280, sm: 280, md: 280 },
        maxWidth: { xs: 280, sm: 300, md: 350 },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        // Scroll snap en móvil
        scrollSnapAlign: { xs: 'start', sm: 'none' },
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          backgroundColor: alpha(column.color, 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            {/* Color indicator */}
            <Box
              sx={{
                width: { xs: 10, sm: 12 },
                height: { xs: 10, sm: 12 },
                borderRadius: '50%',
                backgroundColor: column.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              noWrap
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {column.title}
            </Typography>
            <Chip
              label={tasks.length}
              size="small"
              sx={{
                height: { xs: 18, sm: 20 },
                minWidth: { xs: 22, sm: 24 },
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 600,
                backgroundColor: alpha(column.color, 0.15),
                color: column.color,
              }}
            />
          </Box>

          {/* Archive Button - Solo para columna Done */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canArchive && archiveCount > 0 && (
              <Tooltip title={`Archivar ${archiveCount} completadas`}>
                <IconButton
                  size="small"
                  onClick={handleOpenArchiveDialog}
                  disabled={archiving}
                  sx={{
                    backgroundColor: alpha(column.color, 0.1),
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      backgroundColor: alpha(column.color, 0.2),
                    },
                  }}
                >
                  <ArchiveIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'success.main' }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Add Task Button */}
            <Tooltip title={`Agregar a ${column.title}`}>
              <IconButton
                size="small"
                onClick={() => onAddTask(column.id)}
                sx={{
                  backgroundColor: alpha(column.color, 0.1),
                  p: { xs: 0.5, sm: 0.75 },
                  '&:hover': {
                    backgroundColor: alpha(column.color, 0.2),
                  },
                }}
              >
                <AddIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: column.color }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Column description - oculto en móvil para ahorrar espacio */}
        {!isMobile && (
          <Typography variant="caption" color="text.secondary">
            {column.description}
          </Typography>
        )}
      </Box>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              p: { xs: 1, sm: 1.5 },
              overflowY: 'auto',
              minHeight: { xs: 150, sm: 200 },
              maxHeight: { xs: 350, sm: 'none' },
              backgroundColor: snapshot.isDraggingOver
                ? alpha(column.color, 0.08)
                : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasks.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  minHeight: { xs: 80, sm: 120 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: snapshot.isDraggingOver
                    ? column.color
                    : 'divider',
                  borderRadius: 2,
                  opacity: snapshot.isDraggingOver ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.disabled"
                  textAlign="center"
                >
                  {snapshot.isDraggingOver
                    ? '¡Suelta aquí!'
                    : 'Sin tareas'}
                </Typography>
              </Box>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  isMobile={isMobile}
                />
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>

      {/* Archive Confirmation Dialog */}
      {canArchive && (
        <ArchiveConfirmDialog
          open={archiveDialogOpen}
          onClose={handleCloseArchiveDialog}
          onConfirm={handleConfirmArchive}
          count={archiveCount}
          loading={archiving}
        />
      )}
    </Paper>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
