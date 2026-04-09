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

      // Look up machine task names to build detailed audit log
      const completedIndices: number[] = Array.isArray(completed_items) ? completed_items : [];
      const completedCount = completedIndices.length;

      let taskDetails = `${completedCount}/${total_items} tasks completed for ${completed_date}`;
      try {
        const machineResult = await pool.request()
          .input('mid', sql.NVarChar, machine_id)
          .query('SELECT weekly_tasks, monthly_tasks FROM dbo.cnc_machines WHERE machine_id = @mid');
        if (machineResult.recordset.length > 0) {
          const m = machineResult.recordset[0];
          const tasksJson = frequency === 'weekly' ? m.weekly_tasks : m.monthly_tasks;
          const allTasks: string[] = tasksJson ? JSON.parse(tasksJson) : [];
          const completedNames = completedIndices
            .filter((i) => i >= 0 && i < allTasks.length)
            .map((i) => allTasks[i]);
          if (completedNames.length > 0) {
            taskDetails = `${completedCount}/${total_items} tasks for ${completed_date}: ${completedNames.join(' | ')}`;
          }
        }
      } catch { /* fall back to count-only detail */ }

      if (notes) taskDetails += ` — Notes: ${notes}`;

      // Write audit log entry
      await pool
        .request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, operator_email)
        .input('project_id', sql.Int, record.id)
        .input('project_info', sql.NVarChar, `${machine_name} (${frequency})`)
        .input('action', sql.NVarChar, 'Checklist Completed')
        .input('changes', sql.NVarChar, taskDetails)
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
