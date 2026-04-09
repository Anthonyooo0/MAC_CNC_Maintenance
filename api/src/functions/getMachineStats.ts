import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';

app.http('getMachineStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'machines/stats',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const pool = await getPool();

      const result = await pool.request().query(`
        SELECT
          machine_id,
          machine_name,
          machine_type,
          COUNT(*) AS record_count,
          MAX(completed_date) AS last_maintenance,
          AVG(
            CASE
              WHEN total_items > 0
              THEN CAST(
                (SELECT COUNT(*) FROM OPENJSON(completed_items)) AS FLOAT
              ) / total_items * 100
              ELSE 0
            END
          ) AS avg_completion
        FROM dbo.maintenance_records
        GROUP BY machine_id, machine_name, machine_type
        ORDER BY machine_name
      `);

      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
