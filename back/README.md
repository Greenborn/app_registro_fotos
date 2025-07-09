# Backend - App Registro Fotos

Backend para la aplicación de registro de fotos con geolocalización, construido con Node.js, Express, Knex y PostgreSQL/MySQL/SQLite.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Gestión de usuarios** con roles (admin/operator)
- **Subida y procesamiento de imágenes** con Sharp
- **Geolocalización en tiempo real** con WebSockets
- **Sistema de permisos** granular
- **Logs de auditoría** completos
- **Rate limiting** configurable
- **Compresión** y optimización de respuestas
- **Seguridad** con Helmet y CORS
- **Múltiples bases de datos** soportadas (PostgreSQL, MySQL, SQLite)

## 📋 Requisitos

- Node.js >= 18.0.0
- npm o yarn
- Base de datos (PostgreSQL, MySQL o SQLite)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
cd app_registro_fotos/back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Configuración de Base de Datos
DB_CLIENT=sqlite3
DB_FILENAME=./dev.sqlite3

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Configuración del Servidor
PORT=3000
NODE_ENV=development
```

4. **Ejecutar migraciones**
```bash
npm run migrate
```

5. **Ejecutar seeds (datos iniciales)**
```bash
npm run seed
```

6. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🗄️ Base de Datos

### Migraciones

Las migraciones crean las siguientes tablas:

- `users` - Usuarios del sistema
- `photos` - Fotos subidas
- `photo_comments` - Comentarios en fotos
- `user_locations` - Ubicaciones de usuarios
- `user_sessions` - Sesiones de usuario
- `system_settings` - Configuraciones del sistema
- `audit_logs` - Logs de auditoría
- `location_update_config` - Configuración de actualización de ubicación
- `photo_metadata` - Metadatos de fotos
- `user_permissions` - Permisos de usuario

### Comandos de base de datos

```bash
# Ejecutar migraciones
npm run migrate

# Revertir última migración
npm run migrate:rollback

# Ejecutar seeds
npm run seed

# Ver estado de migraciones
npx knex migrate:status
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_CLIENT` | Cliente de base de datos | `sqlite3` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` (PostgreSQL) / `3306` (MySQL) |
| `DB_NAME` | Nombre de la base de datos | `app_registro_fotos` |
| `DB_USER` | Usuario de la base de datos | - |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token JWT | `24h` |
| `PORT` | Puerto del servidor HTTP | `3000` |
| `WS_PORT` | Puerto del servidor WebSocket | `3001` |
| `UPLOAD_PATH` | Ruta de archivos subidos | `./uploads` |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo | `10485760` (10MB) |

### Configuración de Base de Datos

#### SQLite (Desarrollo)
```env
DB_CLIENT=sqlite3
DB_FILENAME=./dev.sqlite3
```

#### PostgreSQL (Producción)
```env
DB_CLIENT=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_registro_fotos
DB_USER=usuario
DB_PASSWORD=contraseña
```

#### MySQL
```env
DB_CLIENT=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_NAME=app_registro_fotos
DB_USER=usuario
DB_PASSWORD=contraseña
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login de usuario |
| POST | `/api/auth/logout` | Logout de usuario |
| POST | `/api/auth/refresh` | Renovar token |
| GET | `/api/auth/verify` | Verificar token |
| POST | `/api/auth/change-password` | Cambiar contraseña |

### Usuarios

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/users` | Obtener todos los usuarios | Admin |
| GET | `/api/users/operators` | Obtener operadores | Admin |
| GET | `/api/users/stats` | Estadísticas de usuarios | Admin |
| POST | `/api/users` | Crear usuario | Admin |
| GET | `/api/users/:id` | Obtener usuario | Admin/Owner |
| PUT | `/api/users/:id` | Actualizar usuario | Admin/Owner |
| DELETE | `/api/users/:id` | Eliminar usuario | Admin |
| POST | `/api/users/:id/reset-password` | Resetear contraseña | Admin |

### Fotos

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| POST | `/api/photos/upload` | Subir foto | Operator |
| GET | `/api/photos` | Obtener fotos | Admin |
| GET | `/api/photos/my` | Mis fotos | Operator |
| GET | `/api/photos/search` | Buscar fotos | All |
| GET | `/api/photos/location` | Fotos por ubicación | All |
| GET | `/api/photos/stats` | Estadísticas de fotos | All |
| GET | `/api/photos/:id` | Obtener foto | Admin/Owner |
| GET | `/api/photos/:id/comments` | Foto con comentarios | Admin/Owner |
| POST | `/api/photos/:photoId/comments` | Crear comentario | All |
| DELETE | `/api/photos/:id` | Eliminar foto | Admin/Owner |

## 🔐 Autenticación

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Usar token
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📊 WebSockets

El servidor incluye WebSockets para actualizaciones en tiempo real:

### Eventos del cliente al servidor
- `authenticate` - Autenticar conexión
- `location_update` - Actualizar ubicación
- `join_admin_room` - Unirse a sala de administradores

### Eventos del servidor al cliente
- `operator_location` - Ubicación de operador actualizada
- `login_success` - Login exitoso
- `logout_success` - Logout exitoso

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de tests
npm run test:coverage
```

## 📝 Logs

### Logs de Auditoría

El sistema registra automáticamente:
- Logins/logouts
- Creación/actualización/eliminación de recursos
- Cambios de contraseña
- Subida de fotos

### Limpieza Automática

Los logs de auditoría se limpian automáticamente cada día a las 2 AM, manteniendo solo los últimos 6 meses.

## 🔒 Seguridad

- **Rate Limiting** configurable por endpoint
- **Helmet** para headers de seguridad
- **CORS** configurado
- **JWT** con refresh tokens
- **Validación** de archivos de imagen
- **Logs de auditoría** completos
- **Soft delete** para usuarios

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones
│   ├── database.js   # Configuración de BD
│   ├── websocket.js  # Configuración WebSocket
│   └── rateLimit.js  # Rate limiting
├── controllers/      # Controladores
│   ├── authController.js
│   └── photoController.js
├── middleware/       # Middlewares
│   └── auth.js       # Autenticación y autorización
├── models/          # Modelos de datos
│   ├── User.js
│   ├── Photo.js
│   └── UserLocation.js
├── routes/          # Rutas de la API
│   ├── auth.js
│   ├── photos.js
│   └── users.js
├── utils/           # Utilidades
│   ├── auditLogger.js
│   └── imageProcessor.js
├── migrations/      # Migraciones de BD
├── seeds/          # Datos iniciales
└── app.js          # Archivo principal
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start src/app.js --name "app-registro-fotos"

# Monitorear
pm2 monit

# Logs
pm2 logs
```

## 📈 Monitoreo

### Health Check
```bash
curl http://localhost:3000/health
```

### Información de la API
```bash
curl http://localhost:3000/api/info
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio. 