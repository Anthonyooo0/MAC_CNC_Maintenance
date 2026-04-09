-- ============================================
-- CNC Maintenance Tracker — Database Schema
-- Run this script against your Azure SQL Database
-- using Azure Data Studio, SSMS, or the Azure Portal Query Editor.
-- ============================================

-- 1. Maintenance Records
-- Stores every completed checklist submission
CREATE TABLE dbo.maintenance_records (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    machine_id      NVARCHAR(100)   NOT NULL,
    machine_name    NVARCHAR(255)   NOT NULL,
    machine_type    NVARCHAR(50)    NOT NULL,      -- 'cnc-lathe', 'manual-lathe', 'cnc-mill', 'manual-mill'
    frequency       NVARCHAR(20)    NOT NULL,      -- 'weekly' or 'monthly'
    operator_email  NVARCHAR(255)   NOT NULL,
    completed_date  DATE            NOT NULL,
    completed_items NVARCHAR(MAX)   NOT NULL,      -- JSON array of completed item indices, e.g. [0,1,3,5]
    total_items     INT             NOT NULL,
    notes           NVARCHAR(MAX)   NULL,
    created_at      DATETIMEOFFSET  DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_records_machine   ON dbo.maintenance_records (machine_id);
CREATE INDEX IX_records_date      ON dbo.maintenance_records (completed_date DESC);
CREATE INDEX IX_records_operator  ON dbo.maintenance_records (operator_email);
CREATE INDEX IX_records_frequency ON dbo.maintenance_records (frequency);

-- 2. Maintenance Schedule
-- Tracks upcoming and completed scheduled maintenance events
CREATE TABLE dbo.maintenance_schedule (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    machine_id      NVARCHAR(100)   NOT NULL,
    machine_name    NVARCHAR(255)   NOT NULL,
    frequency       NVARCHAR(20)    NOT NULL,      -- 'weekly' or 'monthly'
    scheduled_date  DATE            NOT NULL,
    completed       BIT             DEFAULT 0,
    completed_by    NVARCHAR(255)   NULL,
    completed_date  DATE            NULL,
    created_at      DATETIMEOFFSET  DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_schedule_machine ON dbo.maintenance_schedule (machine_id);
CREATE INDEX IX_schedule_date    ON dbo.maintenance_schedule (scheduled_date);
CREATE INDEX IX_schedule_status  ON dbo.maintenance_schedule (completed, scheduled_date);

-- 3. Audit Log (Changelog)
-- Records all data mutations for compliance and traceability
CREATE TABLE dbo.changelog (
    id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    created_at    DATETIMEOFFSET   DEFAULT SYSDATETIMEOFFSET(),
    timestamp     NVARCHAR(100),
    user_email    NVARCHAR(255),
    project_id    INT,
    project_info  NVARCHAR(500),
    action        NVARCHAR(100),
    changes       NVARCHAR(MAX)
);

CREATE INDEX IX_changelog_project ON dbo.changelog (project_id);
CREATE INDEX IX_changelog_created ON dbo.changelog (created_at DESC);
