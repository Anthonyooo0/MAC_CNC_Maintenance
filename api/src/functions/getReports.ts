import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { getPool } from '../db';
import sql from 'mssql';

// Completion Report
app.http('reportCompletion', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/completion',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const startDate = req.query.get('startDate');
      const endDate = req.query.get('endDate');
      if (!startDate || !endDate) return { status: 400, body: 'startDate and endDate required' };

      const pool = await getPool();
      const result = await pool
        .request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
          SELECT *,
            (SELECT COUNT(*) FROM OPENJSON(completed_items)) AS completed_count
          FROM dbo.cnc_maintenance_records
          WHERE completed_date >= @startDate AND completed_date <= @endDate
          ORDER BY completed_date DESC
        `);

      const records = result.recordset;
      const totalTasks = records.reduce((s: number, r: any) => s + r.total_items, 0);
      const completedTasks = records.reduce((s: number, r: any) => s + r.completed_count, 0);
      const weeklyRecs = records.filter((r: any) => r.frequency === 'weekly');
      const monthlyRecs = records.filter((r: any) => r.frequency === 'monthly');

      const calcRate = (recs: any[]) => {
        const t = recs.reduce((s: number, r: any) => s + r.total_items, 0);
        const c = recs.reduce((s: number, r: any) => s + r.completed_count, 0);
        return t > 0 ? Math.round((c / t) * 100 * 10) / 10 : 0;
      };

      return {
        jsonBody: {
          total_records: records.length,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          overall_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100 * 10) / 10 : 0,
          weekly_count: weeklyRecs.length,
          weekly_rate: calcRate(weeklyRecs),
          monthly_count: monthlyRecs.length,
          monthly_rate: calcRate(monthlyRecs),
          records: records.map((r: any) => ({
            completed_date: r.completed_date,
            machine_name: r.machine_name,
            frequency: r.frequency,
            operator_email: r.operator_email,
            completed_count: r.completed_count,
            total_items: r.total_items,
          })),
        },
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// By Machine Report
app.http('reportByMachine', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/by-machine',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const startDate = req.query.get('startDate');
      const endDate = req.query.get('endDate');
      if (!startDate || !endDate) return { status: 400, body: 'startDate and endDate required' };

      const pool = await getPool();
      const result = await pool
        .request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
          SELECT
            r.machine_id, r.machine_name, r.machine_type,
            COUNT(*) AS record_count,
            SUM(r.total_items) AS total_tasks,
            SUM(j.completed_count) AS completed_tasks,
            CASE
              WHEN SUM(r.total_items) > 0
              THEN ROUND(
                CAST(SUM(j.completed_count) AS FLOAT)
                / SUM(r.total_items) * 100, 1
              )
              ELSE 0
            END AS completion_rate
          FROM dbo.cnc_maintenance_records r
          CROSS APPLY (
            SELECT COUNT(*) AS completed_count FROM OPENJSON(r.completed_items)
          ) j
          WHERE r.completed_date >= @startDate AND r.completed_date <= @endDate
          GROUP BY r.machine_id, r.machine_name, r.machine_type
          ORDER BY completion_rate DESC
        `);

      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// By Operator Report
app.http('reportByOperator', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/by-operator',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const startDate = req.query.get('startDate');
      const endDate = req.query.get('endDate');
      if (!startDate || !endDate) return { status: 400, body: 'startDate and endDate required' };

      const pool = await getPool();
      const result = await pool
        .request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
          SELECT
            r.operator_email,
            COUNT(*) AS record_count,
            SUM(r.total_items) AS total_tasks,
            SUM(j.completed_count) AS completed_tasks,
            CASE
              WHEN SUM(r.total_items) > 0
              THEN ROUND(
                CAST(SUM(j.completed_count) AS FLOAT)
                / SUM(r.total_items) * 100, 1
              )
              ELSE 0
            END AS completion_rate
          FROM dbo.cnc_maintenance_records r
          CROSS APPLY (
            SELECT COUNT(*) AS completed_count FROM OPENJSON(r.completed_items)
          ) j
          WHERE r.completed_date >= @startDate AND r.completed_date <= @endDate
          GROUP BY r.operator_email
          ORDER BY completion_rate DESC
        `);

      return { jsonBody: result.recordset };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});

// Timeline Report
app.http('reportTimeline', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/timeline',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const startDate = req.query.get('startDate');
      const endDate = req.query.get('endDate');
      if (!startDate || !endDate) return { status: 400, body: 'startDate and endDate required' };

      const pool = await getPool();
      const result = await pool
        .request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
          SELECT *,
            (SELECT COUNT(*) FROM OPENJSON(completed_items)) AS completed_count
          FROM dbo.cnc_maintenance_records
          WHERE completed_date >= @startDate AND completed_date <= @endDate
          ORDER BY completed_date ASC
        `);

      return {
        jsonBody: result.recordset.map((r: any) => ({
          completed_date: r.completed_date,
          machine_name: r.machine_name,
          machine_type: r.machine_type,
          frequency: r.frequency,
          operator_email: r.operator_email,
          completed_count: r.completed_count,
          total_items: r.total_items,
        })),
      };
    } catch (err: any) {
      return { status: 500, body: err.message };
    }
  },
});
