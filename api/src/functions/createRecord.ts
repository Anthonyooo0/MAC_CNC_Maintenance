import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

app.http('createRecord', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'records',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as any;
      const {
        machine_id,
        machine_name,
        machine_type,
        frequency,
        operator_email,
        completed_date,
        completed_items,
        total_items,
        notes,
      } = body;

      if (!machine_id || !machine_name || !frequency || !operator_email || !completed_date) {
        return { status: 400, body: 'Missing required fields' };
      }

      const pool = await getPool();

      // Insert maintenance record
      const result = await pool
        .request()
        .input('machine_id', sql.NVarChar, machine_id)
        .input('machine_name', sql.NVarChar, machine_name)
        .input('machine_type', sql.NVarChar, machine_type)
        .input('frequency', sql.NVarChar, frequency)
        .input('operator_email', sql.NVarChar, operator_email)
        .input('completed_date', sql.Date, completed_date)
        .input('completed_items', sql.NVarChar, JSON.stringify(completed_items || []))
        .input('total_items', sql.Int, total_items || 0)
        .input('notes', sql.NVarChar, notes || null)
        .query(`
          INSERT INTO dbo.cnc_maintenance_records
            (machine_id, machine_name, machine_type, frequency, operator_email, completed_date, completed_items, total_items, notes)
          OUTPUT INSERTED.*
          VALUES
            (@machine_id, @machine_name, @machine_type, @frequency, @operator_email, @completed_date, @completed_items, @total_items, @notes)
        `);

      const record = result.recordset[0];

      // Write audit log entry
      const completedCount = Array.isArray(completed_items) ? completed_items.length : 0;
      await pool
        .request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, operator_email)
        .input('project_id', sql.Int, record.id)
        .input('project_info', sql.NVarChar, `${machine_name} (${frequency})`)
        .input('action', sql.NVarChar, 'Checklist Completed')
        .input('changes', sql.NVarChar, `${completedCount}/${total_items} tasks completed`)
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      return {
        status: 201,
        jsonBody: {
          ...record,
          completed_items: record.completed_items ? JSON.parse(record.completed_items) : [],
        },
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
