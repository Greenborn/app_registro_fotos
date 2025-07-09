# App Registro Fotos

## 📱 Descripción General

Aplicación web móvil para el registro y gestión de fotografías con información geográfica y temporal. El sistema permite a los operadores capturar fotos con metadatos GPS y a los administradores monitorear en tiempo real y gestionar usuarios.

## 🎯 Características Principales

### Para Operadores
- 📸 **Captura de fotos** exclusivamente con cámara del dispositivo
- 📍 **Geolocalización automática** con GPS
- 🧭 **Orientación** (brújula) si está disponible
- 💬 **Comentarios** opcionales en cada foto
- 📱 **Seguimiento en tiempo real** de ubicación
- 🖼️ **Galería personal** con lazy loading
- 👤 **Gestión de perfil** (foto, nombre, contraseña)

### Para Administradores
- 👥 **Gestión completa de usuarios** (CRUD, roles, reset de contraseñas)
- 🗺️ **Monitoreo en tiempo real** de operadores en mapa
- 📊 **Visualización de fotos** con filtros avanzados
- 🛤️ **Recorridos de operadores** con timestamps
- 💬 **Comentarios administrativos** en fotos
- 📋 **Logs de auditoría** para todas las acciones

## 🏗️ Arquitectura del Sistema

### Frontend
- **Vue.js 3** con Composition API
- **Bootstrap 5** para interfaz responsiva
- **OpenStreetMap** + **Leaflet.js** para mapas
- **JavaScript** (sin TypeScript)

### Backend
- **Node.js** con **Express.js**
- **Knex.js** como query builder
- **WebSockets** para comunicación en tiempo real
- **Rate limiting** para control de peticiones

### Base de Datos
- **PostgreSQL/MySQL/SQLite** (configurable)
- **10 tablas principales** para gestión completa
- **Soporte para metadatos GPS** y auditoría

## 📚 Documentación

### 📋 Historias de Usuario
- [**Historias de Usuario - Operador**](./documentacion/user_histories/usuario_operador.md)
  - Captura de fotos con cámara
  - Seguimiento de ubicación en tiempo real
  - Gestión de galería personal
  - Edición de perfil

- [**Historias de Usuario - Administrador**](./documentacion/user_histories/usuario_admin.md)
  - Gestión completa de usuarios
  - Monitoreo en tiempo real
  - Filtros avanzados de mapa
  - Logs de auditoría

- [**Índice de Historias de Usuario**](./documentacion/user_histories/user_histories.md)
  - Enlaces a todas las historias de usuario

### 🏛️ Arquitectura Técnica

#### Frontend
- [**Arquitectura Frontend Operador**](./documentacion/front_operador/front_operador_arquitectura.md)
  - Componentes específicos para operadores
  - Integración con cámara y GPS
  - Optimizaciones móviles

- [**Arquitectura Frontend Administrativo**](./documentacion/front_admin/front_admin_arquitectura.md)
  - Panel de control administrativo
  - Monitoreo en tiempo real
  - Gestión de usuarios

#### Backend
- [**Arquitectura Backend**](./documentacion/back/back_arquitectura.md)
  - API REST con Express.js
  - WebSockets para tiempo real
  - Rate limiting y seguridad

- [**Modelos de Datos**](./documentacion/back/modelos_datos.md)
  - 10 tablas principales
  - Estructura de base de datos
  - Tipos de datos específicos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Base de datos (PostgreSQL/MySQL/SQLite)
- Navegador moderno con soporte para:
  - Geolocation API
  - MediaDevices API (cámara)
  - WebSockets

### Instalación del Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run migrate
npm run seed
npm start
```

### Instalación del Frontend Operador
```bash
cd frontend-operator
npm install
npm run dev
```

### Instalación del Frontend Administrativo
```bash
cd frontend-admin
npm install
npm run dev
```

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
# Base de datos
DB_CLIENT=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_registro_fotos
DB_USER=usuario
DB_PASSWORD=contraseña

# JWT
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# WebSockets
WS_PORT=3001
```

### Configuración de Mapas
- **OpenStreetMap**: Configurado por defecto
- **Leaflet.js**: Biblioteca de mapas
- **Geolocation API**: Para ubicación en tiempo real

## 📱 Uso del Sistema

### Operador
1. **Inicio de sesión** en la aplicación móvil
2. **Visualización de mapa** con ubicación actual
3. **Captura de fotos** con botón "Tomar Foto"
4. **Agregar comentarios** opcionales
5. **Revisar galería** de fotos tomadas
6. **Editar perfil** desde menú

### Administrador
1. **Inicio de sesión** en panel administrativo
2. **Visualización de mapa** con operadores activos
3. **Gestión de usuarios** (crear, editar, eliminar)
4. **Monitoreo en tiempo real** de ubicaciones
5. **Revisión de fotos** con filtros avanzados
6. **Configuración del sistema**

## 🔐 Seguridad

### Autenticación
- **JWT tokens** para sesiones
- **Refresh tokens** para renovación
- **Verificación de roles** (operador/admin)

### Permisos
- **Solicitud de permisos** de cámara y ubicación
- **Validación de inputs** en frontend y backend
- **Logs de auditoría** para acciones administrativas

### Rate Limiting
- **Control de peticiones** por endpoint
- **Límites diferenciados** por tipo de usuario
- **Protección contra abuso**

## 📊 Monitoreo y Logs

### Métricas de Rendimiento
- **Web Vitals** para frontend
- **Tiempo de respuesta** de API
- **Precisión de ubicación** GPS
- **Tasa de éxito** en captura de fotos

### Logs de Auditoría
- **Acciones administrativas** registradas
- **Cambios en usuarios** y configuraciones
- **Acceso a datos sensibles**
- **Errores del sistema**

## 🧪 Testing

### Estrategia de Testing
- **Unit Tests**: Componentes y composables
- **Integration Tests**: API y mapas
- **E2E Tests**: Flujos completos de usuario
- **Performance Tests**: Rendimiento de mapas y cámara

### Comandos de Testing
```bash
# Backend
npm run test
npm run test:integration

# Frontend
npm run test:unit
npm run test:e2e
```

## 🚀 Deployment

### Producción
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
# Servir archivos estáticos
```

### Docker (Opcional)
```bash
docker-compose up -d
```

## 🤝 Contribución

### Estructura del Proyecto
```
app_registro_fotos/
├── backend/                 # API y lógica de negocio
├── frontend-operator/       # Aplicación móvil para operadores
├── frontend-admin/          # Panel administrativo
├── documentacion/           # Documentación completa
└── README.md               # Este archivo
```

### Guías de Contribución
1. Revisar historias de usuario
2. Seguir arquitectura definida
3. Implementar tests correspondientes
4. Actualizar documentación

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- Revisar la documentación en `/documentacion/`
- Consultar las historias de usuario específicas
- Verificar la arquitectura técnica correspondiente

---

**Desarrollado con ❤️ para gestión eficiente de registro fotográfico con geolocalización**
