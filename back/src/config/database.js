const knex = require('knex');
const knexfile = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

const db = knex(config);

// Función para verificar la conexión
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log('🔌 Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error.message);
  }
};

module.exports = {
  db,
  testConnection,
  closeConnection
}; 