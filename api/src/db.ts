import sql from 'mssql';

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER!,
  database: process.env.AZURE_SQL_DATABASE!,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// For production with Managed Identity, replace the user/password config with:
// authentication: { type: 'azure-active-directory-default' },

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
