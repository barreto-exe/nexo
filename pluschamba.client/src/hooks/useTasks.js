// =============================================================================
// useTasks Hook
// =============================================================================
// Hook para gestionar tareas con estado en tiempo real
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/useAuth';
import {
  subscribeToTasks,
  createTask as createTaskService,
  updateTask as updateTaskService,
  updateTaskStatus as updateTaskStatusService,
  reorderTasks as reorderTasksService,
  deleteTask as deleteTaskService,
  archiveCompletedTasks as archiveCompletedTasksService,
  unarchiveTask as unarchiveTaskService,
  getTasksByStatus,
  TASK_STATUS,
} from '../services/taskService';

export const useTasks = (includeArchived = false) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTasks(user.uid, (tasksData) => {
      setTasks(tasksData);
      setLoading(false);
    }, includeArchived);

    return () => unsubscribe();
  }, [user?.uid, includeArchived]);

  // Crear tarea
  const createTask = useCallback(async (taskData) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const id = await createTaskService(user.uid, taskData);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Actualizar tarea (con historial de cambios)
  const updateTask = useCallback(async (taskId, updates) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      // Obtener la tarea actual para comparar cambios
      const currentTask = tasks.find(t => t.id === taskId);
      await updateTaskService(user.uid, taskId, updates, currentTask);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid, tasks]);

  // Actualizar estado (optimizado para D&D, con historial)
  const updateTaskStatus = useCallback(async (taskId, newStatus, newOrder) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      // Obtener la tarea actual para comparar y registrar historial
      const currentTask = tasks.find(t => t.id === taskId);
      await updateTaskStatusService(user.uid, taskId, newStatus, newOrder, currentTask);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid, tasks]);

  // Reordenar múltiples tareas (para D&D)
  const reorderTasks = useCallback(async (tasksToUpdate) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await reorderTasksService(user.uid, tasksToUpdate);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Eliminar tarea
  const deleteTask = useCallback(async (taskId) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await deleteTaskService(user.uid, taskId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Archivar todas las tareas completadas
  const archiveCompletedTasks = useCallback(async () => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      const count = await archiveCompletedTasksService(user.uid);
      return count;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Restaurar una tarea archivada
  const unarchiveTask = useCallback(async (taskId) => {
    if (!user?.uid) throw new Error('Usuario no autenticado');
    
    try {
      setError(null);
      await unarchiveTaskService(user.uid, taskId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user?.uid]);

  // Obtener tarea por ID
  const getTaskById = useCallback((taskId) => {
    return tasks.find(t => t.id === taskId) || null;
  }, [tasks]);

  // Tareas agrupadas por estado
  const tasksByStatus = useMemo(() => ({
    [TASK_STATUS.BACKLOG]: getTasksByStatus(tasks, TASK_STATUS.BACKLOG),
    [TASK_STATUS.TODO]: getTasksByStatus(tasks, TASK_STATUS.TODO),
    [TASK_STATUS.IN_PROGRESS]: getTasksByStatus(tasks, TASK_STATUS.IN_PROGRESS),
    [TASK_STATUS.DONE]: getTasksByStatus(tasks, TASK_STATUS.DONE),
  }), [tasks]);



  // Estadísticas
  const stats = useMemo(() => ({
    total: tasks.length,
    backlog: tasksByStatus[TASK_STATUS.BACKLOG].length,
    todo: tasksByStatus[TASK_STATUS.TODO].length,
    inProgress: tasksByStatus[TASK_STATUS.IN_PROGRESS].length,
    done: tasksByStatus[TASK_STATUS.DONE].length,
    blocked: tasks.filter(t => t.isBlocked).length,
  }), [tasks, tasksByStatus]);

  return {
    tasks,
    tasksByStatus,
    stats,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    reorderTasks,
    deleteTask,
    archiveCompletedTasks,
    unarchiveTask,
    getTaskById,
  };
};

export default useTasks;
