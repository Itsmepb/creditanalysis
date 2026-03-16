import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString:        process.env.DATABASE_URL,
  ssl:                     { rejectUnauthorized: false },
  max:                     3,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis:       30000,
});

export default pool;