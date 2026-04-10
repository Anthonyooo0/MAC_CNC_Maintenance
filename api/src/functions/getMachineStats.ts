import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';

app.http('getMachineStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'stats/machines',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const pool = await getPool();

      const result = await pool.request().query(`
        SELECT
          r.machine_id,
          r.machine_name,
          r.machine_type,
          COUNT(*) AS record_count,
          MAX(r.completed_date) AS last_maintenance,
          AVG(
            CASE
              WHEN r.total_items > 0
              THEN CAST(j.completed_count AS FLOAT) / r.total_items * 100
              ELSE 0
            END
          ) AS avg_completion
        FROM dbo.cnc_maintenance_records r
        CROSS APPLY (
          SELECT COUNT(*) AS completed_count FROM OPENJSON(r.completed_items)
        ) j
        GROUP BY r.machine_id, r.machine_name, r.machine_type
        ORDER BY r.machine_name
      `);

      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
