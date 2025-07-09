/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('table_name', 50);
    table.integer('record_id');
    table.json('old_values');
    table.json('new_values');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['user_id']);
    table.index(['action']);
    table.index(['table_name']);
    table.index(['created_at']);
    table.index(['user_id', 'created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
}; 