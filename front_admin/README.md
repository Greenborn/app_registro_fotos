# Panel de Administración - Registro de Fotos

Frontend de administrador para la aplicación de registro de fotos con geolocalización en tiempo real.

## 🚀 Características

- **Monitoreo en Tiempo Real**: Visualización de operadores y fotos en un mapa interactivo
- **Gestión de Usuarios**: Administración completa de usuarios y permisos
- **Gestión de Fotos**: Revisión y administración de fotos subidas
- **Comunicación WebSocket**: Actualizaciones en tiempo real
- **Interfaz Responsiva**: Diseño adaptativo para diferentes dispositivos
- **Sistema de Notificaciones**: Notificaciones personalizadas sin dependencias externas
- **Autenticación Segura**: Sistema de autenticación con JWT
- **Modo Oscuro**: Soporte para tema oscuro/claro

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Backend de la aplicación funcionando

## 🛠️ Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd app_registro_fotos/front_admin
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar el archivo `.env` con las configuraciones necesarias:
```env
# Configuración del servidor de desarrollo
VITE_DEV_SERVER_PORT=3001
VITE_DEV_SERVER_HOST=localhost

# Configuración de la API
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Configuración de WebSocket
VITE_WS_URL=ws://localhost:3000
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_MAX_RECONNECT_ATTEMPTS=10

# Configuración de autenticación
VITE_AUTH_TOKEN_KEY=admin_auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=admin_refresh_token
VITE_AUTH_TOKEN_EXPIRY=3600
VITE_AUTH_REFRESH_TOKEN_EXPIRY=86400

# Configuración de la aplicación
VITE_APP_NAME=Panel de Administración
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_APP_DEBUG=true

# Configuración del mapa
VITE_MAP_DEFAULT_LAT=-37.3217
VITE_MAP_DEFAULT_LNG=-59.1332
VITE_MAP_DEFAULT_ZOOM=10
VITE_MAP_TILE_LAYER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=© OpenStreetMap contributors

# Configuración de notificaciones
VITE_NOTIFICATION_POSITION=top-right
VITE_NOTIFICATION_DURATION=5000
VITE_NOTIFICATION_MAX_VISIBLE=5

# Configuración de archivos
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
VITE_UPLOAD_CHUNK_SIZE=1024000

# Configuración de paginación
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100

# Configuración de caché
VITE_CACHE_DURATION=300000
VITE_CACHE_MAX_ITEMS=1000

# Configuración de logs
VITE_LOG_LEVEL=info
VITE_LOG_MAX_ENTRIES=1000
```

4. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## 🏗️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter y corrige errores
- `npm run format` - Formatea el código con Prettier

## 📁 Estructura del Proyecto

```
src/
├── assets/                 # Recursos estáticos
│   ├── styles/            # Estilos globales
│   │   ├── main.css       # Estilos principales
│   │   └── tailwind.css   # Configuración de Tailwind
│   └── img/               # Imágenes
├── components/            # Componentes Vue
│   ├── common/            # Componentes comunes
│   │   └── NotificationContainer.vue  # Sistema de notificaciones
│   ├── map/               # Componentes del mapa
│   │   ├── MapContainer.vue
│   │   └── OperatorMarker.vue
│   └── modals/            # Modales
│       └── ConfirmationModal.vue
├── composables/           # Composables Vue
│   ├── useMap.js          # Lógica del mapa
│   ├── useNotifications.js # Sistema de notificaciones
│   ├── useOperators.js    # Gestión de operadores
│   ├── usePhotos.js       # Gestión de fotos
│   └── useUsers.js        # Gestión de usuarios
├── stores/                # Stores de Pinia
│   ├── app.js             # Estado global de la app
│   ├── auth.js            # Estado de autenticación
│   └── websocket.js       # Estado de WebSocket
├── utils/                 # Utilidades
│   └── constants.js       # Constantes de la aplicación
├── views/                 # Vistas principales
│   ├── Home.vue           # Vista principal con mapa
│   └── UserManagement.vue # Gestión de usuarios
├── App.vue                # Componente raíz
└── main.js                # Punto de entrada
```

## 🎨 Sistema de Notificaciones

El proyecto incluye un sistema de notificaciones personalizado sin dependencias externas:

### Características:
- **Sin dependencias externas**: No requiere vue-toastification u otras librerías
- **Tipos de notificación**: Success, Error, Warning, Info
- **Posicionamiento configurable**: Top-right, top-left, bottom-right, etc.
- **Auto-remoción**: Las notificaciones se eliminan automáticamente
- **Persistentes**: Opción para notificaciones que requieren acción del usuario
- **Animaciones suaves**: Transiciones de entrada y salida
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Uso:

```javascript
import { useNotifications } from '@/composables/useNotifications'

const { success, error, warning, info, showApiError } = useNotifications()

// Notificaciones básicas
success('Operación completada exitosamente')
error('Ha ocurrido un error')
warning('Advertencia importante')
info('Información relevante')

// Error de API
showApiError(apiError, 'Error al cargar datos')

// Notificación persistente
error('Error crítico', { persistent: true })

// Notificación con duración personalizada
info('Mensaje temporal', { duration: 3000 })
```

## 🔧 Configuración

### Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias:

- **API**: URLs, timeouts, reintentos
- **WebSocket**: URL, intervalos de reconexión
- **Autenticación**: Claves de tokens, duración
- **Mapa**: Coordenadas por defecto, capas de tiles
- **Notificaciones**: Posición, duración, máximo visible
- **Archivos**: Tamaño máximo, tipos permitidos
- **Paginación**: Tamaño de página por defecto
- **Caché**: Duración, máximo de elementos

### Tailwind CSS

El proyecto usa Tailwind CSS con configuración personalizada:

- Colores del tema (primary, secondary, success, warning, danger, info)
- Fuentes personalizadas (Inter, JetBrains Mono)
- Animaciones y transiciones
- Componentes predefinidos (botones, inputs, cards, badges)
- Utilidades personalizadas

## 🔒 Seguridad

- **Autenticación JWT**: Tokens de acceso y renovación
- **Validación de permisos**: Verificación de roles y permisos
- **Sanitización de datos**: Validación de entrada
- **HTTPS**: Uso de conexiones seguras en producción
- **CORS**: Configuración de políticas de origen cruzado

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests con coverage
npm run test:coverage
```

## 📦 Build y Deploy

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Docker
```bash
# Construir imagen
docker build -t admin-frontend .

# Ejecutar contenedor
docker run -p 3001:3001 admin-frontend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico:

- **Email**: soporte@greenborn.com
- **Documentación**: [docs.greenborn.com](https://docs.greenborn.com)
- **Issues**: [GitHub Issues](https://github.com/greenborn/app-registro-fotos/issues)

## 🔄 Changelog

### v1.0.0
- ✅ Sistema de notificaciones personalizado
- ✅ Interfaz de administración completa
- ✅ Monitoreo en tiempo real
- ✅ Gestión de usuarios y fotos
- ✅ Mapa interactivo con Leaflet
- ✅ Autenticación JWT
- ✅ WebSocket para actualizaciones
- ✅ Diseño responsivo con Tailwind CSS
- ✅ Configuración completa con variables de entorno 