/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('photo_metadata', function(table) {
    table.increments('id').primary();
    table.integer('photo_id').notNullable();
    table.string('key', 100).notNullable();
    table.string('value', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('photo_metadata');
}; 