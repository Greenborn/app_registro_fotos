/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE user_sessions 
    ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS refresh_token TEXT,
    ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500)
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE user_sessions 
    DROP COLUMN IF EXISTS last_activity,
    DROP COLUMN IF EXISTS refresh_token,
    DROP COLUMN IF EXISTS user_agent
  `);
};
