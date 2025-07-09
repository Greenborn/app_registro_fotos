/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_locations', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('altitude', 8, 2);
    table.decimal('accuracy', 8, 2);
    table.decimal('speed', 6, 2);
    table.decimal('heading', 5, 2);
    table.timestamp('recorded_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['user_id']);
    table.index(['recorded_at']);
    table.index(['latitude', 'longitude']);
    table.index(['user_id', 'recorded_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_locations');
}; 