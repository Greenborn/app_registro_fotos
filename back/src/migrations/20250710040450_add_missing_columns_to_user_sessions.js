/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('user_sessions', function(table) {
    // Agregar columna is_active si no existe
    if (!knex.schema.hasColumn('user_sessions', 'is_active')) {
      table.boolean('is_active').defaultTo(true).after('ip_address');
    }
    
    // Agregar columna expires_at si no existe
    if (!knex.schema.hasColumn('user_sessions', 'expires_at')) {
      table.timestamp('expires_at').nullable().after('is_active');
    }
    
    // Agregar columna last_activity si no existe
    if (!knex.schema.hasColumn('user_sessions', 'last_activity')) {
      table.timestamp('last_activity').defaultTo(knex.fn.now()).after('expires_at');
    }
    
    // Agregar columna session_token si no existe
    if (!knex.schema.hasColumn('user_sessions', 'session_token')) {
      table.text('session_token').nullable().after('user_id');
    }
    
    // Agregar columna refresh_token si no existe
    if (!knex.schema.hasColumn('user_sessions', 'refresh_token')) {
      table.text('refresh_token').nullable().after('session_token');
    }
    
    // Agregar columna user_agent si no existe
    if (!knex.schema.hasColumn('user_sessions', 'user_agent')) {
      table.string('user_agent', 500).nullable().after('refresh_token');
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('user_sessions', function(table) {
    table.dropColumn('is_active');
    table.dropColumn('expires_at');
    table.dropColumn('last_activity');
    table.dropColumn('session_token');
    table.dropColumn('refresh_token');
    table.dropColumn('user_agent');
  });
};
