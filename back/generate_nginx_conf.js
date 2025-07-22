// Script para generar configuración Nginx a partir de .env
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar .env
const envPath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('No se encontró el archivo .env');
  process.exit(1);
}
const env = dotenv.parse(fs.readFileSync(envPath));

// Variables necesarias
const DOMAIN = env.DOMAIN || 'midominio.com';
const FRONTEND_DOMAIN = env.FRONTEND_DOMAIN || 'admin.midominio.com';
const BACKEND_DOMAIN = env.BACKEND_DOMAIN || 'api.midominio.com';
const PUBLIC_UPLOAD_PATH = env.PUBLIC_UPLOAD_PATH || '/ruta/absoluta/a/uploads';
const BACKEND_PORT = env.PORT || 3000;
const WS_PORT = env.WS_PORT || 3001;
const FRONTEND_DIST_PATH = env.FRONTEND_DIST_PATH || '/var/www/front_admin/dist';
const OPERATOR_FRONTEND_DOMAIN = env.OPERATOR_FRONTEND_DOMAIN || 'operador.midominio.com';
const OPERATOR_FRONTEND_DIST_PATH = env.OPERATOR_FRONTEND_DIST_PATH || '/var/www/front_operador/dist';

// Plantilla de configuración Nginx
const nginxConf = `
# Configuración generada automáticamente

# Servidor para el frontend administrativo
server {
    listen 80;
    server_name ${FRONTEND_DOMAIN};

    root ${FRONTEND_DIST_PATH};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Servidor para el frontend operador
server {
    listen 80;
    server_name ${OPERATOR_FRONTEND_DOMAIN};

    root ${OPERATOR_FRONTEND_DIST_PATH};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Servidor para el backend/API
server {
    listen 80;
    server_name ${BACKEND_DOMAIN};

    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT}/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets
    location /socket.io/ {
        proxy_pass http://localhost:${WS_PORT}/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos subidos
    location /uploads/ {
        alias ${PUBLIC_UPLOAD_PATH}/;
        autoindex off;
        access_log off;
        expires 30d;
    }
}
`;

// Guardar archivo
const outputPath = path.resolve(__dirname, 'nginx.conf');
fs.writeFileSync(outputPath, nginxConf);
console.log('Archivo nginx.conf generado correctamente en', outputPath); 