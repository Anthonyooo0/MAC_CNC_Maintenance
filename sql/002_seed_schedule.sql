-- ============================================
-- Seed initial maintenance schedule
-- Generates 12 weeks of weekly and 6 months of monthly schedule entries
-- for all machines. Run AFTER 001_create_tables.sql.
-- ============================================

-- Helper: declare today
DECLARE @today DATE = CAST(GETDATE() AS DATE);

-- CNC Lathes (weekly + monthly)
DECLARE @cncLathes TABLE (machine_id NVARCHAR(100), machine_name NVARCHAR(255));
INSERT INTO @cncLathes VALUES
  ('doosan-lynx-220l', 'DOOSAN LYNX 220L'),
  ('dn-puma-v8300m', 'DN Puma V8300M'),
  ('haas-st20y', 'HAAS ST20Y'),
  ('haas-ds-30y', 'HAAS DS-30Y');

-- Manual Lathes (monthly only)
DECLARE @manualLathes TABLE (machine_id NVARCHAR(100), machine_name NVARCHAR(255));
INSERT INTO @manualLathes VALUES
  ('c10msm-2540', 'C10MSM - 2540'),
  ('sn50b-20497', 'SN50B - 20497'),
  ('sn50b-60052', 'SN50B - 60052'),
  ('gt-2080', 'GT-2080');

-- CNC Mills (weekly + monthly)
DECLARE @cncMills TABLE (machine_id NVARCHAR(100), machine_name NVARCHAR(255));
INSERT INTO @cncMills VALUES
  ('prototrak-2op', 'PROTOTRAK 2OP'),
  ('haas-vf1', 'HAAS VF1'),
  ('haas-vf6ss', 'HAAS VF6SS'),
  ('haas-umc-750-robot', 'HAAS UMC-750 Robot'),
  ('nhx-5000', 'NHX 5000'),
  ('umc-750ss-pallet', 'UMC-750SS Pallet');

-- Manual Mills (monthly only)
DECLARE @manualMills TABLE (machine_id NVARCHAR(100), machine_name NVARCHAR(255));
INSERT INTO @manualMills VALUES
  ('acer-accurite', 'ACER ACCURITE'),
  ('bridgeport-kmx', 'BRIDGEPORT KMX'),
  ('bridgeport-cnc', 'BRIDGEPORT (CNC)'),
  ('bridgeport-hj5320465', 'BRIDGEPORT HJ5320465'),
  ('bridgeport-2-0608353', 'BRIDGEPORT 2 - 0608353'),
  ('bridgeport-3-1191096', 'BRIDGEPORT 3 - 1191096'),
  ('bridgeport-pp-1176367', 'BRIDGEPORT PP - 1176367');

-- Generate weekly schedule: 12 weeks out for CNC Lathes
DECLARE @i INT = 0;
WHILE @i < 12
BEGIN
  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'weekly', DATEADD(WEEK, @i, @today) FROM @cncLathes;

  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'weekly', DATEADD(WEEK, @i, @today) FROM @cncMills;

  SET @i = @i + 1;
END;

-- Generate monthly schedule: 6 months out for ALL machine types
SET @i = 0;
WHILE @i < 6
BEGIN
  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'monthly', DATEADD(MONTH, @i, @today) FROM @cncLathes;

  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'monthly', DATEADD(MONTH, @i, @today) FROM @manualLathes;

  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'monthly', DATEADD(MONTH, @i, @today) FROM @cncMills;

  INSERT INTO dbo.cnc_maintenance_schedule (machine_id, machine_name, frequency, scheduled_date)
  SELECT machine_id, machine_name, 'monthly', DATEADD(MONTH, @i, @today) FROM @manualMills;

  SET @i = @i + 1;
END;

-- Verify
SELECT 'Schedule items created:', COUNT(*) FROM dbo.cnc_maintenance_schedule;
