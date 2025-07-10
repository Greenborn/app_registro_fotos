/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('user_sessions', function(table) {
    table.string('ip_address', 45).nullable().after('device_info');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('user_sessions', function(table) {
    table.dropColumn('ip_address');
  });
};
