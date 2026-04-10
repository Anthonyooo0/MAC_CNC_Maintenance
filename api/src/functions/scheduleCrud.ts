import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

// POST /api/schedule — create a new schedule entry
app.http('createSchedule', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'schedule',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as any;
      const { machine_id, machine_name, frequency, scheduled_date, userEmail } = body;

      if (!machine_id || !machine_name || !frequency || !scheduled_date) {
        return { status: 400, body: 'machine_id, machine_name, frequency, and scheduled_date are required' };
      }

      const pool = await getPool();
      const result = await pool.request()
        .input('machine_id', sql.NVarChar, machine_id)
        .input('machine_name', sql.NVarChar, machine_name)
        .input('frequency', sql.NVarChar, frequency)
        .input('scheduled_date', sql.Date, scheduled_date)
        .query(`
          INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
          OUTPUT INSERTED.*
          VALUES (@machine_id, @machine_name, @frequency, @scheduled_date)
        `);

      // Audit log
      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail || 'system')
        .input('project_id', sql.Int, result.recordset[0].id)
        .input('project_info', sql.NVarChar, `${machine_name} (${frequency})`)
        .input('action', sql.NVarChar, 'Schedule Created')
        .input('changes', sql.NVarChar, `Added ${frequency} maintenance for ${scheduled_date}`)
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      return { status: 201, jsonBody: result.recordset[0] };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// PUT /api/schedule/:id — update a schedule entry (change date, etc.)
app.http('updateSchedule', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'schedule/{id}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const body = (await req.json()) as any;
      const { scheduled_date, frequency, userEmail } = body;

      const pool = await getPool();

      const current = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_maintenance_schedule WHERE id = @id');
      if (current.recordset.length === 0) {
        return { status: 404, body: 'Schedule item not found' };
      }

      const old = current.recordset[0];
      const newDate = scheduled_date || old.scheduled_date;
      const newFreq = frequency || old.frequency;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('scheduled_date', sql.Date, newDate)
        .input('frequency', sql.NVarChar, newFreq)
        .query(`
          UPDATE dbo.cnc_maintenance_schedule
          SET scheduled_date = @scheduled_date, frequency = @frequency
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      // Audit
      const diffs: string[] = [];
      if (String(old.scheduled_date).slice(0, 10) !== String(newDate).slice(0, 10)) {
        diffs.push(`Date: ${String(old.scheduled_date).slice(0, 10)} → ${newDate}`);
      }
      if (old.frequency !== newFreq) diffs.push(`Frequency: ${old.frequency} → ${newFreq}`);

      if (diffs.length > 0) {
        await pool.request()
          .input('timestamp', sql.NVarChar, new Date().toLocaleString())
          .input('user_email', sql.NVarChar, userEmail || 'system')
          .input('project_id', sql.Int, id)
          .input('project_info', sql.NVarChar, `${old.machine_name} (${newFreq})`)
          .input('action', sql.NVarChar, 'Schedule Updated')
          .input('changes', sql.NVarChar, diffs.join(' | '))
          .query(`
            INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
            VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
          `);
      }

      return { jsonBody: result.recordset[0] };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// DELETE /api/schedule/:id — delete a schedule entry
app.http('deleteSchedule', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'schedule/{id}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const userEmail = req.query.get('userEmail') || 'system';

      const pool = await getPool();

      const current = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_maintenance_schedule WHERE id = @id');
      if (current.recordset.length === 0) {
        return { status: 404, body: 'Schedule item not found' };
      }

      const item = current.recordset[0];

      await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM dbo.cnc_maintenance_schedule WHERE id = @id');

      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail)
        .input('project_id', sql.Int, id)
        .input('project_info', sql.NVarChar, `${item.machine_name} (${item.frequency})`)
        .input('action', sql.NVarChar, 'Schedule Deleted')
        .input('changes', sql.NVarChar, `Removed ${item.frequency} entry for ${String(item.scheduled_date).slice(0, 10)}`)
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      return { status: 204 };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
