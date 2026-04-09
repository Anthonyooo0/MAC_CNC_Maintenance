import React from 'react';
import { Machine } from './types';

// ── SVG Icons ──────────────────────────────────────────────
export const Icons = {
  Dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Checklist: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Machine: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Report: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Changelog: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Logout: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Collapse: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
    </svg>
  ),
  Expand: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
    </svg>
  ),
  Search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Warning: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Download: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Wrench: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  AlertCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Inbox: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
};

// ── Machine Data ──────────────────────────────────────────
export const machineData: { [key: string]: Machine[] } = {
  cncLathes: [
    {
      id: 'doosan-lynx-220l', name: 'DOOSAN LYNX 220L', type: 'cnc-lathe',
      weekly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
        'Grease bar feed push rod with Mobile Grease XHP 222',
      ],
      monthly: [
        'Inspect coolant lines',
        'Clear all chips on way covers and inspect',
        'Check felt wipers',
        'Apply WD40 to way covers',
        'Apply 1 pump of Mobile SHC 460 to tail stock',
        'Check level of hydraulic oil of machine fill with Mobile DTE 24',
        'Check hydraulic lines for leaks',
        'Check spindle lubrication tank level',
        'Fill spindle lubrication with appropriate oil based on following link',
        'Power off machine and clean vector drive air filter',
        'Dredge bottom of coolant tank to remove excessive chip build up',
        'Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting',
        'Apply Mobile Grease XHP 222 to Barfeeder pads and slots',
      ],
      videos: { weekly: 'HAAS CNC Lathe Weekly Maintenance Video', monthly: 'HAAS CNC Lathe Monthly Maintenance Video' },
    },
    {
      id: 'dn-puma-v8300m', name: 'DN Puma V8300M', type: 'cnc-lathe',
      weekly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
        'Grease bar feed push rod with Mobile Grease XHP 222',
      ],
      monthly: [
        'Inspect coolant lines', 'Clear all chips on way covers and inspect', 'Check felt wipers',
        'Apply WD40 to way covers', 'Apply 1 pump of Mobile SHC 460 to tail stock',
        'Check level of hydraulic oil of machine fill with Mobile DTE 24',
        'Check hydraulic lines for leaks', 'Check spindle lubrication tank level',
        'Fill spindle lubrication with appropriate oil',
        'Power off machine and clean vector drive air filter',
        'Dredge bottom of coolant tank to remove excessive chip build up',
        'Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting',
        'Apply Mobile Grease XHP 222 to Barfeeder pads and slots',
      ],
      videos: { weekly: 'HAAS CNC Lathe Weekly Maintenance Video', monthly: 'HAAS CNC Lathe Monthly Maintenance Video' },
    },
    {
      id: 'haas-st20y', name: 'HAAS ST20Y', type: 'cnc-lathe',
      weekly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
        'Grease bar feed push rod with Mobile Grease XHP 222',
      ],
      monthly: [
        'Inspect coolant lines', 'Clear all chips on way covers and inspect', 'Check felt wipers',
        'Apply WD40 to way covers', 'Apply 1 pump of Mobile SHC 460 to tail stock',
        'Check level of hydraulic oil of machine fill with Mobile DTE 24',
        'Check hydraulic lines for leaks', 'Check spindle lubrication tank level',
        'Fill spindle lubrication with appropriate oil',
        'Power off machine and clean vector drive air filter',
        'Dredge bottom of coolant tank to remove excessive chip build up',
        'Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting',
        'Apply Mobile Grease XHP 222 to Barfeeder pads and slots',
      ],
      videos: { weekly: 'HAAS CNC Lathe Weekly Maintenance Video', monthly: 'HAAS CNC Lathe Monthly Maintenance Video' },
    },
    {
      id: 'haas-ds-30y', name: 'HAAS DS-30Y', type: 'cnc-lathe',
      weekly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
        'Grease bar feed push rod with Mobile Grease XHP 222',
      ],
      monthly: [
        'Inspect coolant lines', 'Clear all chips on way covers and inspect', 'Check felt wipers',
        'Apply WD40 to way covers', 'Apply 1 pump of Mobile SHC 460 to tail stock',
        'Check level of hydraulic oil of machine fill with Mobile DTE 24',
        'Check hydraulic lines for leaks', 'Check spindle lubrication tank level',
        'Fill spindle lubrication with appropriate oil',
        'Power off machine and clean vector drive air filter',
        'Dredge bottom of coolant tank to remove excessive chip build up',
        'Apply 1 pump of Mobile grease XHP 222 to barfeeder zerk fitting',
        'Apply Mobile Grease XHP 222 to Barfeeder pads and slots',
      ],
      videos: { weekly: 'HAAS CNC Lathe Weekly Maintenance Video', monthly: 'HAAS CNC Lathe Monthly Maintenance Video' },
    },
  ],
  manualLathes: [
    {
      id: 'c10msm-2540', name: 'C10MSM - 2540', type: 'manual-lathe',
      monthly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level at regulator',
        'Remove all chips from inside of machine including on top of turret and cavities',
      ],
    },
    {
      id: 'sn50b-20497', name: 'SN50B - 20497', type: 'manual-lathe',
      monthly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level at regulator',
        'Remove all chips from inside of machine including on top of turret and cavities',
      ],
    },
    {
      id: 'sn50b-60052', name: 'SN50B - 60052', type: 'manual-lathe',
      monthly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level at regulator',
        'Remove all chips from inside of machine including on top of turret and cavities',
      ],
    },
    {
      id: 'gt-2080', name: 'GT-2080', type: 'manual-lathe',
      monthly: [
        'Apply 3 pumps of grease to hydraulic chuck at each zerk fitting',
        'Check Hydraulic pressure', 'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level at regulator',
        'Remove all chips from inside of machine including on top of turret and cavities',
      ],
    },
  ],
  cncMills: [
    {
      id: 'prototrak-2op', name: 'PROTOTRAK 2OP', type: 'cnc-mill',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Clean chip build up on top of umbrella tool changer',
        'Remove all tools from carousel', 'Clean chip and coolant buildup on carousel plate',
        'Grease extractor fingers using Mobile XHP 222',
        'Inspect for wear and damage on extractor fingers',
        'Inspect tool doors for serviceability',
        'Remove number plate and sheet metal covering door to clear chips',
        'Lightly grease v-rail guide rails', 'Check for wear on wheels and rails',
        'Clear any chips on rails', 'Inspect motors, mechanical sensors, and proximity sensors',
        'Check wires for damage or chip build up around proximity sensors',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
    {
      id: 'haas-vf1', name: 'HAAS VF1', type: 'cnc-mill',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Clean chip build up on top of umbrella tool changer',
        'Remove all tools from carousel', 'Clean chip and coolant buildup on carousel plate',
        'Grease extractor fingers using Mobile XHP 222',
        'Inspect for wear and damage on extractor fingers',
        'Inspect tool doors for serviceability',
        'Remove number plate and sheet metal covering door to clear chips',
        'Lightly grease v-rail guide rails', 'Check for wear on wheels and rails',
        'Clear any chips on rails', 'Inspect motors, mechanical sensors, and proximity sensors',
        'Check wires for damage or chip build up around proximity sensors',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
    {
      id: 'haas-vf6ss', name: 'HAAS VF6SS', type: 'cnc-mill', status: 'down',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Remove all tools from tool changer',
        'Hit E-stop when the arm is at its lowest level during a tool change',
        'Check straightness of tool changer arm',
        'Inspect v-groove and finger for wear or damage',
        'Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222',
        'Inspect way covers for damage to sheet metal and wipers',
        'Apply WD40 to way covers and move axis back and forth',
        'Check spindle lubrication tank level in the loop panel',
        'Refill spindle lubrication tank using correct oil',
        'Power off machine and clean vector drive filter',
        'Dredge bottom of coolant tank and remove chips from tank',
        'Check the reading of counterbalance gauge and verify it against recommended value for the machine',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
    {
      id: 'haas-umc-750-robot', name: 'HAAS UMC-750 Robot', type: 'cnc-mill',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Remove all tools from tool changer',
        'Hit E-stop when the arm is at its lowest level during a tool change',
        'Check straightness of tool changer arm',
        'Inspect v-groove and finger for wear or damage',
        'Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222',
        'Inspect way covers for damage to sheet metal and wipers',
        'Apply WD40 to way covers and move axis back and forth',
        'Check spindle lubrication tank level in the loop panel',
        'Refill spindle lubrication tank using correct oil',
        'Power off machine and clean vector drive filter',
        'Dredge bottom of coolant tank and remove chips from tank',
        'Check the reading of counterbalance gauge and verify it against recommended value for the machine',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
    {
      id: 'nhx-5000', name: 'NHX 5000', type: 'cnc-mill',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Remove all tools from tool changer',
        'Hit E-stop when the arm is at its lowest level during a tool change',
        'Check straightness of tool changer arm',
        'Inspect v-groove and finger for wear or damage',
        'Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222',
        'Inspect way covers for damage to sheet metal and wipers',
        'Apply WD40 to way covers and move axis back and forth',
        'Check spindle lubrication tank level in the loop panel',
        'Refill spindle lubrication tank using correct oil',
        'Power off machine and clean vector drive filter',
        'Dredge bottom of coolant tank and remove chips from tank',
        'Check the reading of counterbalance gauge and verify it against recommended value for the machine',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
    {
      id: 'umc-750ss-pallet', name: 'UMC-750SS Pallet', type: 'cnc-mill',
      weekly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
      monthly: [
        'Remove all tools from tool changer',
        'Hit E-stop when the arm is at its lowest level during a tool change',
        'Check straightness of tool changer arm',
        'Inspect v-groove and finger for wear or damage',
        'Lightly grease the v-groove plungers and slider cap using Mobile Grease XHP 222',
        'Inspect way covers for damage to sheet metal and wipers',
        'Apply WD40 to way covers and move axis back and forth',
        'Check spindle lubrication tank level in the loop panel',
        'Refill spindle lubrication tank using correct oil',
        'Power off machine and clean vector drive filter',
        'Dredge bottom of coolant tank and remove chips from tank',
        'Check the reading of counterbalance gauge and verify it against recommended value for the machine',
      ],
      videos: { weekly: 'HAAS CNC MILL Weekly Maintenance Video', monthly: 'HAAS CNC Mill Monthly Maintenance Video' },
    },
  ],
  manualMills: [
    {
      id: 'acer-accurite', name: 'ACER ACCURITE', type: 'manual-mill',
      monthly: [
        'Inspect all collets for damage', 'Check airlines for water by depressing the trigger on the air gun',
        'Inspect air pressure gauge on regulator', 'Inspect air pressure to pneumatic drawbar',
        'Inspect threads on drawbar', 'Check the head for perpendicularity',
        'Warm spindle up at various RPM', 'Check horizontal ways and ensure the table moves freely',
        'Check vertical ways and ensure the knee moves freely',
        'Check the oil level in the One Shot system, fill accordingly',
      ],
    },
    {
      id: 'bridgeport-kmx', name: 'BRIDGEPORT KMX', type: 'manual-mill',
      monthly: [
        'Inspect all collets for damage', 'Check airlines for water by depressing the trigger on the air gun',
        'Inspect air pressure gauge on regulator', 'Inspect air pressure to pneumatic drawbar',
        'Inspect threads on drawbar', 'Check the head for perpendicularity',
        'Warm spindle up at various RPM', 'Check horizontal ways and ensure the table moves freely',
        'Check vertical ways and ensure the knee moves freely',
        'Check the oil level in the One Shot system, fill accordingly',
      ],
    },
    {
      id: 'bridgeport-cnc', name: 'BRIDGEPORT (CNC)', type: 'manual-mill',
      monthly: [
        'Inspect all collets for damage', 'Check airlines for water by depressing the trigger on the air gun',
        'Inspect air pressure gauge on regulator', 'Inspect air pressure to pneumatic drawbar',
        'Inspect threads on drawbar', 'Check the head for perpendicularity',
        'Warm spindle up at various RPM', 'Check horizontal ways and ensure the table moves freely',
        'Check vertical ways and ensure the knee moves freely',
        'Check the oil level in the One Shot system, fill accordingly',
      ],
    },
    {
      id: 'bridgeport-hj5320465', name: 'BRIDGEPORT HJ5320465', type: 'manual-mill',
      monthly: [
        'Inspect all collets for damage', 'Check airlines for water by depressing the trigger on the air gun',
        'Inspect air pressure gauge on regulator', 'Inspect air pressure to pneumatic drawbar',
        'Inspect threads on drawbar', 'Check the head for perpendicularity',
        'Warm spindle up at various RPM', 'Check horizontal ways and ensure the table moves freely',
        'Check vertical ways and ensure the knee moves freely',
        'Check the oil level in the One Shot system, fill accordingly',
      ],
    },
    {
      id: 'bridgeport-2-0608353', name: 'BRIDGEPORT 2 - 0608353', type: 'manual-mill',
      monthly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
    },
    {
      id: 'bridgeport-3-1191096', name: 'BRIDGEPORT 3 - 1191096', type: 'manual-mill',
      monthly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
    },
    {
      id: 'bridgeport-pp-1176367', name: 'BRIDGEPORT PP - 1176367', type: 'manual-mill',
      monthly: [
        'Inspect all tool holders, pull studs, and tapers for damage',
        'Check airlines for water by depressing the trigger on the air gun',
        'Check air pressure level on diagnostic screen',
        'Remove all chips from inside of machine including on top of turret and cavities',
        'Inspect air pressure gauge in the loop panel to ensure it matches the controller',
        'Check the coolant tank for tramp oil and remove using absorbent pad',
        'Remove coolant filter from its housing and clean',
        'Check TSE filter on bottom side of pump for excessive buildup',
        'Check cleanliness of Auxiliary coolant filter, replace bag as needed',
      ],
    },
  ],
};

// Helper to get all machines as a flat array
export function getAllMachines(): Machine[] {
  return [
    ...machineData.cncLathes,
    ...machineData.manualLathes,
    ...machineData.cncMills,
    ...machineData.manualMills,
  ];
}

// Machine type labels
export const MACHINE_TYPE_LABELS: Record<string, string> = {
  'cnc-lathe': 'CNC Lathe',
  'manual-lathe': 'Manual Lathe',
  'cnc-mill': 'CNC Mill',
  'manual-mill': 'Manual Mill',
};
