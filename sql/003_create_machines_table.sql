-- ============================================
-- Add cnc_machines table to store machine data in the database
-- so operators can add/edit/delete machines from the UI.
-- Run AFTER 001_create_tables.sql.
-- ============================================

CREATE TABLE dbo.cnc_machines (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    machine_id      NVARCHAR(100)   NOT NULL UNIQUE,  -- slug e.g. 'haas-vf1'
    name            NVARCHAR(255)   NOT NULL,
    type            NVARCHAR(50)    NOT NULL,          -- 'cnc-lathe', 'manual-lathe', 'cnc-mill', 'manual-mill'
    status          NVARCHAR(20)    DEFAULT 'active',  -- 'active' or 'down'
    weekly_tasks    NVARCHAR(MAX)   NULL,              -- JSON array of weekly checklist strings
    monthly_tasks   NVARCHAR(MAX)   NULL,              -- JSON array of monthly checklist strings
    video_weekly    NVARCHAR(500)   NULL,
    video_monthly   NVARCHAR(500)   NULL,
    created_at      DATETIMEOFFSET  DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET  DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_cnc_machines_type ON dbo.cnc_machines (type);
CREATE INDEX IX_cnc_machines_status ON dbo.cnc_machines (status);

-- ============================================
-- Seed all 21 machines from the original data
-- ============================================

-- CNC Lathes
INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('doosan-lynx-220l', 'DOOSAN LYNX 220L', 'cnc-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Check cleanliness of Auxiliary coolant filter, replace bag as needed","Grease bar feed push rod with Mobile Grease XHP 222"]',
 '["Inspect coolant lines","Clear all chips on way covers and inspect","Check felt wipers","Apply WD40 to way covers","Apply 1 pump of Mobile SHC 460 to tail stock","Check level of hydraulic oil of machine fill with Mobile DTE 24","Check hydraulic lines for leaks","Check spindle lubrication tank level","Fill spindle lubrication with appropriate oil based on following link","Power off machine and clean vector drive air filter","Dredge bottom of coolant tank to remove excessive chip build up","Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting","Apply Mobile Grease XHP 222 to Barfeeder pads and slots"]',
 'HAAS CNC Lathe Weekly Maintenance Video', 'HAAS CNC Lathe Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('dn-puma-v8300m', 'DN Puma V8300M', 'cnc-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Check cleanliness of Auxiliary coolant filter, replace bag as needed","Grease bar feed push rod with Mobile Grease XHP 222"]',
 '["Inspect coolant lines","Clear all chips on way covers and inspect","Check felt wipers","Apply WD40 to way covers","Apply 1 pump of Mobile SHC 460 to tail stock","Check level of hydraulic oil of machine fill with Mobile DTE 24","Check hydraulic lines for leaks","Check spindle lubrication tank level","Fill spindle lubrication with appropriate oil","Power off machine and clean vector drive air filter","Dredge bottom of coolant tank to remove excessive chip build up","Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting","Apply Mobile Grease XHP 222 to Barfeeder pads and slots"]',
 'HAAS CNC Lathe Weekly Maintenance Video', 'HAAS CNC Lathe Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('haas-st20y', 'HAAS ST20Y', 'cnc-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Check cleanliness of Auxiliary coolant filter, replace bag as needed","Grease bar feed push rod with Mobile Grease XHP 222"]',
 '["Inspect coolant lines","Clear all chips on way covers and inspect","Check felt wipers","Apply WD40 to way covers","Apply 1 pump of Mobile SHC 460 to tail stock","Check level of hydraulic oil of machine fill with Mobile DTE 24","Check hydraulic lines for leaks","Check spindle lubrication tank level","Fill spindle lubrication with appropriate oil","Power off machine and clean vector drive air filter","Dredge bottom of coolant tank to remove excessive chip build up","Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting","Apply Mobile Grease XHP 222 to Barfeeder pads and slots"]',
 'HAAS CNC Lathe Weekly Maintenance Video', 'HAAS CNC Lathe Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('haas-ds-30y', 'HAAS DS-30Y', 'cnc-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Check cleanliness of Auxiliary coolant filter, replace bag as needed","Grease bar feed push rod with Mobile Grease XHP 222"]',
 '["Inspect coolant lines","Clear all chips on way covers and inspect","Check felt wipers","Apply WD40 to way covers","Apply 1 pump of Mobile SHC 460 to tail stock","Check level of hydraulic oil of machine fill with Mobile DTE 24","Check hydraulic lines for leaks","Check spindle lubrication tank level","Fill spindle lubrication with appropriate oil","Power off machine and clean vector drive air filter","Dredge bottom of coolant tank to remove excessive chip build up","Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting","Apply Mobile Grease XHP 222 to Barfeeder pads and slots"]',
 'HAAS CNC Lathe Weekly Maintenance Video', 'HAAS CNC Lathe Monthly Maintenance Video');

-- Manual Lathes (monthly only)
INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('c10msm-2540', 'C10MSM - 2540', 'manual-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level at regulator","Remove all chips from inside of machine including on top of turret and cavities"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('sn50b-20497', 'SN50B - 20497', 'manual-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level at regulator","Remove all chips from inside of machine including on top of turret and cavities"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('sn50b-60052', 'SN50B - 60052', 'manual-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level at regulator","Remove all chips from inside of machine including on top of turret and cavities"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('gt-2080', 'GT-2080', 'manual-lathe',
 '["Apply 3 pumps of grease to hydraulic chuck at each zerk fitting","Check Hydraulic pressure","Check airlines for water by depressing the trigger on the air gun","Check air pressure level at regulator","Remove all chips from inside of machine including on top of turret and cavities"]');

-- CNC Mills
INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('prototrak-2op', 'PROTOTRAK 2OP', 'cnc-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Clean chip build up on top of umbrella tool changer","Remove all tools from carousel","Clean chip and coolant buildup on carousel plate","Grease extractor fingers using Mobile XHP 222","Inspect for wear and damage on extractor fingers","Inspect tool doors for serviceability","Remove number plate and sheet metal covering door to clear chips","Lightly grease v-rail guide rails","Check for wear on wheels and rails","Clear any chips on rails","Inspect motors, mechanical sensors, and proximity sensors","Check wires for damage or chip build up around proximity sensors"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('haas-vf1', 'HAAS VF1', 'cnc-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Clean chip build up on top of umbrella tool changer","Remove all tools from carousel","Clean chip and coolant buildup on carousel plate","Grease extractor fingers using Mobile XHP 222","Inspect for wear and damage on extractor fingers","Inspect tool doors for serviceability","Remove number plate and sheet metal covering door to clear chips","Lightly grease v-rail guide rails","Check for wear on wheels and rails","Clear any chips on rails","Inspect motors, mechanical sensors, and proximity sensors","Check wires for damage or chip build up around proximity sensors"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, status, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('haas-vf6ss', 'HAAS VF6SS', 'cnc-mill', 'down',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Remove all tools from tool changer","Hit E-stop when the arm is at its lowest level during a tool change","Check straightness of tool changer arm","Inspect v-groove and finger for wear or damage","Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222","Inspect way covers for damage to sheet metal and wipers","Apply WD40 to way covers and move axis back and forth","Check spindle lubrication tank level in the loop panel","Refill spindle lubrication tank using correct oil","Power off machine and clean vector drive filter","Dredge bottom of coolant tank and remove chips from tank","Check the reading of counterbalance gauge and verify it against recommended value for the machine"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('haas-umc-750-robot', 'HAAS UMC-750 Robot', 'cnc-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Remove all tools from tool changer","Hit E-stop when the arm is at its lowest level during a tool change","Check straightness of tool changer arm","Inspect v-groove and finger for wear or damage","Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222","Inspect way covers for damage to sheet metal and wipers","Apply WD40 to way covers and move axis back and forth","Check spindle lubrication tank level in the loop panel","Refill spindle lubrication tank using correct oil","Power off machine and clean vector drive filter","Dredge bottom of coolant tank and remove chips from tank","Check the reading of counterbalance gauge and verify it against recommended value for the machine"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('nhx-5000', 'NHX 5000', 'cnc-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Remove all tools from tool changer","Hit E-stop when the arm is at its lowest level during a tool change","Check straightness of tool changer arm","Inspect v-groove and finger for wear or damage","Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222","Inspect way covers for damage to sheet metal and wipers","Apply WD40 to way covers and move axis back and forth","Check spindle lubrication tank level in the loop panel","Refill spindle lubrication tank using correct oil","Power off machine and clean vector drive filter","Dredge bottom of coolant tank and remove chips from tank","Check the reading of counterbalance gauge and verify it against recommended value for the machine"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

INSERT INTO dbo.cnc_machines (machine_id, name, type, weekly_tasks, monthly_tasks, video_weekly, video_monthly) VALUES
('umc-750ss-pallet', 'UMC-750SS Pallet', 'cnc-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]',
 '["Remove all tools from tool changer","Hit E-stop when the arm is at its lowest level during a tool change","Check straightness of tool changer arm","Inspect v-groove and finger for wear or damage","Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222","Inspect way covers for damage to sheet metal and wipers","Apply WD40 to way covers and move axis back and forth","Check spindle lubrication tank level in the loop panel","Refill spindle lubrication tank using correct oil","Power off machine and clean vector drive filter","Dredge bottom of coolant tank and remove chips from tank","Check the reading of counterbalance gauge and verify it against recommended value for the machine"]',
 'HAAS CNC MILL Weekly Maintenance Video', 'HAAS CNC Mill Monthly Maintenance Video');

-- Manual Mills (monthly only)
INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('acer-accurite', 'ACER ACCURITE', 'manual-mill',
 '["Inspect all collets for damage","Check airlines for water by depressing the trigger on the air gun","Inspect air pressure gauge on regulator","Inspect air pressure to pneumatic drawbar","Inspect threads on drawbar","Check the head for perpendicularity","Warm spindle up at various RPM","Check horizontal ways and ensure the table moves freely","Check vertical ways and ensure the knee moves freely","Check the oil level in the One Shot system, fill accordingly"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-kmx', 'BRIDGEPORT KMX', 'manual-mill',
 '["Inspect all collets for damage","Check airlines for water by depressing the trigger on the air gun","Inspect air pressure gauge on regulator","Inspect air pressure to pneumatic drawbar","Inspect threads on drawbar","Check the head for perpendicularity","Warm spindle up at various RPM","Check horizontal ways and ensure the table moves freely","Check vertical ways and ensure the knee moves freely","Check the oil level in the One Shot system, fill accordingly"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-cnc', 'BRIDGEPORT (CNC)', 'manual-mill',
 '["Inspect all collets for damage","Check airlines for water by depressing the trigger on the air gun","Inspect air pressure gauge on regulator","Inspect air pressure to pneumatic drawbar","Inspect threads on drawbar","Check the head for perpendicularity","Warm spindle up at various RPM","Check horizontal ways and ensure the table moves freely","Check vertical ways and ensure the knee moves freely","Check the oil level in the One Shot system, fill accordingly"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-hj5320465', 'BRIDGEPORT HJ5320465', 'manual-mill',
 '["Inspect all collets for damage","Check airlines for water by depressing the trigger on the air gun","Inspect air pressure gauge on regulator","Inspect air pressure to pneumatic drawbar","Inspect threads on drawbar","Check the head for perpendicularity","Warm spindle up at various RPM","Check horizontal ways and ensure the table moves freely","Check vertical ways and ensure the knee moves freely","Check the oil level in the One Shot system, fill accordingly"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-2-0608353', 'BRIDGEPORT 2 - 0608353', 'manual-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-3-1191096', 'BRIDGEPORT 3 - 1191096', 'manual-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]');

INSERT INTO dbo.cnc_machines (machine_id, name, type, monthly_tasks) VALUES
('bridgeport-pp-1176367', 'BRIDGEPORT PP - 1176367', 'manual-mill',
 '["Inspect all tool holders, pull studs, and tapers for damage","Check airlines for water by depressing the trigger on the air gun","Check air pressure level on diagnostic screen","Remove all chips from inside of machine including on top of turret and cavities","Inspect air pressure gauge in the loop panel to ensure it matches the controller","Check the coolant tank for tramp oil and remove using absorbent pad","Remove coolant filter from its housing and clean","Check TSE filter on bottom side of pump for excessive buildup","Check cleanliness of Auxiliary coolant filter, replace bag as needed"]');

-- Verify
SELECT 'Machines seeded:', COUNT(*) FROM dbo.cnc_machines;
