import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';

app.http('getSchedule', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'schedule',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const filter = req.query.get('filter') || 'all';
      const pool = await getPool();

      let query = 'SELECT * FROM dbo.maintenance_schedule';
      const today = new Date().toISOString().split('T')[0];

      if (filter === 'overdue') {
        query += ` WHERE completed = 0 AND scheduled_date < '${today}'`;
      } else if (filter === 'upcoming') {
        const weekOut = new Date();
        weekOut.setDate(weekOut.getDate() + 7);
        const weekOutStr = weekOut.toISOString().split('T')[0];
        query += ` WHERE completed = 0 AND scheduled_date >= '${today}' AND scheduled_date <= '${weekOutStr}'`;
      }

      query += ' ORDER BY scheduled_date ASC';

      const result = await pool.request().query(query);
      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
