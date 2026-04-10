import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

app.http('updateRecord', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'records/{id}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      if (!id) return { status: 400, body: 'Invalid record id' };

      const body = (await req.json()) as any;
      const { completed_items, completed_date, notes, operator_email } = body;

      const pool = await getPool();

      // Fetch the existing record so we can build a diff and resolve task names
      const existing = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_maintenance_records WHERE id = @id');

      if (existing.recordset.length === 0) {
        return { status: 404, body: 'Record not found' };
      }

      const old = existing.recordset[0];
      const newCompletedJson = JSON.stringify(completed_items || []);
      const newDate = completed_date || old.completed_date;
      const newNotes = notes !== undefined ? notes : old.notes;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('completed_items', sql.NVarChar, newCompletedJson)
        .input('completed_date', sql.Date, newDate)
        .input('notes', sql.NVarChar, newNotes)
        .query(`
          UPDATE dbo.cnc_maintenance_records
          SET completed_items = @completed_items,
              completed_date = @completed_date,
              notes = @notes
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      const record = result.recordset[0];

      // Build audit log entry with task names
      const oldCompleted: number[] = old.completed_items ? JSON.parse(old.completed_items) : [];
      const newCompleted: number[] = Array.isArray(completed_items) ? completed_items : [];
      const oldSet = new Set(oldCompleted);
      const newlyAdded = newCompleted.filter((i) => !oldSet.has(i));

      let detail = `Resumed: ${oldCompleted.length} -> ${newCompleted.length}/${old.total_items} tasks complete`;
      try {
        const machineResult = await pool.request()
          .input('mid', sql.NVarChar, old.machine_id)
          .query('SELECT weekly_tasks, monthly_tasks FROM dbo.cnc_machines WHERE machine_id = @mid');
        if (machineResult.recordset.length > 0) {
          const m = machineResult.recordset[0];
          const tasksJson = old.frequency === 'weekly' ? m.weekly_tasks : m.monthly_tasks;
          const allTasks: string[] = tasksJson ? JSON.parse(tasksJson) : [];
          const addedNames = newlyAdded
            .filter((i) => i >= 0 && i < allTasks.length)
            .map((i) => allTasks[i]);
          if (addedNames.length > 0) {
            detail += ` — Added: ${addedNames.join(' | ')}`;
          }
        }
      } catch { /* fall back */ }

      if (newNotes && newNotes !== old.notes) {
        detail += ` — Notes updated: ${newNotes}`;
      }

      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, operator_email || old.operator_email)
        .input('project_id', sql.Int, id)
        .input('project_info', sql.NVarChar, `${old.machine_name} (${old.frequency})`)
        .input('action', sql.NVarChar, 'Checklist Resumed')
        .input('changes', sql.NVarChar, detail)
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      return {
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
