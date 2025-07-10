// ===========================================
// Constantes de la Aplicación
// ===========================================

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Panel de Administración',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000'
}

// Configuración del mapa
export const MAP_CONFIG = {
  CENTER: {
    LAT: parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -34.6037,
    LNG: parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || -58.3816
  },
  ZOOM: parseInt(import.meta.env.VITE_MAP_ZOOM) || 10,
  TILE_URL: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: import.meta.env.VITE_MAP_ATTRIBUTION || '© OpenStreetMap contributors'
}

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator'
}

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

// Estados de operador
export const OPERATOR_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
}

// Tipos de filtros del mapa
export const MAP_FILTERS = {
  OPERATORS: 'operators',
  PHOTOS: 'photos',
  ROUTES: 'routes'
}

// Estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Configuración de WebSocket
export const WS_CONFIG = {
  RECONNECT_INTERVAL: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,
  TIMEOUT: parseInt(import.meta.env.VITE_WS_TIMEOUT) || 10000
}

// Configuración de autenticación
export const AUTH_CONFIG = {
  JWT_EXPIRES_IN: parseInt(import.meta.env.VITE_JWT_EXPIRES_IN) || 86400,
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'default-key'
}

// Configuración de UI
export const UI_CONFIG = {
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',
  DEFAULT_LOCALE: import.meta.env.VITE_DEFAULT_LOCALE || 'es',
  DEFAULT_TIMEZONE: import.meta.env.VITE_DEFAULT_TIMEZONE || 'America/Argentina/Buenos_Aires',
  TOAST_DURATION: parseInt(import.meta.env.VITE_TOAST_DURATION) || 5000,
  TOAST_POSITION: import.meta.env.VITE_TOAST_POSITION || 'top-right'
}

// Configuración de rendimiento
export const PERFORMANCE_CONFIG = {
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760,
  LOCATION_UPDATE_INTERVAL: parseInt(import.meta.env.VITE_LOCATION_UPDATE_INTERVAL) || 30000,
  CACHE_DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION) || 300
}

// Configuración de logs
export const LOG_CONFIG = {
  LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  CONSOLE_LOGS: import.meta.env.VITE_CONSOLE_LOGS === 'true'
}

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  OPERATORS: '/operators',
  PHOTOS: '/photos',
  SETTINGS: '/settings',
  PROFILE: '/profile'
}

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  
  // Usuarios
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    OPERATORS: '/users/operators',
    STATS: '/users/stats'
  },
  
  // Fotos
  PHOTOS: {
    LIST: '/photos',
    CREATE: '/photos',
    GET: (id) => `/photos/${id}`,
    UPDATE: (id) => `/photos/${id}`,
    DELETE: (id) => `/photos/${id}`,
    BY_OPERATOR: (operatorId) => `/photos/operator/${operatorId}`,
    ADD_COMMENT: (id) => `/photos/${id}/comments`,
    EXPORT: '/photos/export',
    STATS: '/photos/stats',
    IMAGE: (id) => `/photos/${id}/image`
  },
  
  // Operadores
  OPERATORS: {
    LIST: '/operators',
    LOCATION: (id) => `/operators/${id}/location`,
    STATS: '/operators/stats'
  }
}

// Eventos de WebSocket
export const WS_EVENTS = {
  // Conexión
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Operadores
  OPERATOR_LOCATION: 'operator_location',
  OPERATOR_OFFLINE: 'operator_offline',
  OPERATOR_ONLINE: 'operator_online',
  
  // Fotos
  PHOTO_UPLOADED: 'photo_uploaded',
  PHOTO_DELETED: 'photo_deleted',
  
  // Sistema
  SYSTEM_ALERT: 'system_alert',
  MAINTENANCE: 'maintenance'
}

// Códigos de error
export const ERROR_CODES = {
  // Errores de autenticación
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOKEN_EXPIRED: 401,
  INVALID_TOKEN: 401,
  
  // Errores de validación
  VALIDATION_ERROR: 400,
  MISSING_FIELDS: 400,
  INVALID_FORMAT: 400,
  
  // Errores de servidor
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  
  // Errores de red
  NETWORK_ERROR: 0,
  TIMEOUT: 408,
  
  // Errores de negocio
  USER_NOT_FOUND: 404,
  PHOTO_NOT_FOUND: 404,
  OPERATOR_NOT_FOUND: 404,
  DUPLICATE_USER: 409,
  INVALID_CREDENTIALS: 401
}

// Mensajes de error
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'No autorizado. Por favor, inicie sesión.',
  [ERROR_CODES.FORBIDDEN]: 'Acceso denegado. No tiene permisos para esta acción.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
  [ERROR_CODES.INVALID_TOKEN]: 'Token inválido. Por favor, inicie sesión nuevamente.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Error de validación. Verifique los datos ingresados.',
  [ERROR_CODES.MISSING_FIELDS]: 'Faltan campos requeridos.',
  [ERROR_CODES.INVALID_FORMAT]: 'Formato inválido.',
  [ERROR_CODES.INTERNAL_ERROR]: 'Error interno del servidor.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Servicio no disponible.',
  [ERROR_CODES.NETWORK_ERROR]: 'Error de conexión. Verifique su conexión a internet.',
  [ERROR_CODES.TIMEOUT]: 'Tiempo de espera agotado.',
  [ERROR_CODES.USER_NOT_FOUND]: 'Usuario no encontrado.',
  [ERROR_CODES.PHOTO_NOT_FOUND]: 'Foto no encontrada.',
  [ERROR_CODES.OPERATOR_NOT_FOUND]: 'Operador no encontrado.',
  [ERROR_CODES.DUPLICATE_USER]: 'El usuario ya existe.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales inválidas.'
}

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
}

// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATS: {
    JSON: 'json',
    CSV: 'csv',
    EXCEL: 'xlsx'
  },
  DEFAULT_FORMAT: 'json'
}

// Configuración de archivos
export const FILE_CONFIG = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: 150
}

// Configuración de geolocalización
export const GEO_CONFIG = {
  DEFAULT_ACCURACY: 10, // metros
  MAX_ACCURACY: 100, // metros
  LOCATION_TIMEOUT: 10000, // ms
  HIGH_ACCURACY: true
}

// Configuración de caché
export const CACHE_CONFIG = {
  PREFIX: 'admin_',
  DEFAULT_TTL: 300, // 5 minutos
  MAX_SIZE: 100 // número máximo de elementos
}

// Configuración de seguridad
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: false,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: false
  },
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutos
}

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left'
  },
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  AUTO_CLOSE: true,
  AUTO_CLOSE_DELAY: 5000
}

// Configuración de temas
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// Configuración de idiomas
export const LOCALE_CONFIG = {
  ES: 'es',
  EN: 'en',
  FR: 'fr'
}

// Configuración de zonas horarias
export const TIMEZONE_CONFIG = {
  DEFAULT: 'America/Argentina/Buenos_Aires',
  OPTIONS: [
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Cordoba',
    'America/Argentina/Mendoza',
    'UTC'
  ]
} 