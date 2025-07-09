/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('photos', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('file_path', 255).notNullable();
    table.string('file_name', 255).notNullable();
    table.integer('file_size').notNullable();
    table.string('mime_type', 50).notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('orientation', 5, 2);
    table.decimal('altitude', 8, 2);
    table.decimal('accuracy', 8, 2);
    table.timestamp('captured_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['user_id']);
    table.index(['captured_at']);
    table.index(['latitude', 'longitude']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('photos');
}; 