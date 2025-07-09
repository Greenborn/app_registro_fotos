const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Limpiar tablas existentes
  await knex('user_permissions').del();
  await knex('photo_metadata').del();
  await knex('location_update_config').del();
  await knex('audit_logs').del();
  await knex('system_settings').del();
  await knex('user_sessions').del();
  await knex('user_locations').del();
  await knex('photo_comments').del();
  await knex('photos').del();
  await knex('users').del();

  // Crear usuarios iniciales
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const users = [
    {
      username: 'admin',
      password_hash: hashedPassword,
      email: 'admin@app-registro-fotos.com',
      full_name: 'Administrador del Sistema',
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'operador1',
      password_hash: await bcrypt.hash('operador123', 12),
      email: 'operador1@app-registro-fotos.com',
      full_name: 'Operador de Prueba 1',
      role: 'operator',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'operador2',
      password_hash: await bcrypt.hash('operador123', 12),
      email: 'operador2@app-registro-fotos.com',
      full_name: 'Operador de Prueba 2',
      role: 'operator',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('users').insert(users);

  // Crear configuraciones del sistema
  const systemSettings = [
    {
      setting_key: 'location_update_frequency',
      setting_value: '5000',
      setting_type: 'integer',
      description: 'Frecuencia de actualización de ubicación en milisegundos',
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      setting_key: 'max_file_size',
      setting_value: '10485760',
      setting_type: 'integer',
      description: 'Tamaño máximo de archivo en bytes (10MB)',
      is_public: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      setting_key: 'allowed_mime_types',
      setting_value: 'image/jpeg,image/png,image/webp',
      setting_type: 'string',
      description: 'Tipos MIME permitidos para fotos',
      is_public: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      setting_key: 'rate_limit_window',
      setting_value: '900000',
      setting_type: 'integer',
      description: 'Ventana de tiempo para rate limiting en milisegundos (15 minutos)',
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      setting_key: 'rate_limit_max',
      setting_value: '100',
      setting_type: 'integer',
      description: 'Máximo de peticiones por ventana de tiempo',
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      setting_key: 'jwt_expires_in',
      setting_value: '24h',
      setting_type: 'string',
      description: 'Tiempo de expiración del token JWT',
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('system_settings').insert(systemSettings);

  // Crear configuraciones de ubicación para usuarios
  const userIds = await knex('users').where('role', 'operator').pluck('id');
  
  const locationConfigs = userIds.map(userId => ({
    user_id: userId,
    update_frequency: 5000,
    is_enabled: true,
    created_at: new Date(),
    updated_at: new Date()
  }));

  await knex('location_update_config').insert(locationConfigs);

  // Crear permisos básicos para administradores
  const adminIds = await knex('users').where('role', 'admin').pluck('id');
  
  const adminPermissions = [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'photo.read',
    'photo.update',
    'location.read',
    'system.settings',
    'audit.logs'
  ];

  const permissions = [];
  adminIds.forEach(adminId => {
    adminPermissions.forEach(permission => {
      permissions.push({
        user_id: adminId,
        permission_key: permission,
        is_granted: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  });

  await knex('user_permissions').insert(permissions);

  // Crear permisos básicos para operadores
  const operatorIds = await knex('users').where('role', 'operator').pluck('id');
  
  const operatorPermissions = [
    'photo.create',
    'photo.read.own',
    'photo.update.own',
    'location.update.own',
    'profile.update.own'
  ];

  const operatorPerms = [];
  operatorIds.forEach(operatorId => {
    operatorPermissions.forEach(permission => {
      operatorPerms.push({
        user_id: operatorId,
        permission_key: permission,
        is_granted: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
  });

  await knex('user_permissions').insert(operatorPerms);
}; 