/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('photo_comments', function(table) {
    table.increments('id').primary();
    table.integer('photo_id').notNullable();
    table.integer('user_id').notNullable();
    table.text('comment').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['photo_id']);
    table.index(['user_id']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('photo_comments');
}; 