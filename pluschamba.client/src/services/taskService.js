// =============================================================================
// Tasks Service
// =============================================================================
// Operaciones CRUD para tareas en Firebase Realtime Database
// Path: users/$uid/tasks
// =============================================================================

import {
  database,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
} from '../config/firebase';

/**
 * Estados del Kanban
 */
export const TASK_STATUS = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'InProgress',
  DONE: 'Done',
};

/**
 * Niveles de urgencia/importancia
 */
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

/**
 * Opciones de ordenamiento para tareas
 */
export const SORT_OPTIONS = {
  MANUAL: 'manual',
  CREATED_NEWEST: 'created_newest',
  CREATED_OLDEST: 'created_oldest',
  UPDATED_NEWEST: 'updated_newest',
  UPDATED_OLDEST: 'updated_oldest',
  PRIORITY_HIGH: 'priority_high',
  PRIORITY_LOW: 'priority_low',
  EFFORT_HIGH: 'effort_high',
  EFFORT_LOW: 'effort_low',
  ALPHABETICAL_AZ: 'alphabetical_az',
  ALPHABETICAL_ZA: 'alphabetical_za',
};

/**
 * Configuración de columnas del Kanban
 */
export const KANBAN_COLUMNS = [
  { 
    id: TASK_STATUS.BACKLOG, 
    title: 'Backlog', 
    color: '#64748B',
    description: 'Ideas y tareas futuras'
  },
  { 
    id: TASK_STATUS.TODO, 
    title: 'Por Hacer', 
    color: '#3B82F6',
    description: 'Listo para comenzar'
  },
  { 
    id: TASK_STATUS.IN_PROGRESS, 
    title: 'En Progreso', 
    color: '#F59E0B',
    description: 'Trabajando activamente'
  },
  { 
    id: TASK_STATUS.DONE, 
    title: 'Completado', 
    color: '#10B981',
    description: 'Tareas terminadas'
  },
];

/**
 * Colores de la Matriz de Eisenhower
 */
export const EISENHOWER_COLORS = {
  urgentImportant: '#EF4444',      // Rojo - Hacer ya
  notUrgentImportant: '#3B82F6',   // Azul - Planificar
  urgentNotImportant: '#F59E0B',   // Amarillo - Delegar
  notUrgentNotImportant: '#64748B', // Gris - Eliminar/Posponer
};

/**
 * Tipos de cambios para el historial
 */
export const CHANGE_TYPES = {
  CREATED: 'created',
  STATUS: 'status',
  URGENCY: 'urgency',
  IMPORTANCE: 'importance',
  EFFORT: 'effort',
  TITLE: 'title',
  DESCRIPTION: 'description',
  BLOCKED: 'blocked',
  SUMMARY_EXCLUDED: 'summary_excluded',
  ARCHIVED: 'archived',
  UNARCHIVED: 'unarchived',
};

/**
 * Labels para los tipos de cambio
 */
export const CHANGE_TYPE_LABELS = {
  [CHANGE_TYPES.CREATED]: 'Creación',
  [CHANGE_TYPES.STATUS]: 'Estado',
  [CHANGE_TYPES.URGENCY]: 'Urgencia',
  [CHANGE_TYPES.IMPORTANCE]: 'Importancia',
  [CHANGE_TYPES.EFFORT]: 'Esfuerzo',
  [CHANGE_TYPES.TITLE]: 'Título',
  [CHANGE_TYPES.DESCRIPTION]: 'Descripción',
  [CHANGE_TYPES.BLOCKED]: 'Bloqueada',
  [CHANGE_TYPES.SUMMARY_EXCLUDED]: 'Resumen IA',
  [CHANGE_TYPES.ARCHIVED]: 'Archivada',
  [CHANGE_TYPES.UNARCHIVED]: 'Desarchivada',
};

/**
 * Obtiene el color de Eisenhower según urgencia e importancia
 */
export const getEisenhowerColor = (urgency, importance) => {
  const isUrgent = urgency === PRIORITY_LEVELS.HIGH;
  const isImportant = importance === PRIORITY_LEVELS.HIGH;

  if (isUrgent && isImportant) return EISENHOWER_COLORS.urgentImportant;
  if (!isUrgent && isImportant) return EISENHOWER_COLORS.notUrgentImportant;
  if (isUrgent && !isImportant) return EISENHOWER_COLORS.urgentNotImportant;
  return EISENHOWER_COLORS.notUrgentNotImportant;
};

/**
 * Referencias de Firebase
 */
const getTasksRef = (uid) => ref(database, `users/${uid}/tasks`);
const getTaskRef = (uid, taskId) => ref(database, `users/${uid}/tasks/${taskId}`);

/**
 * Crea una nueva tarea
 */
export const createTask = async (uid, taskData) => {
  const tasksRef = getTasksRef(uid);
  const newTaskRef = push(tasksRef);
  const taskId = newTaskRef.key;
  const now = new Date().toISOString();

  // Crear entrada inicial del historial
  const initialHistory = [{
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: CHANGE_TYPES.CREATED,
    timestamp: now,
    description: 'Tarea creada',
  }];

  const task = {
    id: taskId,
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    status: taskData.status || TASK_STATUS.BACKLOG,
    urgency: taskData.urgency || PRIORITY_LEVELS.LOW,
    importance: taskData.importance || PRIORITY_LEVELS.LOW,
    isBlocked: taskData.isBlocked || false,
    blockedReason: taskData.blockedReason?.trim() || '',
    excludeFromSummary: taskData.excludeFromSummary || false,
    effort: taskData.effort || 1,
    order: taskData.order ?? Date.now(), // Para mantener el orden en el Kanban
    history: initialHistory,
    comments: Array.isArray(taskData.comments) ? taskData.comments : [],
    createdAt: now,
    updatedAt: now,
  };

  await set(newTaskRef, task);
  return taskId;
};

/**
 * Obtiene todas las tareas del usuario (una vez)
 */
export const getTasks = async (uid) => {
  const tasksRef = getTasksRef(uid);
  const snapshot = await get(tasksRef);

  if (!snapshot.exists()) {
    return [];
  }

  return Object.values(snapshot.val());
};

/**
 * Suscripción en tiempo real a las tareas
 * @param {boolean} includeArchived - Si es true, incluye tareas archivadas
 */
export const subscribeToTasks = (uid, callback, includeArchived = false) => {
  const tasksRef = getTasksRef(uid);

  return onValue(tasksRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const tasksObj = snapshot.val();
    let tasksArray = Object.values(tasksObj);
    
    // Filtrar tareas archivadas a menos que se indique lo contrario
    if (!includeArchived) {
      tasksArray = tasksArray.filter(task => !task.archived);
    }
    
    // Ordenar por 'order' ascendente (menor orden = más arriba)
    tasksArray.sort((a, b) => {
      const orderA = a.order ?? new Date(a.createdAt).getTime();
      const orderB = b.order ?? new Date(b.createdAt).getTime();
      return orderA - orderB;
    });

    callback(tasksArray);
  });
};

/**
 * Actualiza una tarea con tracking de cambios
 */
export const updateTask = async (uid, taskId, updates, currentTask = null) => {
  const taskRef = getTaskRef(uid, taskId);
  const now = new Date().toISOString();
  
  const updateData = {
    ...updates,
    updatedAt: now,
  };

  if (updates.title) {
    updateData.title = updates.title.trim();
  }
  if (updates.description !== undefined) {
    updateData.description = updates.description.trim();
  }

  // Generar historial de cambios si tenemos la tarea actual
  if (currentTask) {
    const changes = generateChangeHistory(currentTask, updates, now);
    if (changes.length > 0) {
      const existingHistory = currentTask.history || [];
      updateData.history = [...existingHistory, ...changes];
    }
  }

  await update(taskRef, updateData);
};

/**
 * Genera entradas de historial comparando la tarea actual con los updates
 */
const generateChangeHistory = (currentTask, updates, timestamp) => {
  const changes = [];
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Comparar cada campo trackeable
  if (updates.title !== undefined && updates.title.trim() !== currentTask.title) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.TITLE,
      timestamp,
      oldValue: currentTask.title,
      newValue: updates.title.trim(),
    });
  }

  if (updates.description !== undefined && updates.description.trim() !== (currentTask.description || '')) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.DESCRIPTION,
      timestamp,
      oldValue: currentTask.description || '(vacío)',
      newValue: updates.description.trim() || '(vacío)',
    });
  }

  if (updates.status !== undefined && updates.status !== currentTask.status) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.STATUS,
      timestamp,
      oldValue: currentTask.status,
      newValue: updates.status,
    });
  }



  if (updates.urgency !== undefined && updates.urgency !== currentTask.urgency) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.URGENCY,
      timestamp,
      oldValue: currentTask.urgency,
      newValue: updates.urgency,
    });
  }

  if (updates.importance !== undefined && updates.importance !== currentTask.importance) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.IMPORTANCE,
      timestamp,
      oldValue: currentTask.importance,
      newValue: updates.importance,
    });
  }

  if (updates.effort !== undefined && updates.effort !== currentTask.effort) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.EFFORT,
      timestamp,
      oldValue: String(currentTask.effort || 1),
      newValue: String(updates.effort),
    });
  }

  if (updates.isBlocked !== undefined && updates.isBlocked !== currentTask.isBlocked) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.BLOCKED,
      timestamp,
      oldValue: currentTask.isBlocked ? 'Sí' : 'No',
      newValue: updates.isBlocked ? 'Sí' : 'No',
    });
  }

  if (
    updates.excludeFromSummary !== undefined &&
    updates.excludeFromSummary !== currentTask.excludeFromSummary
  ) {
    changes.push({
      id: generateId(),
      type: CHANGE_TYPES.SUMMARY_EXCLUDED,
      timestamp,
      oldValue: currentTask.excludeFromSummary ? 'Sí' : 'No',
      newValue: updates.excludeFromSummary ? 'Sí' : 'No',
    });
  }

  return changes;
};

/**
 * Actualiza solo el estado de una tarea (optimizado para D&D)
 * También registra el cambio en el historial
 */
export const updateTaskStatus = async (uid, taskId, newStatus, newOrder, currentTask = null) => {
  const taskRef = getTaskRef(uid, taskId);
  const now = new Date().toISOString();
  
  const updateData = {
    status: newStatus,
    updatedAt: now,
  };
  
  if (newOrder !== undefined) {
    updateData.order = newOrder;
  }

  // Agregar al historial si hay cambio de estado y tenemos la tarea actual
  if (currentTask && currentTask.status !== newStatus) {
    const existingHistory = currentTask.history || [];
    updateData.history = [...existingHistory, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: CHANGE_TYPES.STATUS,
      timestamp: now,
      oldValue: currentTask.status,
      newValue: newStatus,
    }];
  }
  
  await update(taskRef, updateData);
};

/**
 * Reordena múltiples tareas (para D&D dentro de la misma columna)
 */
export const reorderTasks = async (uid, tasksToUpdate) => {
  const updates = {};
  const now = new Date().toISOString();
  
  tasksToUpdate.forEach(({ taskId, order }) => {
    updates[`users/${uid}/tasks/${taskId}/order`] = order;
    updates[`users/${uid}/tasks/${taskId}/updatedAt`] = now;
  });
  
  await update(ref(database), updates);
};

/**
 * Elimina una tarea
 */
export const deleteTask = async (uid, taskId) => {
  const taskRef = getTaskRef(uid, taskId);
  await remove(taskRef);
};

/**
 * Archiva todas las tareas completadas
 * @returns {number} Cantidad de tareas archivadas
 */
export const archiveCompletedTasks = async (uid) => {
  const tasksRef = getTasksRef(uid);
  const snapshot = await get(tasksRef);

  if (!snapshot.exists()) {
    return 0;
  }

  const tasksObj = snapshot.val();
  const completedTasks = Object.entries(tasksObj).filter(
    ([_, task]) => task.status === TASK_STATUS.DONE && !task.archived
  );

  if (completedTasks.length === 0) {
    return 0;
  }

  const now = new Date().toISOString();
  const updates = {};

  completedTasks.forEach(([taskId, task]) => {
    // Crear entrada de historial para el archivado
    const archivedHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: CHANGE_TYPES.ARCHIVED,
      timestamp: now,
      description: 'Tarea archivada',
    };

    updates[`${taskId}/archived`] = true;
    updates[`${taskId}/archivedAt`] = now;
    updates[`${taskId}/updatedAt`] = now;
    updates[`${taskId}/history`] = [...(task.history || []), archivedHistory];
  });

  await update(tasksRef, updates);
  return completedTasks.length;
};

/**
 * Restaura una tarea archivada
 */
export const unarchiveTask = async (uid, taskId) => {
  const taskRef = getTaskRef(uid, taskId);
  const now = new Date().toISOString();

  const snapshot = await get(taskRef);
  if (!snapshot.exists()) {
    throw new Error('Tarea no encontrada');
  }

  const task = snapshot.val();

  // Crear entrada de historial para el desarchivar
  const unarchivedHistory = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: CHANGE_TYPES.UNARCHIVED,
    timestamp: now,
    description: 'Tarea restaurada desde archivo',
  };

  await update(taskRef, {
    archived: false,
    archivedAt: null,
    updatedAt: now,
    history: [...(task.history || []), unarchivedHistory],
  });
};

/**
 * Obtiene el valor numérico de prioridad combinada (urgencia + importancia)
 */
const getPriorityValue = (task) => {
  const priorityMap = { [PRIORITY_LEVELS.HIGH]: 3, [PRIORITY_LEVELS.MEDIUM]: 2, [PRIORITY_LEVELS.LOW]: 1 };
  const urgencyValue = priorityMap[task.urgency] || 1;
  const importanceValue = priorityMap[task.importance] || 1;
  return urgencyValue + importanceValue; // Rango: 2-6
};

/**
 * Ordena tareas según la opción de sorting seleccionada
 */
export const sortTasks = (tasks, sortOption) => {
  if (!tasks || tasks.length === 0) return tasks;

  const sortedTasks = [...tasks];

  switch (sortOption) {
    case SORT_OPTIONS.MANUAL:
      // Ordenar por campo 'order' (comportamiento por defecto)
      return sortedTasks.sort((a, b) => {
        const orderA = a.order ?? new Date(a.createdAt).getTime();
        const orderB = b.order ?? new Date(b.createdAt).getTime();
        return orderA - orderB;
      });

    case SORT_OPTIONS.CREATED_NEWEST:
      return sortedTasks.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

    case SORT_OPTIONS.CREATED_OLDEST:
      return sortedTasks.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );

    case SORT_OPTIONS.UPDATED_NEWEST:
      return sortedTasks.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );

    case SORT_OPTIONS.UPDATED_OLDEST:
      return sortedTasks.sort((a, b) => 
        new Date(a.updatedAt) - new Date(b.updatedAt)
      );

    case SORT_OPTIONS.PRIORITY_HIGH:
      return sortedTasks.sort((a, b) => {
        const diff = getPriorityValue(b) - getPriorityValue(a);
        // Si tienen la misma prioridad, ordenar por createdAt
        if (diff === 0) return new Date(b.createdAt) - new Date(a.createdAt);
        return diff;
      });

    case SORT_OPTIONS.PRIORITY_LOW:
      return sortedTasks.sort((a, b) => {
        const diff = getPriorityValue(a) - getPriorityValue(b);
        if (diff === 0) return new Date(b.createdAt) - new Date(a.createdAt);
        return diff;
      });

    case SORT_OPTIONS.EFFORT_HIGH:
      return sortedTasks.sort((a, b) => {
        const diff = (b.effort || 1) - (a.effort || 1);
        if (diff === 0) return new Date(b.createdAt) - new Date(a.createdAt);
        return diff;
      });

    case SORT_OPTIONS.EFFORT_LOW:
      return sortedTasks.sort((a, b) => {
        const diff = (a.effort || 1) - (b.effort || 1);
        if (diff === 0) return new Date(b.createdAt) - new Date(a.createdAt);
        return diff;
      });

    case SORT_OPTIONS.ALPHABETICAL_AZ:
      return sortedTasks.sort((a, b) => 
        a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
      );

    case SORT_OPTIONS.ALPHABETICAL_ZA:
      return sortedTasks.sort((a, b) => 
        b.title.localeCompare(a.title, 'es', { sensitivity: 'base' })
      );



    default:
      return sortedTasks;
  }
};

/**
 * Obtiene tareas por estado
 */
export const getTasksByStatus = (tasks, status) => {
  return tasks.filter(task => task.status === status);
};
