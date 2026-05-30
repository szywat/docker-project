const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "taskmanager",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        SERIAL PRIMARY KEY,
      title     VARCHAR(255) NOT NULL,
      done      BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

module.exports = { pool, initDB };
