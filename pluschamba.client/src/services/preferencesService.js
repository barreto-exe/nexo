// =============================================================================
// Preferences Service
// =============================================================================
// Servicio para guardar y recuperar preferencias del usuario en localStorage
// =============================================================================

const STORAGE_KEY = 'pluschamba_preferences';

// Preferencias por defecto
const DEFAULT_PREFERENCES = {
  // Dashboard
  dashboard: {
    activeTab: 0,
  },
  // Kanban Board
  kanban: {
    sortOption: 'manual',
  },
  // ListView
  listView: {
    showArchived: true,
    orderBy: 'updatedAt',
    orderDirection: 'desc',
  },
  // UI preferences
  ui: {
    sidebarCollapsed: false,
  },
};

/**
 * Deep merge de objetos
 * @param {Object} target - Objeto base
 * @param {Object} source - Objeto a mezclar
 * @returns {Object} Objeto mezclado
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Obtener todas las preferencias
 * @returns {Object} Preferencias del usuario
 */
export const getPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    // Merge con defaults para asegurar que nuevas propiedades estén disponibles
    const parsed = JSON.parse(stored);
    return deepMerge(DEFAULT_PREFERENCES, parsed);
  } catch (error) {
    console.error('Error reading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Guardar todas las preferencias
 * @param {Object} preferences - Preferencias completas
 */
export const savePreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

/**
 * Obtener preferencias de una sección específica
 * @param {string} section - Nombre de la sección (dashboard, kanban, listView, ui)
 * @returns {Object} Preferencias de la sección
 */
export const getSectionPreferences = (section) => {
  const prefs = getPreferences();
  return prefs[section] ?? DEFAULT_PREFERENCES[section] ?? {};
};

/**
 * Actualizar preferencias de una sección específica
 * @param {string} section - Nombre de la sección
 * @param {Object} updates - Actualizaciones a aplicar
 */
export const updateSectionPreferences = (section, updates) => {
  const prefs = getPreferences();
  prefs[section] = {
    ...prefs[section],
    ...updates,
  };
  savePreferences(prefs);
};

/**
 * Actualizar una preferencia individual
 * @param {string} section - Nombre de la sección
 * @param {string} key - Clave de la preferencia
 * @param {*} value - Valor a guardar
 */
export const updatePreference = (section, key, value) => {
  const prefs = getPreferences();
  if (!prefs[section]) {
    prefs[section] = {};
  }
  prefs[section][key] = value;
  savePreferences(prefs);
};

/**
 * Resetear todas las preferencias a valores por defecto
 */
export const resetPreferences = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export default {
  getPreferences,
  savePreferences,
  getSectionPreferences,
  updateSectionPreferences,
  updatePreference,
  resetPreferences,
  DEFAULT_PREFERENCES,
};
