# Modelos de Datos - App Registro Fotos

## Descripción General

Este documento define la estructura de tablas y campos para la base de datos de la aplicación de registro de fotos, basándose en las historias de usuario de operadores y administradores.

## Tablas Principales

### 1. users
**Descripción**: Tabla principal de usuarios del sistema (operadores y administradores)

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único del usuario |
| username | VARCHAR(50) | NO | Nombre de usuario único |
| password_hash | VARCHAR(255) | NO | Hash de la contraseña |
| email | VARCHAR(100) | YES | Email del usuario |
| full_name | VARCHAR(100) | YES | Nombre completo |
| profile_photo | VARCHAR(255) | YES | URL de la foto de perfil |
| role | VARCHAR(20) | NO | Rol: 'operator' o 'admin' |
| status | VARCHAR(20) | NO | Estado: 'active', 'inactive', 'deleted' |
| created_at | TIMESTAMP | NO | Fecha de creación |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |
| last_login | TIMESTAMP | YES | Último inicio de sesión |

### 2. photos
**Descripción**: Tabla principal de fotografías capturadas por los operadores

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único de la foto |
| user_id | INTEGER | NO | ID del operador que tomó la foto |
| file_path | VARCHAR(255) | NO | Ruta del archivo de imagen |
| file_name | VARCHAR(255) | NO | Nombre original del archivo |
| file_size | INTEGER | NO | Tamaño del archivo en bytes |
| mime_type | VARCHAR(50) | NO | Tipo MIME de la imagen |
| latitude | DECIMAL(10,8) | NO | Latitud GPS |
| longitude | DECIMAL(11,8) | NO | Longitud GPS |
| orientation | DECIMAL(5,2) | YES | Orientación (brújula) en grados |
| altitude | DECIMAL(8,2) | YES | Altitud en metros |
| accuracy | DECIMAL(8,2) | YES | Precisión GPS en metros |
| captured_at | TIMESTAMP | NO | Fecha y hora de captura |
| created_at | TIMESTAMP | NO | Fecha de registro en BD |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |

### 3. photo_comments
**Descripción**: Comentarios asociados a las fotografías

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único del comentario |
| photo_id | INTEGER | NO | ID de la foto |
| user_id | INTEGER | NO | ID del usuario que hizo el comentario |
| comment | TEXT | NO | Texto del comentario |
| created_at | TIMESTAMP | NO | Fecha y hora del comentario |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |

### 4. user_locations
**Descripción**: Historial de ubicaciones de los operadores para seguimiento en tiempo real

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único de la ubicación |
| user_id | INTEGER | NO | ID del operador |
| latitude | DECIMAL(10,8) | NO | Latitud GPS |
| longitude | DECIMAL(11,8) | NO | Longitud GPS |
| altitude | DECIMAL(8,2) | YES | Altitud en metros |
| accuracy | DECIMAL(8,2) | YES | Precisión GPS en metros |
| speed | DECIMAL(6,2) | YES | Velocidad en m/s |
| heading | DECIMAL(5,2) | YES | Dirección en grados |
| recorded_at | TIMESTAMP | NO | Fecha y hora de la ubicación |
| created_at | TIMESTAMP | NO | Fecha de registro en BD |

### 5. user_sessions
**Descripción**: Sesiones activas de los usuarios

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único de la sesión |
| user_id | INTEGER | NO | ID del usuario |
| session_token | VARCHAR(255) | NO | Token de sesión JWT |
| refresh_token | VARCHAR(255) | YES | Token de refresco |
| device_info | TEXT | YES | Información del dispositivo |
| ip_address | VARCHAR(45) | YES | Dirección IP |
| user_agent | TEXT | YES | User agent del navegador |
| is_active | BOOLEAN | NO | Si la sesión está activa |
| expires_at | TIMESTAMP | NO | Fecha de expiración |
| created_at | TIMESTAMP | NO | Fecha de creación |
| last_activity | TIMESTAMP | NO | Última actividad |

### 6. system_settings
**Descripción**: Configuraciones del sistema

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único de la configuración |
| setting_key | VARCHAR(100) | NO | Clave de la configuración |
| setting_value | TEXT | YES | Valor de la configuración |
| setting_type | VARCHAR(20) | NO | Tipo: 'string', 'integer', 'boolean', 'json' |
| description | TEXT | YES | Descripción de la configuración |
| is_public | BOOLEAN | NO | Si es visible para operadores |
| created_at | TIMESTAMP | NO | Fecha de creación |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |

### 7. audit_logs
**Descripción**: Logs de auditoría para acciones administrativas

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único del log |
| user_id | INTEGER | YES | ID del usuario que realizó la acción |
| action | VARCHAR(100) | NO | Tipo de acción realizada |
| table_name | VARCHAR(50) | YES | Tabla afectada |
| record_id | INTEGER | YES | ID del registro afectado |
| old_values | JSON | YES | Valores anteriores |
| new_values | JSON | YES | Valores nuevos |
| ip_address | VARCHAR(45) | YES | Dirección IP |
| user_agent | TEXT | YES | User agent |
| created_at | TIMESTAMP | NO | Fecha y hora del log |

## Tablas de Configuración

### 8. location_update_config
**Descripción**: Configuración de actualización de ubicación por usuario

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único |
| user_id | INTEGER | NO | ID del usuario |
| update_frequency | INTEGER | NO | Frecuencia en segundos |
| is_enabled | BOOLEAN | NO | Si está habilitado |
| last_update | TIMESTAMP | YES | Última actualización |
| created_at | TIMESTAMP | NO | Fecha de creación |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |

### 9. photo_metadata
**Descripción**: Metadatos adicionales de las fotografías

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único |
| photo_id | INTEGER | NO | ID de la foto |
| metadata_key | VARCHAR(100) | NO | Clave del metadato |
| metadata_value | TEXT | YES | Valor del metadato |
| created_at | TIMESTAMP | NO | Fecha de creación |

## Tablas de Relaciones

### 10. user_permissions
**Descripción**: Permisos específicos por usuario (para futuras expansiones)

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | Identificador único |
| user_id | INTEGER | NO | ID del usuario |
| permission_key | VARCHAR(100) | NO | Clave del permiso |
| is_granted | BOOLEAN | NO | Si el permiso está concedido |
| created_at | TIMESTAMP | NO | Fecha de creación |
| updated_at | TIMESTAMP | NO | Fecha de última actualización |

## Consideraciones de Diseño

### Tipos de Datos Específicos
- **DECIMAL(10,8)** para latitud: Precisión de 8 decimales para coordenadas GPS
- **DECIMAL(11,8)** para longitud: Precisión de 8 decimales para coordenadas GPS
- **DECIMAL(5,2)** para orientación: Grados de brújula con 2 decimales
- **VARCHAR(45)** para IP: Soporte para IPv6
- **JSON** para valores complejos: Metadatos y logs de auditoría

### Campos de Auditoría
- **created_at**: Fecha de creación automática
- **updated_at**: Fecha de última actualización automática
- **created_by**: Usuario que creó el registro (cuando aplica)
- **updated_by**: Usuario que actualizó el registro (cuando aplica)

### Campos de Estado
- **status**: Estados activo/inactivo/eliminado
- **is_active**: Boolean para activación/desactivación
- **is_enabled**: Boolean para habilitación/deshabilitación

### Campos de Seguridad
- **password_hash**: Hash de contraseñas (no texto plano)
- **session_token**: Tokens JWT para sesiones
- **refresh_token**: Tokens de refresco para renovación

### Campos de Geolocalización
- **latitude/longitude**: Coordenadas GPS precisas
- **altitude**: Altitud en metros
- **accuracy**: Precisión del GPS en metros
- **speed**: Velocidad de movimiento
- **heading**: Dirección de movimiento

### Campos de Archivos
- **file_path**: Ruta del archivo en el sistema
- **file_name**: Nombre original del archivo
- **file_size**: Tamaño en bytes
- **mime_type**: Tipo MIME del archivo
