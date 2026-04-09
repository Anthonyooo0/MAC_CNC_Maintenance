import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';

app.http('getChangelog', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'changelog',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const pool = await getPool();
      const result = await pool.request().query(
        'SELECT * FROM dbo.changelog ORDER BY created_at DESC'
      );
      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
