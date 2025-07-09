# Historias de Usuario - Administrador

## Descripción General

Este documento contiene las historias de usuario para el rol de **Administrador** en la aplicación de registro de fotos. El administrador es responsable de gestionar usuarios, monitorear operadores en tiempo real y revisar todas las fotografías capturadas.

## Historias de Usuario

### 1. Autenticación y Bienvenida

#### HU-AD-001: Pantalla de Bienvenida para Administrador
**Como** administrador  
**Quiero** ver una pantalla de bienvenida cuando no tengo sesión iniciada  
**Para** entender el propósito de la aplicación antes de acceder al panel de administración

**Criterios de Aceptación:**
- Se muestra pantalla de bienvenida si no hay sesión activa
- La pantalla incluye descripción específica del panel de administración
- Se muestra botón "Iniciar Sesión"
- Si ya hay sesión activa, se redirige directamente al home

**Casos de Uso:**
- Administrador nuevo accede por primera vez
- Administrador con sesión expirada
- Administrador con sesión activa

---

### 2. Gestión de Usuarios

#### HU-AD-002: Crear Nuevo Usuario
**Como** administrador  
**Quiero** crear nuevos usuarios en el sistema  
**Para** dar acceso a nuevos operadores o administradores

**Criterios de Aceptación:**
- Formulario completo para crear usuario
- Campos: nombre de usuario, contraseña, rol (operador/administrador)
- Validación de campos obligatorios
- Verificación de nombre de usuario único
- Confirmación de creación exitosa

**Flujo de Trabajo:**
1. Administrador accede a "Gestionar Usuarios"
2. Presiona botón "Crear Usuario"
3. Completa formulario con datos del usuario
4. Selecciona rol del usuario
5. Confirma creación
6. Se crea usuario en el sistema

---

#### HU-AD-003: Editar Usuario Existente
**Como** administrador  
**Quiero** editar información de usuarios existentes  
**Para** actualizar datos de usuarios o cambiar roles

**Criterios de Aceptación:**
- Lista de usuarios con opción de editar
- Formulario pre-poblado con datos actuales
- Posibilidad de cambiar nombre de usuario y rol
- Validación de cambios
- Confirmación de actualización

**Campos Editables:**
- Nombre de usuario
- Rol (operador/administrador)
- Estado (activo/inactivo)

---

#### HU-AD-004: Eliminar Usuario
**Como** administrador  
**Quiero** eliminar usuarios del sistema  
**Para** remover acceso de usuarios que ya no necesitan el sistema

**Criterios de Aceptación:**
- Opción de eliminar en lista de usuarios
- Confirmación antes de eliminar
- Advertencia si el usuario tiene fotos asociadas
- Eliminación lógica (no física) para preservar datos
- Confirmación de eliminación exitosa

**Consideraciones:**
- No se puede eliminar el propio usuario administrador
- Se preservan las fotos del usuario eliminado
- Se marca usuario como "eliminado" en lugar de borrar físicamente

---

#### HU-AD-005: Resetear Contraseña de Usuario
**Como** administrador  
**Quiero** resetear la contraseña de un usuario especificando una nueva  
**Para** ayudar a usuarios que olvidaron su contraseña

**Criterios de Aceptación:**
- Opción de resetear contraseña en lista de usuarios
- Formulario para especificar nueva contraseña
- Validación de contraseña (longitud, complejidad)
- Confirmación de contraseña
- Notificación al usuario sobre el cambio
- Confirmación de reset exitoso

**Flujo de Trabajo:**
1. Administrador selecciona usuario
2. Presiona "Resetear Contraseña"
3. Ingresa nueva contraseña
4. Confirma nueva contraseña
5. Se actualiza contraseña en el sistema
6. Se notifica al usuario

---

### 3. Gestión de Perfil Personal

#### HU-AD-006: Editar Perfil de Administrador
**Como** administrador  
**Quiero** editar mi foto de perfil, nombre de usuario y contraseña  
**Para** mantener mi información personal actualizada

**Criterios de Aceptación:**
- Se puede cambiar foto de perfil
- Se puede editar nombre de usuario
- Se puede cambiar contraseña
- Se valida la nueva contraseña
- Se confirma el cambio con contraseña actual
- Se sincroniza con el backend

**Flujo de Trabajo:**
1. Administrador accede a "Editar Perfil"
2. Se muestra formulario de edición
3. Modifica campos deseados
4. Se valida información
5. Se confirma con contraseña actual
6. Se actualiza perfil

---

### 4. Monitoreo en Tiempo Real

#### HU-AD-007: Visualización de Mapa con Operadores
**Como** administrador  
**Quiero** ver el mapa con la ubicación en tiempo real de todos los operadores  
**Para** monitorear dónde están trabajando los operadores

**Criterios de Aceptación:**
- Mapa en pantalla completa
- Punto por cada operador activo
- Nombre de usuario visible en cada punto
- Actualización en tiempo real de ubicaciones
- Indicador de estado (online/offline)

**Elementos del Mapa:**
- Puntos de colores por operador
- Tooltip con nombre de usuario
- Indicador de última actualización
- Zoom y pan del mapa

---

#### HU-AD-008: Modal de Detalles de Operador
**Como** administrador  
**Quiero** ver detalles de un operador al hacer click en su punto del mapa  
**Para** revisar información específica y fotos de ese operador

**Criterios de Aceptación:**
- Modal que ocupa casi toda la pantalla
- Datos básicos del operador (nombre, estado, última actividad)
- Listado de fotos tomadas con miniaturas
- Información por foto: latitud, longitud, orientación, fecha/hora, último comentario
- Ordenado por fecha/hora (más reciente primero)
- Botón "Ver Detalles" por cada foto

**Información Mostrada:**
- Nombre de usuario
- Estado actual (online/offline)
- Última ubicación conocida
- Total de fotos tomadas
- Última actividad

---

#### HU-AD-009: Modal de Detalles de Foto
**Como** administrador  
**Quiero** ver una foto en tamaño completo con todos sus detalles  
**Para** revisar completamente una fotografía específica

**Criterios de Aceptación:**
- Modal superpuesto al modal de operador
- Foto en tamaño completo (máximo ancho: mitad de pantalla)
- Botón "Vista Completa" que abre nueva pestaña
- Datos completos: fecha/hora, ubicación, operador
- Listado de todos los comentarios
- Capacidad de agregar nuevo comentario

**Funcionalidades:**
- Zoom de imagen
- Botón para abrir en nueva pestaña
- Formulario para agregar comentario
- Historial completo de comentarios con timestamps

---

### 5. Filtros y Controles de Mapa

#### HU-AD-010: Barra de Herramientas con Filtros
**Como** administrador  
**Quiero** tener una barra de herramientas flotante con filtros  
**Para** controlar qué información se muestra en el mapa

**Criterios de Aceptación:**
- Barra flotante centrada horizontalmente
- Posicionada debajo del topbar
- Filtros tipo switch independientes
- Filtro desplegable de operadores
- Botón para resetear filtros

**Filtros Disponibles:**
- **Operadores**: Muestra puntos de operadores (por defecto)
- **Fotografías**: Muestra puntos de cada foto tomada
- **Recorridos**: Muestra recorrido de operadores con timestamps

---

#### HU-AD-011: Filtro de Operadores
**Como** administrador  
**Quiero** filtrar qué operadores se muestran en el mapa  
**Para** enfocarme en operadores específicos

**Criterios de Aceptación:**
- Lista desplegable de operadores
- Checkbox por cada operador
- Todos habilitados por defecto
- Al deshabilitar se ocultan datos del operador
- Al habilitar se muestran datos del operador
- Actualización inmediata del mapa

**Funcionalidades:**
- Selección múltiple
- "Seleccionar Todos" / "Deseleccionar Todos"
- Búsqueda en la lista
- Indicador de operadores activos

---

#### HU-AD-012: Filtro de Fotografías
**Como** administrador  
**Quiero** ver puntos en el mapa por cada fotografía tomada  
**Para** visualizar todas las ubicaciones donde se han tomado fotos

**Criterios de Aceptación:**
- Un punto por cada foto en el mapa
- Tooltip con información básica de la foto
- Click en punto abre modal de detalles de foto
- Se puede combinar con otros filtros
- Indicador de cantidad de fotos mostradas

**Información en Tooltip:**
- Operador que tomó la foto
- Fecha y hora
- Comentario principal

---

#### HU-AD-012.1: Modal de Detalles de Foto desde Mapa
**Como** administrador  
**Quiero** ver detalles de una foto al hacer click en su punto del mapa  
**Para** revisar la fotografía directamente desde la vista de mapa

**Criterios de Aceptación:**
- Al hacer click en punto de foto se abre modal de detalles
- Es el mismo modal que se usa en el listado de fotos del operador
- Modal superpuesto sobre el mapa
- Foto en tamaño completo (máximo ancho: mitad de pantalla)
- Botón "Vista Completa" que abre nueva pestaña
- Datos completos: fecha/hora, ubicación, operador
- Listado de todos los comentarios
- Capacidad de agregar nuevo comentario

**Funcionalidades:**
- Zoom de imagen
- Botón para abrir en nueva pestaña
- Formulario para agregar comentario
- Historial completo de comentarios con timestamps
- Cierre del modal manteniendo la vista del mapa

---

#### HU-AD-013: Filtro de Recorridos
**Como** administrador  
**Quiero** ver el recorrido de cada operador en el mapa  
**Para** analizar las rutas y patrones de movimiento

**Criterios de Aceptación:**
- Línea de recorrido por operador
- Puntos con timestamps en la ruta
- Diferentes colores por operador
- Información de tiempo en cada punto
- Se puede combinar con otros filtros

**Elementos del Recorrido:**
- Línea continua mostrando ruta
- Puntos marcando ubicaciones específicas
- Timestamps en cada punto
- Indicador de dirección de movimiento

---

### 6. Navegación y Menú

#### HU-AD-014: Topbar con Menú Contextual
**Como** administrador  
**Quiero** acceder a un menú contextual desde el topbar  
**Para** navegar entre las diferentes funcionalidades administrativas

**Criterios de Aceptación:**
- Topbar visible en todas las pantallas
- Menú hamburguesa o botón de menú
- Opciones del menú:
  - Mapa (home)
  - Gestionar Usuarios
  - Editar Perfil
  - Cerrar Sesión
- Navegación intuitiva y rápida

**Elementos del Topbar:**
- Logo o título de la aplicación
- Botón de menú
- Indicador de usuario actual
- Notificaciones (opcional)

---

### 7. Interfaz Principal (Home)

#### HU-AD-015: Pantalla Principal con Mapa Completo
**Como** administrador  
**Quiero** ver el mapa en pantalla completa con todos los controles  
**Para** tener una vista completa del sistema de monitoreo

**Criterios de Aceptación:**
- Mapa ocupando toda la pantalla disponible
- Topbar con menú contextual
- Barra de herramientas flotante con filtros
- Puntos de operadores visibles por defecto
- Interfaz limpia y profesional

**Elementos de la Interfaz:**
- Mapa como elemento principal
- Topbar en la parte superior
- Barra de herramientas flotante
- Controles de zoom y pan del mapa
- Indicadores de estado del sistema

---

## Flujos de Trabajo Principales

### Flujo 1: Gestión de Usuario
1. Administrador accede a "Gestionar Usuarios"
2. Selecciona acción (crear/editar/eliminar/resetear contraseña)
3. Completa formulario correspondiente
4. Confirma acción
5. Se actualiza sistema y se notifica resultado

### Flujo 2: Monitoreo de Operador
1. Administrador ve mapa con puntos de operadores
2. Hace click en punto de operador específico
3. Se abre modal con detalles del operador
4. Ve lista de fotos del operador
5. Hace click en "Ver Detalles" de una foto
6. Se abre modal con foto completa y comentarios
7. Puede agregar comentario adicional

### Flujo 2.1: Visualización de Foto desde Mapa
1. Administrador activa filtro de "Fotografías"
2. Ve puntos de fotos en el mapa
3. Hace click en punto de foto específica
4. Se abre modal con detalles completos de la foto
5. Puede ver imagen, metadatos y comentarios
6. Puede agregar nuevo comentario
7. Puede abrir imagen en nueva pestaña

### Flujo 3: Aplicación de Filtros
1. Administrador usa barra de herramientas
2. Activa/desactiva filtros (operadores, fotos, recorridos)
3. Selecciona operadores específicos del filtro desplegable
4. Ve cambios inmediatos en el mapa
5. Puede resetear filtros si es necesario

### Flujo 4: Edición de Perfil
1. Administrador accede a "Editar Perfil" desde menú
2. Modifica foto, nombre de usuario o contraseña
3. Confirma cambios con contraseña actual
4. Se actualiza perfil en el sistema

## Consideraciones Técnicas

### Permisos y Seguridad
- Autenticación requerida para todas las funciones
- Autorización basada en rol de administrador
- Validación de permisos en cada operación
- Logs de auditoría para acciones administrativas

### Rendimiento
- Lazy loading de datos de operadores
- Actualización eficiente de ubicaciones en tiempo real
- Optimización de carga de imágenes
- Caché de datos frecuentemente accedidos

### Escalabilidad
- Soporte para múltiples administradores
- Gestión eficiente de grandes volúmenes de datos
- Optimización de consultas de base de datos
- Arquitectura preparada para crecimiento

### Manejo de Errores
- Pérdida de conexión con operadores
- Errores de carga de imágenes
- Problemas de permisos
- Fallos en actualización de ubicaciones

## Métricas de Éxito

- Tiempo de carga del mapa < 3 segundos
- Actualización de ubicaciones < 5 segundos
- Tiempo de respuesta de filtros < 1 segundo
- Tiempo de carga de modal de detalles < 2 segundos
- Disponibilidad del sistema > 99.5%
- Tasa de éxito en operaciones administrativas > 98%

## Roles y Permisos

### Administrador
- Gestión completa de usuarios
- Monitoreo en tiempo real
- Acceso a todas las fotos
- Configuración del sistema
- Logs y auditoría

### Operador
- Captura de fotos
- Gestión de perfil personal
- Visualización de propias fotos
- Sin acceso a datos de otros usuarios
