# Arquitectura - App Registro Fotos Frontend Administrativo

## Descripción General

Esta aplicación web administrativa está construida con **Vue.js 3** utilizando la **Composition API**, desarrollada en **JavaScript** (no TypeScript) y estilizada con **Bootstrap 5**. La aplicación está diseñada para ser un panel de control completo que permite a los administradores gestionar usuarios, monitorear operadores en tiempo real y revisar todas las fotografías capturadas.

## Stack Tecnológico

### Frontend Framework
- **Vue.js 3**: Framework progresivo para construir interfaces de usuario
- **Composition API**: API de composición para mejor organización del código
- **JavaScript**: Lenguaje de programación (sin TypeScript)

### Framework de Estilos
- **Bootstrap 5**: Framework CSS para diseño responsivo y componentes UI
- **CSS3**: Estilos personalizados cuando sea necesario

### Mapeo y Geolocalización
- **OpenStreetMap**: Mapa base de código abierto
- **OpenLayers**: Biblioteca JavaScript para mapas interactivos
- **Geolocation API**: API nativa del navegador para ubicación

### Herramientas de Desarrollo
- **Vite**: Build tool y dev server rápido
- **ESLint**: Linting de código JavaScript
- **Prettier**: Formateo de código

## Estructura del Proyecto

```
frontend-admin/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.vue
│   │   │   ├── Topbar.vue
│   │   │   ├── Loading.vue
│   │   │   └── Modal.vue
│   │   ├── map/
│   │   │   ├── MapContainer.vue
│   │   │   ├── OperatorMarker.vue
│   │   │   ├── PhotoMarker.vue
│   │   │   ├── RoutePath.vue
│   │   │   └── MapControls.vue
│   │   ├── modals/
│   │   │   ├── OperatorDetailModal.vue
│   │   │   ├── PhotoDetailModal.vue
│   │   │   └── UserManagementModal.vue
│   │   └── forms/
│   │       ├── UserForm.vue
│   │       ├── ProfileForm.vue
│   │       └── CommentForm.vue
│   ├── views/
│   │   ├── Welcome.vue
│   │   ├── Home.vue
│   │   ├── UserManagement.vue
│   │   └── Profile.vue
│   ├── composables/
│   │   ├── useMap.js
│   │   ├── useOperators.js
│   │   ├── usePhotos.js
│   │   ├── useUsers.js
│   │   └── useAuth.js
│   ├── stores/
│   │   ├── mapStore.js
│   │   ├── operatorStore.js
│   │   ├── photoStore.js
│   │   └── userStore.js
│   ├── router/
│   │   └── index.js
│   ├── utils/
│   │   ├── api.js
│   │   ├── mapHelpers.js
│   │   └── helpers.js
│   ├── App.vue
│   └── main.js
├── package.json
├── vite.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Arquitectura de Componentes

### 1. Componentes Base (common/)
- **Header.vue**: Navegación principal y branding
- **Topbar.vue**: Barra superior con menú contextual y controles
- **Loading.vue**: Componente de carga reutilizable
- **Modal.vue**: Componente base para modales

### 2. Componentes de Mapa (map/)
- **MapContainer.vue**: Contenedor principal del mapa con OpenStreetMap y OpenLayers
- **OperatorMarker.vue**: Marcador para operadores en el mapa
- **PhotoMarker.vue**: Marcador para ubicaciones de fotos
- **RoutePath.vue**: Visualización de recorridos de operadores
- **MapControls.vue**: Controles y filtros del mapa

### 3. Componentes de Modales (modals/)
- **OperatorDetailModal.vue**: Modal con detalles del operador y sus fotos
- **PhotoDetailModal.vue**: Modal con foto completa y comentarios
- **UserManagementModal.vue**: Modal para gestión de usuarios

### 4. Componentes de Formularios (forms/)
- **UserForm.vue**: Formulario para crear/editar usuarios
- **ProfileForm.vue**: Formulario para editar perfil
- **CommentForm.vue**: Formulario para agregar comentarios

### 5. Vistas (views/)
- **Welcome.vue**: Pantalla de bienvenida para usuarios no autenticados
- **Home.vue**: Vista principal con mapa y controles
- **UserManagement.vue**: Gestión completa de usuarios
- **Profile.vue**: Edición de perfil personal

## Composition API y Composables

### useMap.js
Composable para manejar la lógica del mapa:
- Inicialización de OpenStreetMap con OpenLayers
- Gestión de marcadores y capas
- Control de filtros y vistas
- Actualización en tiempo real

### useOperators.js
Composable para manejar operadores:
- Estado reactivo de operadores y ubicaciones
- Funciones para obtener y actualizar ubicaciones
- Manejo de estados online/offline
- Filtrado de operadores

### usePhotos.js
Composable para manejar la lógica de fotos:
- Estado reactivo de fotos, loading y errores
- Funciones para obtener fotos por operador
- Manejo de comentarios
- Filtrado y ordenamiento

### useUsers.js
Composable para gestión de usuarios:
- Estado reactivo de usuarios
- Funciones CRUD para usuarios
- Reset de contraseñas
- Validaciones de formularios

### useAuth.js
Composable para manejar la autenticación:
- Estado del usuario autenticado
- Funciones de login y logout
- Verificación de roles y permisos
- Computed properties para autenticación

## Gestión de Estado

### Store Pattern (múltiples stores)

#### mapStore.js
Store reactivo para gestionar el estado del mapa:
- Estado de filtros activos
- Marcadores visibles
- Configuración del mapa
- Métodos para actualizar filtros

#### operatorStore.js
Store para gestión de operadores:
- Lista de operadores activos
- Ubicaciones en tiempo real
- Estados online/offline
- Métodos para actualizar ubicaciones

#### photoStore.js
Store para gestión de fotos:
- Fotos por operador
- Filtros de fecha y ubicación
- Comentarios y metadatos
- Métodos para agregar comentarios

#### userStore.js
Store para gestión de usuarios:
- Lista de usuarios del sistema
- Estados de creación/edición
- Validaciones y errores
- Métodos CRUD

## Integración con OpenStreetMap y OpenLayers

### Configuración del Mapa
```javascript
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'

const map = new Map({
  target: 'map', // id o referencia del div
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([LONGITUD, LATITUD]),
    zoom: 13
  })
})
```

### Marcadores de Operadores
- Marcadores personalizados con colores por operador
- Tooltips con información básica
- Actualización en tiempo real de posiciones
- Indicadores de estado (online/offline)

### Marcadores de Fotos
- Marcadores específicos para ubicaciones de fotos
- Tooltips con información de la foto
- Click para abrir modal de detalles
- Agrupación por proximidad

### Recorridos de Operadores
- Líneas de recorrido con colores por operador
- Puntos con timestamps
- Animación de movimiento
- Filtrado por rango de fechas

## Routing

### Router Configuration
Configuración de rutas con Vue Router:
- Rutas protegidas para administradores
- Redirección automática según autenticación
- Lazy loading de componentes
- Props para pasar parámetros

```javascript
const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  }
];
```

## Patrones de Diseño

### 1. Single File Components (SFC)
- Cada componente en un archivo `.vue`
- Template, script y estilos en un solo archivo
- Mejor organización y mantenibilidad

### 2. Composition API
- Uso de `setup()` function
- Composables reutilizables
- Mejor tree-shaking y optimización

### 3. Props Down, Events Up
- Comunicación unidireccional entre componentes
- Props para pasar datos hacia abajo
- Events para comunicar cambios hacia arriba

### 4. Modal Pattern
- Modales reutilizables y anidables
- Gestión de estado de modales
- Overlay y backdrop management

### 5. Filter Pattern
- Filtros independientes y combinables
- Estado reactivo de filtros
- Actualización automática de vistas

## Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (ej: `MapContainer.vue`)
- **Composables**: camelCase con prefijo `use` (ej: `useMap.js`)
- **Archivos**: kebab-case para assets y utils
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Estructura de Componentes
Organización estándar de Single File Components con:
- Template para la estructura HTML
- Script con Composition API usando setup()
- Estilos scoped para encapsulación
- Props, emits y composables bien definidos

## Optimizaciones

### 1. Lazy Loading
- Carga diferida de componentes y rutas
- Lazy loading de imágenes de mapa
- Carga progresiva de datos de operadores

### 2. Component Caching
- Uso de keep-alive para mantener estado
- Caché de datos de mapa
- Memoización de filtros

### 3. Map Optimization
- Clustering de marcadores cercanos
- Lazy loading de tiles de mapa
- Optimización de actualizaciones en tiempo real

### 4. Image Optimization
- Lazy loading de imágenes
- Compresión de fotos
- Formatos modernos (WebP)
- Responsive images

## Testing

### Estrategia de Testing
- **Unit Tests**: Vitest para componentes y composables
- **Integration Tests**: Testing Library para interacciones
- **E2E Tests**: Cypress para flujos completos
- **Map Tests**: Testing de funcionalidades de mapa

### Estructura de Tests
```
tests/
├── unit/
│   ├── components/
│   ├── composables/
│   └── stores/
├── integration/
│   ├── map/
│   └── modals/
└── e2e/
    ├── user-management/
    └── map-monitoring/
```

## Deployment

### Build Process
Comandos para desarrollo y producción:
- Desarrollo con hot reload
- Build optimizado para producción
- Preview del build de producción

### Configuración de Vite
Configuración del bundler con alias de rutas y optimizaciones para el build de producción.

## Consideraciones de Seguridad

### 1. Validación de Inputs
- Validación en frontend y backend
- Sanitización de datos
- Prevención de XSS

### 2. Autenticación y Autorización
- JWT tokens
- Verificación de roles de administrador
- Refresh tokens
- Logout automático

### 3. CORS
- Configuración apropiada para desarrollo y producción
- Headers de seguridad

### 4. Permisos de Mapa
- Control de acceso a datos de ubicación
- Filtrado por permisos de usuario
- Logs de auditoría

## Monitoreo y Logging

### Error Handling
Manejo global de errores con captura centralizada y envío a servicios de monitoreo para debugging y análisis.

### Performance Monitoring
- Web Vitals
- Bundle analysis
- Runtime performance
- Map rendering performance

### Real-time Monitoring
- WebSocket connections
- Latencia de actualizaciones
- Estado de operadores
- Métricas de uso

## Funcionalidades Específicas del Administrador

### Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles
- Reset de contraseñas
- Estados activo/inactivo

### Monitoreo en Tiempo Real
- Ubicación de operadores
- Estados online/offline
- Historial de movimientos
- Alertas de inactividad

### Gestión de Fotos
- Visualización de todas las fotos
- Filtros por operador y fecha
- Comentarios administrativos
- Exportación de datos

### Filtros Avanzados
- Filtros independientes y combinables
- Filtro por operadores específicos
- Vista de fotos vs operadores vs recorridos
- Reset de filtros

## Conclusión

Esta arquitectura proporciona una base sólida para un panel de administración Vue.js moderno, mantenible y escalable. La combinación de Composition API, OpenStreetMap, JavaScript y Bootstrap 5 ofrece un desarrollo eficiente con capacidades avanzadas de monitoreo y gestión de usuarios.
