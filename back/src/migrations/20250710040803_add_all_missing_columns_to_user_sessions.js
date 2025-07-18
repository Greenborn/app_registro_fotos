/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('user_sessions', function(table) {
    table.timestamp('last_activity').defaultTo(knex.fn.now());
    table.text('session_token');
    table.text('refresh_token');
    table.string('user_agent', 500);
    table.timestamp('expires_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user_sessions', function(table) {
    table.dropColumn('last_activity');
    table.dropColumn('session_token');
    table.dropColumn('refresh_token');
    table.dropColumn('user_agent');
    table.dropColumn('expires_at');
  });
};
