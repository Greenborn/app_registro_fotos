require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: process.env.DB_CLIENT === 'mysql2' ? {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    } : {
      filename: process.env.DB_FILENAME || './dev.sqlite3'
    },
    useNullAsDefault: process.env.DB_CLIENT !== 'mysql2',
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    }
  },

  production: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      //port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  mysql: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  postgresql: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
}; 