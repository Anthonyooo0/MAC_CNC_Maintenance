import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

app.http('completeSchedule', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'schedule/{id}/complete',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const body = (await req.json()) as any;
      const userEmail = body.userEmail;

      if (!id || !userEmail) {
        return { status: 400, body: 'Missing id or userEmail' };
      }

      const pool = await getPool();

      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .input('completed_by', sql.NVarChar, userEmail)
        .input('completed_date', sql.Date, new Date().toISOString().split('T')[0])
        .query(`
          UPDATE dbo.maintenance_schedule
          SET completed = 1, completed_by = @completed_by, completed_date = @completed_date
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return { status: 404, body: 'Schedule item not found' };
      }

      const item = result.recordset[0];

      // Audit log
      await pool
        .request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail)
        .input('project_id', sql.Int, id)
        .input('project_info', sql.NVarChar, `${item.machine_name} (${item.frequency})`)
        .input('action', sql.NVarChar, 'Schedule Completed')
        .input('changes', sql.NVarChar, `Marked scheduled ${item.frequency} maintenance as complete`)
        .query(`
          INSERT INTO dbo.changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      return { jsonBody: item };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
