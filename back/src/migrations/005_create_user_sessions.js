/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_sessions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('session_token', 255).notNullable().unique();
    table.string('refresh_token', 255);
    table.text('device_info');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_activity').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['user_id']);
    table.index(['session_token']);
    table.index(['is_active']);
    table.index(['expires_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_sessions');
}; 