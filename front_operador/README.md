# Frontend Operador - App Registro de Fotos

Aplicación móvil para operadores del sistema de registro de fotos con geolocalización.

## 🚀 Características

- **Interfaz móvil optimizada**: Diseñada específicamente para dispositivos móviles
- **Captura de fotos**: Integración con cámara del dispositivo
- **Geolocalización**: Captura automática de ubicación GPS
- **Modo offline**: Funcionalidad básica sin conexión
- **PWA**: Instalable como aplicación nativa
- **Navegación intuitiva**: Barra de navegación inferior
- **Tema adaptativo**: Soporte para modo oscuro/claro
- **Accesibilidad**: Cumple estándares de accesibilidad móvil

## 📱 Funcionalidades Principales

### Cámara
- Captura de fotos con alta calidad
- Configuración de cámara (frontal/trasera)
- Flash automático
- Estabilización de imagen
- Captura de metadatos EXIF

### Galería
- Visualización de fotos capturadas
- Filtros por fecha, ubicación, etiquetas
- Vista detallada de fotos
- Información de metadatos
- Compartir fotos

### Mapa
- Visualización de ubicaciones de fotos
- Navegación a ubicaciones
- Clusters de fotos cercanas
- Información de ubicación

### Perfil
- Información del usuario
- Configuración de la aplicación
- Estadísticas de uso
- Gestión de cuenta

## 🛠️ Tecnologías

- **Vue 3**: Framework principal
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **Pinia**: Gestión de estado
- **Vue Router**: Navegación
- **Axios**: Cliente HTTP
- **Socket.io**: Comunicación en tiempo real
- **Leaflet**: Mapas interactivos
- **CryptoJS**: Encriptación de datos

## 📋 Requisitos

- Node.js 18.0.0 o superior
- npm 8.0.0 o superior
- Navegador moderno con soporte para:
  - ES6+
  - Web APIs (Camera, Geolocation, etc.)
  - Service Workers (para PWA)

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd app_registro_fotos/front_operador
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con las configuraciones necesarias:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_WS_URL=http://localhost:3000
   VITE_ENCRYPTION_KEY=your-secret-key
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🚀 Scripts Disponibles

- `npm run dev`: Servidor de desarrollo
- `npm run build`: Construcción para producción
- `npm run preview`: Vista previa de la build
- `npm run lint`: Linting del código
- `npm run format`: Formateo del código

## 📁 Estructura del Proyecto

```
src/
├── api/                 # Configuración de API
├── assets/             # Recursos estáticos
│   └── styles/         # Estilos CSS
├── components/         # Componentes reutilizables
│   └── icons/          # Iconos SVG
├── router/             # Configuración de rutas
├── stores/             # Stores de Pinia
├── utils/              # Utilidades
├── views/              # Vistas de la aplicación
├── App.vue             # Componente principal
└── main.js             # Punto de entrada
```

## 🔐 Configuración de Seguridad

### Encriptación
- Los datos sensibles se encriptan antes de almacenarse
- Tokens de autenticación encriptados
- Clave de encriptación configurable

### Autenticación
- JWT tokens con refresh automático
- Interceptores de API para manejo de errores
- Logout automático en sesión expirada

### Permisos
- Verificación de permisos por ruta
- Roles de usuario (operador)
- Acceso restringido a funcionalidades

## 📱 Configuración PWA

### Manifest
- Configuración para instalación como app
- Iconos en diferentes tamaños
- Tema y colores personalizados

### Service Worker
- Caché de recursos estáticos
- Funcionalidad offline básica
- Sincronización de datos

## 🎨 Temas y Estilos

### Tailwind CSS
- Configuración personalizada
- Componentes predefinidos
- Utilidades específicas para móviles

### Variables CSS
- Colores del tema
- Espaciado consistente
- Animaciones personalizadas

### Modo Oscuro
- Detección automática de preferencias
- Tema adaptativo
- Transiciones suaves

## 📊 Estado de la Aplicación

### Stores de Pinia
- **AuthStore**: Autenticación y usuario
- **AppStore**: Estado general de la app
- **WebSocketStore**: Comunicación en tiempo real

### Persistencia
- localStorage encriptado
- Sincronización con servidor
- Backup de datos críticos

## 🔄 Comunicación en Tiempo Real

### WebSocket
- Conexión automática
- Reconexión inteligente
- Mensajes en cola offline

### Eventos
- Subida de fotos
- Actualización de ubicación
- Notificaciones push
- Sincronización de datos

## 📍 Geolocalización

### Configuración
- Alta precisión por defecto
- Timeout configurable
- Caché de ubicaciones

### Funcionalidades
- Captura automática
- Validación de precisión
- Fallback a ubicación aproximada

## 📸 Cámara

### Configuración
- Resolución optimizada
- Compresión automática
- Metadatos EXIF

### Funcionalidades
- Cambio de cámara
- Flash automático
- Estabilización
- Captura con temporizador

## 🗺️ Mapas

### Leaflet
- Mapas interactivos
- Marcadores personalizados
- Clusters automáticos

### Funcionalidades
- Navegación a ubicaciones
- Información de fotos
- Filtros por área

## 🧪 Testing

### Configuración
- Jest para unit tests
- Cypress para e2e tests
- Coverage reporting

### Ejecutar tests
```bash
npm run test
npm run test:e2e
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

### Optimizaciones
- Code splitting automático
- Minificación de assets
- Compresión gzip
- Cache busting

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Seguridad
VITE_ENCRYPTION_KEY=your-secret-key

# Configuración
VITE_APP_NAME=Registro de Fotos
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
```

### Configuración de Vite
- Alias de importación
- Optimizaciones específicas
- Configuración de proxy

## 🐛 Debugging

### Herramientas
- Vue DevTools
- Browser DevTools
- Console logging

### Logs
- Errores de API
- Estado de WebSocket
- Eventos de cámara
- Geolocalización

## 📚 Documentación Adicional

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación del proyecto 