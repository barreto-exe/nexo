// =============================================================================
// Summary Service
// =============================================================================
// Servicio para generar resúmenes de Daily Stand-up con IA
// Llama al backend .NET para la generación con OpenAI/GitHub Models
// =============================================================================

/**
 * Datos de tarea para el resumen
 * @typedef {Object} TaskDataForSummary
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} urgency
 * @property {string} importance
 * @property {boolean} isBlocked
 * @property {string} blockedReason
 * @property {string} updatedAt
 * @property {TaskCommentForSummary[]} comments
 */

/**
 * Comentario de tarea para el resumen
 * @typedef {Object} TaskCommentForSummary
 * @property {string} text
 * @property {string} timestamp
 * @property {string} authorName
 */

/**
 * Request para generar resumen
 * @typedef {Object} SummaryRequest
 * @property {TaskDataForSummary[]} completedTasks - Tareas completadas del último día activo
 * @property {TaskDataForSummary[]} pendingTasks - Tareas pendientes (Todo + InProgress)
 */

/**
 * Response del resumen generado
 * @typedef {Object} SummaryResponse
 * @property {string} summary - Texto del resumen generado
 * @property {boolean} success - Si la operación fue exitosa
 * @property {string} [error] - Mensaje de error si no fue exitoso
 */

/**
 * Mapea una tarea al formato requerido por el backend
 * @param {Object} task - Tarea completa
 * @returns {TaskDataForSummary}
 */
const mapTaskForSummary = (task) => ({
  title: task.title,
  description: task.description || '',
  status: task.status,
  urgency: task.urgency,
  importance: task.importance,
  isBlocked: task.isBlocked || false,
  blockedReason: task.blockedReason || '',
  updatedAt: task.updatedAt,
  comments: Array.isArray(task.comments)
    ? [...task.comments]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3)
        .map((comment) => ({
          text: comment.text || '',
          timestamp: comment.timestamp,
          authorName: comment.author?.displayName || 'Usuario',
        }))
    : [],
});

/**
 * Tipos de cambio que NO cuentan como actividad real para el summary.
 * Archivar/desarchivar y excluir del resumen no representan trabajo real.
 */
const IGNORED_CHANGE_TYPES = new Set([
  'archived',
  'unarchived',
  'summary_excluded',
]);

/**
 * Obtiene la fecha de la última actividad significativa de una tarea.
 * Revisa el historial de cambios y comentarios para determinar cuándo hubo
 * trabajo real (cambio de estado, edición, comentarios, etc.) ignorando
 * acciones administrativas como archivar/desarchivar.
 * @param {Object} task
 * @returns {Date|null}
 */
const getLastMeaningfulActivityDate = (task) => {
  let latestDate = null;

  // Revisar historial de cambios significativos
  if (Array.isArray(task.history)) {
    for (const entry of task.history) {
      if (IGNORED_CHANGE_TYPES.has(entry.type)) continue;
      const entryDate = new Date(entry.timestamp);
      if (!latestDate || entryDate > latestDate) {
        latestDate = entryDate;
      }
    }
  }

  // Revisar comentarios (bitácora) como actividad significativa
  if (Array.isArray(task.comments)) {
    for (const comment of task.comments) {
      const commentDate = new Date(comment.timestamp);
      if (!latestDate || commentDate > latestDate) {
        latestDate = commentDate;
      }
    }
  }

  // Fallback a createdAt si no hay historial ni comentarios
  if (!latestDate && task.createdAt) {
    latestDate = new Date(task.createdAt);
  }

  return latestDate;
};

/**
 * Obtiene las tareas completadas del último día activo
 * Usa el historial de cambios significativos (no updatedAt) para determinar
 * cuándo hubo trabajo real, evitando que tareas solo archivadas aparezcan.
 * @param {Object[]} tasks - Todas las tareas
 * @returns {Object[]} Tareas completadas del último día con actividad real
 */
export const getLastActiveDayCompletedTasks = (tasks) => {
  // Filtrar tareas Done (incluye archivadas para el resumen del último día)
  const doneTasks = tasks.filter(
    (task) => task.status === 'Done' && !task.excludeFromSummary
  );

  if (doneTasks.length === 0) return [];

  // Calcular última actividad significativa para cada tarea
  const tasksWithActivity = doneTasks
    .map((task) => ({
      task,
      lastActivity: getLastMeaningfulActivityDate(task),
    }))
    .filter(({ lastActivity }) => lastActivity !== null);

  if (tasksWithActivity.length === 0) return [];

  // Ordenar por última actividad significativa descendente
  tasksWithActivity.sort((a, b) => b.lastActivity - a.lastActivity);

  // Obtener la fecha del último día activo (solo fecha, sin hora)
  const lastActiveDate = new Date(tasksWithActivity[0].lastActivity);
  lastActiveDate.setHours(0, 0, 0, 0);

  // Filtrar tareas del mismo día de actividad significativa
  const tasksFromLastActiveDay = tasksWithActivity
    .filter(({ lastActivity }) => {
      const activityDate = new Date(lastActivity);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === lastActiveDate.getTime();
    })
    .map(({ task }) => task);

  return tasksFromLastActiveDay;
};

/**
 * Obtiene las tareas pendientes (Todo + InProgress)
 * @param {Object[]} tasks - Todas las tareas
 * @returns {Object[]} Tareas pendientes ordenadas por prioridad
 */
export const getPendingTasks = (tasks) => {
  const pendingTasks = tasks.filter(
    (task) =>
      (task.status === 'Todo' || task.status === 'InProgress') &&
      !task.archived &&
      !task.excludeFromSummary
  );

  // Ordenar: InProgress primero, luego por urgencia/importancia
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };

  return pendingTasks.sort((a, b) => {
    // InProgress primero
    if (a.status === 'InProgress' && b.status !== 'InProgress') return -1;
    if (a.status !== 'InProgress' && b.status === 'InProgress') return 1;

    // Luego por bloqueadas (no bloqueadas primero)
    if (a.isBlocked !== b.isBlocked) return a.isBlocked ? 1 : -1;

    // Luego por urgencia + importancia
    const priorityA =
      (priorityOrder[a.urgency] || 1) + (priorityOrder[a.importance] || 1);
    const priorityB =
      (priorityOrder[b.urgency] || 1) + (priorityOrder[b.importance] || 1);
    return priorityB - priorityA;
  });
};

/**
 * Obtiene la URL base de la API
 * En desarrollo usa el proxy de Vite (/api), en producción usa la variable de entorno
 */
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

/**
 * Genera un resumen de Daily Stand-up usando IA
 * @param {Object[]} allTasks - Todas las tareas del usuario
 * @returns {Promise<SummaryResponse>}
 */
export const generateSummary = async (allTasks) => {
  const filteredTasks = allTasks;

  const completedTasks = getLastActiveDayCompletedTasks(filteredTasks);
  const pendingTasks = getPendingTasks(filteredTasks);

  /** @type {SummaryRequest} */
  const request = {
    completedTasks: completedTasks.map(mapTaskForSummary),
    pendingTasks: pendingTasks.map(mapTaskForSummary),
  };

  const apiUrl = `${getApiBaseUrl()}/api/generate-summary`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error del servidor: ${response.status}`
    );
  }

  return response.json();
};
