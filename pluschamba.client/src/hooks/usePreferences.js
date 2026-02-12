// =============================================================================
// usePreferences Hook
// =============================================================================
// Hook para gestionar preferencias del usuario con persistencia en localStorage
// =============================================================================

import { useState, useCallback } from 'react';
import { 
  getSectionPreferences, 
  updatePreference as savePreference,
  updateSectionPreferences,
} from '../services/preferencesService';

/**
 * Hook para usar preferencias de una sección específica
 * @param {string} section - Nombre de la sección (dashboard, kanban, listView, ui)
 * @returns {Object} { preferences, updatePreference, updatePreferences }
 */
export const usePreferences = (section) => {
  const [preferences, setPreferences] = useState(() => getSectionPreferences(section));

  // Actualizar una preferencia individual
  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      savePreference(section, key, value);
      return updated;
    });
  }, [section]);

  // Actualizar múltiples preferencias
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      updateSectionPreferences(section, updates);
      return updated;
    });
  }, [section]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
  };
};

/**
 * Hook simplificado para una única preferencia
 * @param {string} section - Nombre de la sección
 * @param {string} key - Clave de la preferencia
 * @param {*} defaultValue - Valor por defecto
 * @returns {Array} [value, setValue]
 */
export const useSinglePreference = (section, key, defaultValue) => {
  const { preferences, updatePreference } = usePreferences(section);
  
  const value = preferences[key] ?? defaultValue;
  
  const setValue = useCallback((newValue) => {
    updatePreference(key, newValue);
  }, [key, updatePreference]);

  return [value, setValue];
};

export default usePreferences;
