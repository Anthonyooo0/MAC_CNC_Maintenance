import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

app.http('getRecords', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'records',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const pool = await getPool();
      const request = pool.request();

      let whereClause = '';
      const conditions: string[] = [];

      const machineId = req.query.get('machineId');
      if (machineId) {
        request.input('machineId', sql.NVarChar, machineId);
        conditions.push('machine_id = @machineId');
      }

      const startDate = req.query.get('startDate');
      if (startDate) {
        request.input('startDate', sql.Date, startDate);
        conditions.push('completed_date >= @startDate');
      }

      const endDate = req.query.get('endDate');
      if (endDate) {
        request.input('endDate', sql.Date, endDate);
        conditions.push('completed_date <= @endDate');
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      const result = await request.query(
        `SELECT * FROM dbo.cnc_maintenance_records ${whereClause} ORDER BY created_at DESC`
      );

      // Parse completed_items JSON string back to array
      const records = result.recordset.map((r: any) => ({
        ...r,
        completed_items: r.completed_items ? JSON.parse(r.completed_items) : [],
      }));

      return { jsonBody: records };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
