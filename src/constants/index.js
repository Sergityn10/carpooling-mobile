// YouConnext - Brand Colors & Constants
// Basado en la imagen de marca de YouConnext

// Colores principales
export const COLORS = {
  // Azul Eléctrico (Juventud y Movimiento)
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#3385FF',

  // Amarillo Sol (Comunidad)
  secondary: '#FFB800',
  secondaryDark: '#E6A500',
  secondaryLight: '#FFCC33',

  // Verde Esmeralda (Sostenibilidad)
  accent: '#00B894',
  accentDark: '#009874',
  accentLight: '#33C9A9',

  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#333333',
  gray700: '#1A1A1A',
  gray800: '#0D0D0D',

  // Estados
  success: '#00B894',
  warning: '#FFB800',
  error: '#FF4757',
  info: '#0066FF',

  // Fondos
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  cardBackground: '#FFFFFF',
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente
export const FONTS = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  title: 40,
};

// Sombras
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TIMEOUT: 10000,
};

// Configuración de GPS
export const GPS_CONFIG = {
  ACCURACY_HIGH: 10,
  ACCURACY_MEDIUM: 50,
  ACCURACY_LOW: 100,
  TRACKING_INTERVAL: 5000, // 5 segundos
  MIN_DISTANCE: 10, // metros
};

// Estados de viaje
export const VIAJE_ESTADO = {
  PENDIENTE: 'pendiente',
  ACTIVO: 'activo',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};