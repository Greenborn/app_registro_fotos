# Arquitectura - App Registro Fotos Backend

## Descripción General

El backend de la aplicación está construido con **Node.js** utilizando **Express.js** como framework web, **Knex.js** como query builder para la base de datos, con capacidades de **rate limiting** para controlar las peticiones y soporte para **WebSockets** para comunicación en tiempo real.

## Stack Tecnológico

### Runtime y Framework
- **Node.js**: Entorno de ejecución JavaScript del lado del servidor
- **Express.js**: Framework web minimalista y flexible para Node.js

### Base de Datos
- **Knex.js**: Query builder SQL que soporta múltiples bases de datos
- **Base de datos**: Configurable (PostgreSQL, MySQL, SQLite)

### Middleware y Utilidades
- **Rate Limiting**: Control de frecuencia de peticiones por endpoint
- **WebSockets**: Comunicación bidireccional en tiempo real
- **CORS**: Configuración para peticiones cross-origin
- **Helmet**: Headers de seguridad
- **Morgan**: Logging de peticiones HTTP

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── websocket.js
│   │   └── rateLimit.js
│   ├── controllers/
│   │   ├── photoController.js
│   │   ├── userController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Photo.js
│   │   └── User.js
│   ├── routes/
│   │   ├── photos.js
│   │   ├── users.js
│   │   └── auth.js
│   ├── services/
│   │   ├── photoService.js
│   │   ├── uploadService.js
│   │   └── websocketService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── migrations/
│   │   ├── 001_create_users.js
│   │   └── 002_create_photos.js
│   ├── seeds/
│   │   └── initial_data.js
│   └── app.js
├── package.json
├── knexfile.js
├── .env
├── .env.example
└── README.md
```

## Arquitectura de Capas

### 1. Capa de Rutas (Routes)
- Definición de endpoints de la API
- Agrupación lógica por recursos
- Aplicación de middleware específico

### 2. Capa de Controladores (Controllers)
- Manejo de peticiones HTTP
- Validación de entrada
- Llamadas a servicios
- Respuestas estructuradas

### 3. Capa de Servicios (Services)
- Lógica de negocio
- Operaciones complejas
- Integración con servicios externos
- Manejo de WebSockets

### 4. Capa de Modelos (Models)
- Interacción con la base de datos
- Definición de esquemas
- Consultas complejas con Knex

### 5. Capa de Middleware
- Autenticación y autorización
- Rate limiting
- Validación de datos
- Manejo de errores

## Configuración de Base de Datos

### Knex.js Setup
- Configuración multi-entorno (desarrollo, producción, testing)
- Migraciones para control de versiones de esquema
- Seeds para datos iniciales
- Pool de conexiones optimizado

### Migraciones
- Control de versiones del esquema de base de datos
- Rollback de cambios
- Dependencias entre migraciones

## Rate Limiting

### Implementación
- Middleware configurable por endpoint
- Límites diferenciados por tipo de usuario
- Almacenamiento en memoria o Redis
- Headers de información de límites

### Configuración
- Límites por IP
- Límites por usuario autenticado
- Ventanas de tiempo configurables
- Respuestas personalizadas al exceder límites

## WebSockets

### Configuración
- Integración con Express
- Manejo de conexiones y desconexiones
- Autenticación de conexiones WebSocket
- Broadcasting de eventos

### Eventos
- Notificaciones en tiempo real
- Actualizaciones de estado
- Comunicación bidireccional
- Manejo de salas y canales

## Autenticación y Autorización

### JWT Tokens
- Generación y validación de tokens
- Refresh tokens
- Blacklisting de tokens
- Middleware de autenticación

### Roles y Permisos (RBAC)
- Sistema RBAC (Role-Based Access Control)
- Roles predefinidos con permisos específicos
- Permisos granulares por acción y recurso
- Middleware de autorización basado en roles
- Control de acceso por recurso y operación

## Manejo de Archivos

### Upload de Imágenes
- Procesamiento de archivos multipart
- Validación de tipos y tamaños
- Optimización de imágenes
- Almacenamiento en sistema de archivos o cloud

### Servir Archivos
- Endpoints para servir imágenes
- Caché de archivos estáticos
- Compresión de imágenes
- URLs seguras

## Logging y Monitoreo

### Logging
- Logs estructurados
- Diferentes niveles de log
- Rotación de archivos
- Integración con servicios externos

### Monitoreo
- Métricas de rendimiento
- Health checks
- Alertas automáticas
- Dashboard de monitoreo

## Testing

### Estrategia
- Tests unitarios para servicios
- Tests de integración para API
- Tests de base de datos
- Tests de WebSockets

### Herramientas
- Jest para testing framework
- Supertest para testing de API
- Faker para datos de prueba
- Coverage reporting

## Seguridad

### Headers de Seguridad
- Helmet para headers HTTP seguros
- CORS configurado apropiadamente
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)

### Validación
- Sanitización de entrada
- Validación de esquemas
- Prevención de inyección SQL
- Rate limiting como protección DDoS

## Deployment

### Configuración
- Variables de entorno
- Configuración multi-entorno
- Proceso de build
- Scripts de deployment

### Producción
- PM2 para gestión de procesos
- Nginx como reverse proxy
- SSL/TLS configuration
- Backup de base de datos

## Performance

### Optimizaciones
- Compresión de respuestas
- Caché de consultas
- Pool de conexiones
- Lazy loading de módulos

### Escalabilidad
- Arquitectura stateless
- Load balancing ready
- Microservicios preparado
- Cache distribuido

## Modelo de Datos

### Descripción General
La aplicación demo de registro de fotos está diseñada para mostrar las capacidades técnicas de la empresa. El modelo de datos es simple pero funcional, permitiendo demostrar las características principales del sistema.

### Entidades Principales

#### Usuarios (Users)
- Información básica de usuarios para la demo
- Autenticación y autorización
- Roles de usuario (admin, usuario regular)

#### Fotos (Photos)
- Registro de imágenes subidas
- Metadatos de las fotos
- Relación con usuarios
- Información de almacenamiento

#### Categorías (Categories)
- Clasificación de fotos
- Organización temática
- Filtros para la galería

### Relaciones
- Usuario puede tener múltiples fotos
- Fotos pueden pertenecer a categorías
- Sistema de permisos por usuario

### Consideraciones Demo
- Datos de ejemplo pre-cargados
- Funcionalidades limitadas pero completas
- Interfaz intuitiva para demostración
- Performance optimizada para presentación

## Conclusión

Esta arquitectura proporciona una base sólida para un backend Node.js escalable y mantenible, con capacidades avanzadas de rate limiting y WebSockets para una experiencia de usuario en tiempo real. El modelo de datos está diseñado específicamente para demostrar las capacidades técnicas de la empresa de manera efectiva. 