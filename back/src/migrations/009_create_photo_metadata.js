/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('photo_metadata', function(table) {
    table.increments('id').primary();
    table.integer('photo_id').notNullable().references('id').inTable('photos').onDelete('CASCADE');
    table.string('metadata_key', 100).notNullable();
    table.text('metadata_value');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para optimizar consultas
    table.index(['photo_id']);
    table.index(['metadata_key']);
    table.index(['photo_id', 'metadata_key']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('photo_metadata');
}; 