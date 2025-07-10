/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('location_update_config', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('update_frequency').notNullable().defaultTo(5000);
    table.boolean('is_enabled').notNullable().defaultTo(true);
    table.timestamp('last_update');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['user_id']);
    table.index(['is_enabled']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('location_update_config');
}; 