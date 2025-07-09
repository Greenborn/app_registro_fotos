/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('system_settings', function(table) {
    table.increments('id').primary();
    table.string('setting_key', 100).notNullable().unique();
    table.text('setting_value');
    table.string('setting_type', 20).notNullable();
    table.text('description');
    table.boolean('is_public').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['setting_key']);
    table.index(['is_public']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('system_settings');
}; 