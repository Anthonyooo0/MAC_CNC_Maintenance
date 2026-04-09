import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

// GET /api/machines — list all machines from database
app.http('listMachines', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'machines',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const pool = await getPool();
      const result = await pool.request().query(
        'SELECT * FROM dbo.cnc_machines ORDER BY type, name'
      );
      const machines = result.recordset.map((m: any) => ({
        ...m,
        weekly_tasks: m.weekly_tasks ? JSON.parse(m.weekly_tasks) : [],
        monthly_tasks: m.monthly_tasks ? JSON.parse(m.monthly_tasks) : [],
      }));
      return { jsonBody: machines };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// GET /api/machines/:id — get single machine
app.http('getMachine', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'machines/{id:int}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const pool = await getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_machines WHERE id = @id');

      if (result.recordset.length === 0) {
        return { status: 404, body: 'Machine not found' };
      }

      const m = result.recordset[0];
      return {
        jsonBody: {
          ...m,
          weekly_tasks: m.weekly_tasks ? JSON.parse(m.weekly_tasks) : [],
          monthly_tasks: m.monthly_tasks ? JSON.parse(m.monthly_tasks) : [],
        },
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// POST /api/machines — create a new machine
app.http('createMachine', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'machines',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as any;
      const { name, type, status, weekly_tasks, monthly_tasks, video_weekly, video_monthly, userEmail } = body;

      if (!name || !type) {
        return { status: 400, body: 'name and type are required' };
      }

      // Generate machine_id slug from name
      const machine_id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const pool = await getPool();
      const result = await pool.request()
        .input('machine_id', sql.NVarChar, machine_id)
        .input('name', sql.NVarChar, name)
        .input('type', sql.NVarChar, type)
        .input('status', sql.NVarChar, status || 'active')
        .input('weekly_tasks', sql.NVarChar, JSON.stringify(weekly_tasks || []))
        .input('monthly_tasks', sql.NVarChar, JSON.stringify(monthly_tasks || []))
        .input('video_weekly', sql.NVarChar, video_weekly || null)
        .input('video_monthly', sql.NVarChar, video_monthly || null)
        .query(`
          INSERT INTO dbo.cnc_machines (machine_id, name, type, status, weekly_tasks, monthly_tasks, video_weekly, video_monthly)
          OUTPUT INSERTED.*
          VALUES (@machine_id, @name, @type, @status, @weekly_tasks, @monthly_tasks, @video_weekly, @video_monthly)
        `);

      // Audit log
      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail || 'system')
        .input('project_id', sql.Int, result.recordset[0].id)
        .input('project_info', sql.NVarChar, name)
        .input('action', sql.NVarChar, 'Machine Added')
        .input('changes', sql.NVarChar, `Added new ${type}: ${name}`)
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      const m = result.recordset[0];
      return {
        status: 201,
        jsonBody: {
          ...m,
          weekly_tasks: m.weekly_tasks ? JSON.parse(m.weekly_tasks) : [],
          monthly_tasks: m.monthly_tasks ? JSON.parse(m.monthly_tasks) : [],
        },
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// PUT /api/machines/:id — update a machine
app.http('updateMachine', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'machines/{id:int}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const body = (await req.json()) as any;
      const { name, type, status, weekly_tasks, monthly_tasks, video_weekly, video_monthly, userEmail } = body;

      const pool = await getPool();

      // Get current values for audit diff
      const current = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_machines WHERE id = @id');
      if (current.recordset.length === 0) {
        return { status: 404, body: 'Machine not found' };
      }

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('type', sql.NVarChar, type)
        .input('status', sql.NVarChar, status || 'active')
        .input('weekly_tasks', sql.NVarChar, JSON.stringify(weekly_tasks || []))
        .input('monthly_tasks', sql.NVarChar, JSON.stringify(monthly_tasks || []))
        .input('video_weekly', sql.NVarChar, video_weekly || null)
        .input('video_monthly', sql.NVarChar, video_monthly || null)
        .query(`
          UPDATE dbo.cnc_machines
          SET name = @name, type = @type, status = @status,
              weekly_tasks = @weekly_tasks, monthly_tasks = @monthly_tasks,
              video_weekly = @video_weekly, video_monthly = @video_monthly,
              updated_at = SYSDATETIMEOFFSET()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);

      // Build diff for audit
      const old = current.recordset[0];
      const diffs: string[] = [];
      if (old.name !== name) diffs.push(`Name: ${old.name} → ${name}`);
      if (old.type !== type) diffs.push(`Type: ${old.type} → ${type}`);
      if (old.status !== (status || 'active')) diffs.push(`Status: ${old.status} → ${status}`);
      const oldWeeklyCount = old.weekly_tasks ? JSON.parse(old.weekly_tasks).length : 0;
      const newWeeklyCount = (weekly_tasks || []).length;
      if (oldWeeklyCount !== newWeeklyCount) diffs.push(`Weekly tasks: ${oldWeeklyCount} → ${newWeeklyCount}`);
      const oldMonthlyCount = old.monthly_tasks ? JSON.parse(old.monthly_tasks).length : 0;
      const newMonthlyCount = (monthly_tasks || []).length;
      if (oldMonthlyCount !== newMonthlyCount) diffs.push(`Monthly tasks: ${oldMonthlyCount} → ${newMonthlyCount}`);

      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail || 'system')
        .input('project_id', sql.Int, id)
        .input('project_info', sql.NVarChar, name)
        .input('action', sql.NVarChar, 'Machine Updated')
        .input('changes', sql.NVarChar, diffs.length > 0 ? diffs.join(' | ') : 'No field changes')
        .query(`
          INSERT INTO dbo.cnc_changelog (timestamp, user_email, project_id, project_info, action, changes)
          VALUES (@timestamp, @user_email, @project_id, @project_info, @action, @changes)
        `);

      const m = result.recordset[0];
      return {
        jsonBody: {
          ...m,
          weekly_tasks: m.weekly_tasks ? JSON.parse(m.weekly_tasks) : [],
          monthly_tasks: m.monthly_tasks ? JSON.parse(m.monthly_tasks) : [],
        },
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// DELETE /api/machines/:id — delete a machine
app.http('deleteMachine', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'machines/{id:int}',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const id = Number(req.params.id);
      const userEmail = req.query.get('userEmail') || 'system';

      const pool = await getPool();

      const current = await pool.request().input('id', sql.Int, id)
        .query('SELECT * FROM dbo.cnc_machines WHERE id = @id');
      if (current.recordset.length === 0) {
        return { status: 404, body: 'Machine not found' };
      }

      const machine = current.recordset[0];

      await pool.request().input('id', sql.Int, id)
        .query('DELETE FROM dbo.cnc_machines WHERE id = @id');

      // Audit log
      await pool.request()
        .input('timestamp', sql.NVarChar, new Date().toLocaleString())
        .input('user_email', sql.NVarChar, userEmail)
        .input('project_id', sql.Int, id)
        .input('project_info', sql.NVarChar, machine.name)
        .input('action', sql.NVarChar, 'Machine Deleted')
        .input('changes', sql.NVarChar, `Deleted ${machine.type}: ${machine.name}`)
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
