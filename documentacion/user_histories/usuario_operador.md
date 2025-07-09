# Historias de Usuario - Operador

## Descripción General

Este documento contiene las historias de usuario para el rol de **Operador** en la aplicación de registro de fotos. El operador es el usuario principal que captura fotografías con información geográfica y temporal.

## Historias de Usuario

### 1. Autenticación y Bienvenida

#### HU-OP-001: Pantalla de Bienvenida
**Como** operador  
**Quiero** ver una pantalla de bienvenida cuando no tengo sesión iniciada  
**Para** entender el propósito de la aplicación antes de comenzar a usarla

**Criterios de Aceptación:**
- Se muestra pantalla de bienvenida si no hay sesión activa
- La pantalla incluye explicación breve del propósito de la app
- Se muestra botón "Iniciar Sesión"
- Si ya hay sesión activa, se redirige directamente al home

**Casos de Uso:**
- Usuario nuevo accede por primera vez
- Usuario con sesión expirada
- Usuario con sesión activa

---

### 2. Visualización de Ubicación

#### HU-OP-002: Visualización de Mapa con Ubicación Actual
**Como** operador  
**Quiero** ver mi ubicación geográfica actual en un mapa  
**Para** conocer mi posición exacta antes de tomar fotografías

**Criterios de Aceptación:**
- El mapa se centra automáticamente en la ubicación actual del usuario
- Se solicita permiso de ubicación si no está concedido
- Se muestra indicador de ubicación en tiempo real
- El mapa es interactivo y permite zoom/pan

**Consideraciones Técnicas:**
- Integración con GPS del dispositivo
- Manejo de permisos de ubicación
- Fallback para dispositivos sin GPS

---

### 3. Captura de Fotografías

#### HU-OP-003: Captura de Foto con Ubicación y Comentario
**Como** operador  
**Quiero** registrar una nueva foto con mi ubicación geográfica actual y un comentario  
**Para** documentar visualmente mi ubicación con contexto adicional

**Criterios de Aceptación:**
- Solo se permite captura desde la cámara del dispositivo (no galería)
- Se captura automáticamente la ubicación GPS actual
- Se captura la orientación (brújula) si está disponible
- Se registra fecha y hora automáticamente
- Se permite agregar comentario opcional
- La foto se guarda localmente y se sincroniza con el backend

**Flujo de Trabajo:**
1. Usuario presiona "Tomar Foto"
2. Se solicita permiso de cámara si no está concedido
3. Se abre la cámara del dispositivo
4. Usuario toma la foto
5. Se captura ubicación y orientación
6. Se muestra formulario para agregar comentario
7. Se guarda la foto con metadatos

---

### 4. Visualización de Fotografías

#### HU-OP-004: Vista de Cuadrícula de Fotos
**Como** operador  
**Quiero** visualizar mis fotos anteriores en formato de cuadrícula  
**Para** revisar y gestionar las fotografías que he tomado

**Criterios de Aceptación:**
- Las fotos se muestran en formato de cuadrícula
- Ordenadas por fecha/hora (más reciente primero)
- Se muestran solo las fotos actuales inicialmente
- Al hacer scroll se cargan fotos de días anteriores
- Cada día está separado por encabezado con fecha
- Se muestra mensaje cuando no hay fotos
- Cada foto muestra: ubicación, orientación, fecha/hora, comentario

**Consideraciones de UX:**
- Lazy loading para optimizar rendimiento
- Indicador de carga durante scroll
- Mensaje claro cuando no hay fotos: "No se han tomado fotos aún"

---

#### HU-OP-005: Detalles de Foto con Metadatos
**Como** operador  
**Quiero** ver los detalles completos de cada foto  
**Para** revisar toda la información asociada a la imagen

**Criterios de Aceptación:**
- Se muestra la foto en tamaño completo
- Se visualiza ubicación geográfica en mapa
- Se muestra orientación (dirección de la brújula)
- Se muestra fecha y hora exacta
- Se muestran todos los comentarios asociados
- Se permite agregar nuevos comentarios

---

### 5. Gestión de Comentarios

#### HU-OP-006: Agregar Comentarios a Fotos Existentes
**Como** operador  
**Quiero** adjuntar nuevos comentarios a fotos ya tomadas  
**Para** agregar información adicional o correcciones

**Criterios de Aceptación:**
- Se pueden agregar comentarios a fotos existentes
- Los nuevos comentarios se agregan a los anteriores (no reemplazan)
- Se muestra historial de comentarios con timestamps
- Se sincroniza automáticamente con el backend

**Flujo de Trabajo:**
1. Usuario selecciona foto existente
2. Se muestra formulario para nuevo comentario
3. Se guarda comentario con timestamp
4. Se actualiza la vista con el nuevo comentario

---

### 6. Seguimiento de Ubicación en Tiempo Real

#### HU-OP-007: Actualización Periódica de Ubicación
**Como** operador  
**Quiero** que la app envíe mi ubicación actual periódicamente al backend  
**Para** mantener un registro continuo de mi posición

**Criterios de Aceptación:**
- Se envía ubicación cada pocos segundos (configurable)
- Funciona en segundo plano
- Se muestra alerta si no se puede obtener ubicación
- Se maneja graciosamente la pérdida de señal GPS
- Se optimiza el consumo de batería

**Consideraciones Técnicas:**
- Frecuencia configurable (ej: 5-10 segundos)
- Manejo de errores de GPS
- Optimización de batería
- Sincronización con backend

---

### 7. Gestión de Perfil

#### HU-OP-008: Edición de Perfil de Usuario
**Como** operador  
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
1. Usuario accede a "Preferencias"
2. Se muestra formulario de edición de perfil
3. Usuario modifica campos deseados
4. Se valida información
5. Se confirma con contraseña actual
6. Se actualiza perfil

---

### 8. Navegación y Menú

#### HU-OP-009: Menú Contextual de Navegación
**Como** operador  
**Quiero** acceder a un menú contextual con las opciones principales  
**Para** navegar fácilmente entre las diferentes funcionalidades

**Criterios de Aceptación:**
- Menú accesible desde cualquier pantalla
- Opciones del menú:
  - Fotografías tomadas
  - Preferencias (edición de perfil)
  - Salir
- Navegación intuitiva y rápida

---

### 9. Interfaz Principal (Home)

#### HU-OP-010: Pantalla Principal con Mapa y Botón de Captura
**Como** operador  
**Quiero** ver el mapa centrado en mi ubicación con un botón para tomar fotos  
**Para** tener acceso rápido a la funcionalidad principal

**Criterios de Aceptación:**
- Mapa centrado en ubicación actual
- Botón "Tomar Foto" centrado horizontalmente en margen inferior
- Se solicita permiso de ubicación si no está concedido
- Interfaz limpia y sin distracciones
- Acceso rápido al menú contextual

**Elementos de la Interfaz:**
- Mapa ocupando la mayor parte de la pantalla
- Botón flotante "Tomar Foto" en la parte inferior
- Indicador de ubicación en tiempo real
- Menú hamburguesa o botón de menú

---

## Flujos de Trabajo Principales

### Flujo 1: Captura de Nueva Foto
1. Usuario abre la app (redirección automática si tiene sesión)
2. Se muestra mapa con ubicación actual
3. Usuario presiona "Tomar Foto"
4. Se abre cámara del dispositivo
5. Usuario toma la foto
6. Se capturan metadatos (ubicación, orientación, fecha/hora)
7. Usuario agrega comentario opcional
8. Se guarda y sincroniza con backend

### Flujo 2: Revisión de Fotos
1. Usuario accede a "Fotografías tomadas" desde menú
2. Se muestra cuadrícula de fotos ordenadas por fecha
3. Usuario puede hacer scroll para ver fotos anteriores
4. Usuario selecciona foto para ver detalles
5. Puede agregar comentarios adicionales

### Flujo 3: Edición de Perfil
1. Usuario accede a "Preferencias" desde menú
2. Se muestra formulario de edición
3. Usuario modifica campos deseados
4. Se valida y confirma cambios
5. Se actualiza perfil

## Consideraciones Técnicas

### Permisos Requeridos
- Ubicación (GPS)
- Cámara
- Almacenamiento
- Internet

### Optimizaciones
- Lazy loading de imágenes
- Compresión de fotos
- Sincronización inteligente
- Gestión eficiente de batería

### Manejo de Errores
- Pérdida de conexión GPS
- Fallos de cámara
- Problemas de red
- Permisos denegados

## Métricas de Éxito

- Tiempo de captura de foto < 30 segundos
- Tiempo de carga de galería < 3 segundos
- Precisión de ubicación < 10 metros
- Tasa de éxito en captura de fotos > 95%
