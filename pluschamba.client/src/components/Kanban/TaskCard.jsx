// =============================================================================
// Task Card Component
// =============================================================================
// Tarjeta de tarea para el Kanban con indicadores visuales
// Optimizada para experiencia móvil compacta
// =============================================================================

import { memo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';
import BlockIcon from '@mui/icons-material/Block';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { getEisenhowerColor, PRIORITY_LEVELS } from '../../services/taskService';

const TaskCard = memo(({
  task,
  index,
  onEdit,
  onToggleBlocked,
  isMobile = false,
}) => {
  const eisenhowerColor = getEisenhowerColor(task.urgency, task.importance);
  const commentsCount = Array.isArray(task.comments) ? task.comments.length : 0;

  // Iconos de urgencia
  const getUrgencyIcon = () => {
    if (task.urgency === PRIORITY_LEVELS.HIGH) {
      return <AccessTimeIcon sx={{ fontSize: 14, color: '#EF4444' }} />;
    }
    if (task.urgency === PRIORITY_LEVELS.MEDIUM) {
      return <AccessTimeIcon sx={{ fontSize: 14, color: '#F59E0B' }} />;
    }
    return null;
  };

  // Iconos de importancia
  const getImportanceIcon = () => {
    if (task.importance === PRIORITY_LEVELS.HIGH) {
      return <FlagIcon sx={{ fontSize: 14, color: '#EF4444' }} />;
    }
    if (task.importance === PRIORITY_LEVELS.MEDIUM) {
      return <FlagIcon sx={{ fontSize: 14, color: '#F59E0B' }} />;
    }
    return null;
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          sx={{
            mb: { xs: 1, sm: 1.5 },
            cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
            borderLeft: `4px solid ${eisenhowerColor}`,
            backgroundColor: snapshot.isDragging
              ? 'background.elevated'
              : 'background.paper',
            boxShadow: snapshot.isDragging
              ? '0 8px 24px rgba(0,0,0,0.3)'
              : 1,
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            transition: 'box-shadow 0.2s, transform 0.2s',
            opacity: task.isBlocked ? 0.85 : 1,
            '&:hover': {
              boxShadow: 3,
            },
            // Touch feedback en móvil
            '&:active': {
              transform: isMobile ? 'scale(0.98)' : 'none',
            },
          }}
        >
          <CardContent sx={{
            p: { xs: 1, sm: 1.5 },
            '&:last-child': { pb: { xs: 1, sm: 1.5 } }
          }}>
            {/* Title */}
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                mb: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                color: task.status === 'Done' ? 'text.secondary' : 'text.primary',
                // Limitar líneas en móvil
                display: '-webkit-box',
                WebkitLineClamp: { xs: 2, sm: 3 },
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.title}
            </Typography>

            {/* Description (truncated) - oculta en móvil si es muy larga */}
            {task.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 1, sm: 2 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                }}
              >
                {task.description}
              </Typography>
            )}

            {/* Footer: Priority indicators + Blocked */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: { xs: 0.5, sm: 1 },
            }}>
              {/* Eisenhower Indicators */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                {/* Urgency */}
                {getUrgencyIcon() && (
                  <Tooltip title={isMobile ? '' : `Urgencia: ${task.urgency}`}>
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
                      {getUrgencyIcon()}
                    </Box>
                  </Tooltip>
                )}

                {/* Importance */}
                {getImportanceIcon() && (
                  <Tooltip title={isMobile ? '' : `Importancia: ${task.importance}`}>
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
                      {getImportanceIcon()}
                    </Box>
                  </Tooltip>
                )}

                {/* Effort - solo en desktop */}
                {!isMobile && task.effort > 1 && (
                  <Tooltip title={`Esfuerzo: ${task.effort}/5`}>
                    <Chip
                      label={`E${task.effort}`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        backgroundColor: 'background.elevated',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

              {/* Summary + Blocked Indicators */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {commentsCount > 0 && (
                  <Tooltip title={isMobile ? '' : `${commentsCount} comentarios`}>
                    <Chip
                      icon={<ChatBubbleOutlineIcon sx={{ fontSize: { xs: '12px !important', sm: '14px !important' } }} />}
                      label={isMobile ? '' : commentsCount}
                      size="small"
                      sx={{
                        height: { xs: 18, sm: 20 },
                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                        backgroundColor: 'background.elevated',
                        '& .MuiChip-icon': {
                          ml: { xs: 0.25, sm: 0.5 },
                          mr: isMobile ? -0.5 : 0,
                        },
                        '& .MuiChip-label': {
                          display: isMobile ? 'none' : 'block',
                          px: isMobile ? 0 : 0.5,
                        },
                        minWidth: isMobile ? 'auto' : 'unset',
                        px: isMobile ? 0.5 : 'unset',
                      }}
                    />
                  </Tooltip>
                )}
                {task.excludeFromSummary && (
                  <Tooltip title={isMobile ? '' : 'Excluida del resumen IA'}>
                    <Chip
                      icon={<SmartToyIcon sx={{ fontSize: { xs: '12px !important', sm: '14px !important' } }} />}
                      label={isMobile ? '' : 'Sin IA'}
                      size="small"
                      color="primary"
                      sx={{
                        height: { xs: 18, sm: 20 },
                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                        '& .MuiChip-icon': {
                          ml: { xs: 0.25, sm: 0.5 },
                          mr: isMobile ? -0.5 : 0,
                        },
                        '& .MuiChip-label': {
                          display: isMobile ? 'none' : 'block',
                          px: isMobile ? 0 : 1,
                        },
                        minWidth: isMobile ? 'auto' : 'unset',
                        px: isMobile ? 0.5 : 'unset',
                      }}
                    />
                  </Tooltip>
                )}

                {task.isBlocked && (
                  <Tooltip title={isMobile ? '' : (task.blockedReason || 'Bloqueada')}>
                    <Chip
                      icon={<BlockIcon sx={{ fontSize: { xs: '12px !important', sm: '14px !important' } }} />}
                      label={isMobile ? '' : 'Bloqueada'}
                      size="small"
                      color="error"
                      sx={{
                        height: { xs: 18, sm: 20 },
                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                        '& .MuiChip-icon': {
                          ml: { xs: 0.25, sm: 0.5 },
                          mr: isMobile ? -0.5 : 0,
                        },
                        '& .MuiChip-label': {
                          display: isMobile ? 'none' : 'block',
                          px: isMobile ? 0 : 1,
                        },
                        minWidth: isMobile ? 'auto' : 'unset',
                        px: isMobile ? 0.5 : 'unset',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
