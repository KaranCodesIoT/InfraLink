// ═══════════════════════════════════════════════════════════════════════════
// PROJECT MANAGEMENT DASHBOARD — Mock Data
// Rich, realistic Indian construction context
// ═══════════════════════════════════════════════════════════════════════════

export const PHASES = [
  { id: 'planning', label: 'Planning', order: 1, color: '#3b82f6' },
  { id: 'structure', label: 'Structure', order: 2, color: '#f97316' },
  { id: 'services', label: 'Services', order: 3, color: '#eab308' },
  { id: 'finishing', label: 'Finishing', order: 4, color: '#22c55e' },
];

export const MOCK_PROJECT = {
  _id: 'proj_001',
  projectName: 'Skyline Tower',
  area: 'Lucknow Street',
  city: 'Lucknow',
  status: 'Under Construction',
  currentPhase: 'structure',
  startDate: '2025-09-01',
  expectedCompletion: '2027-03-15',
  totalBudget: 85000000,
  spentBudget: 32500000,
  progress: 38,
  totalFloors: 18,
  completedFloors: 7,
  totalUnits: 389,
  availableUnits: 112,
  builder: { _id: 'user_001', name: 'Asrar Builder', avatar: null },
};

// ─── Workflow Phases ──────────────────────────────────────────────────────
export const MOCK_WORKFLOW = {
  phases: [
    {
      id: 'planning',
      label: 'Planning',
      status: 'completed',
      progress: 100,
      startDate: '2025-09-01',
      endDate: '2025-11-30',
      tasks: 24,
      completedTasks: 24,
      notes: 'All permits obtained, site survey completed, architectural plans finalized.',
      subtasks: [
        { name: 'Site Survey & Soil Testing', status: 'completed', assignedContractorId: 'c1', workers: 12 },
        { name: 'Architectural Plans Approval', status: 'completed', assignedContractorId: null, workers: 0 },
        { name: 'RERA Registration', status: 'completed', assignedContractorId: null, workers: 0 },
        { name: 'Environmental Clearance', status: 'completed', assignedContractorId: null, workers: 0 },
        { name: 'Municipal Permits', status: 'completed', assignedContractorId: null, workers: 0 },
        { name: 'Foundation Design Finalization', status: 'completed', assignedContractorId: null, workers: 0 },
      ]
    },
    {
      id: 'structure',
      label: 'Structure',
      status: 'active',
      progress: 45,
      startDate: '2025-12-01',
      endDate: '2026-08-30',
      tasks: 36,
      completedTasks: 16,
      notes: 'Foundation completed. Currently on 7th floor slab casting.',
      subtasks: [
        { name: 'Foundation Excavation', status: 'completed', assignedContractorId: 'c1', workers: 15 },
        { name: 'RCC Foundation', status: 'completed', assignedContractorId: 'c1', workers: 20 },
        { name: 'Basement Construction', status: 'completed', assignedContractorId: 'c1', workers: 18 },
        { name: 'Column & Beam Work (Floors 1-7)', status: 'completed', assignedContractorId: 'c1', workers: 22 },
        { name: 'Slab Casting (Floor 8)', status: 'in_progress', assignedContractorId: 'c1', workers: 25 },
        { name: 'Column & Beam Work (Floors 8-18)', status: 'upcoming', assignedContractorId: 'c1', workers: 0 },
      ]
    },
    {
      id: 'services',
      label: 'Services',
      status: 'upcoming',
      progress: 0,
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      tasks: 28,
      completedTasks: 0,
      notes: '',
      subtasks: [
        { name: 'Electrical Wiring', status: 'upcoming', assignedContractorId: 'c2', workers: 0 },
        { name: 'Plumbing & Sanitation', status: 'upcoming', assignedContractorId: 'c3', workers: 0 },
        { name: 'HVAC Installation', status: 'upcoming', assignedContractorId: 'c2', workers: 0 },
        { name: 'Fire Safety Systems', status: 'upcoming', assignedContractorId: 'c3', workers: 0 },
        { name: 'Elevator Installation', status: 'upcoming', assignedContractorId: null, workers: 0 },
      ]
    },
    {
      id: 'finishing',
      label: 'Finishing',
      status: 'upcoming',
      progress: 0,
      startDate: '2027-01-01',
      endDate: '2027-03-15',
      tasks: 32,
      completedTasks: 0,
      notes: '',
      subtasks: [
        { name: 'Plastering & POP', status: 'upcoming' },
        { name: 'Flooring & Tiling', status: 'upcoming' },
        { name: 'Painting & Finishing', status: 'upcoming' },
        { name: 'Fixture Installation', status: 'upcoming' },
        { name: 'Landscaping & Common Areas', status: 'upcoming' },
        { name: 'Final Inspection & Handover', status: 'upcoming' },
      ]
    },
  ]
};

// ─── Teams & Stakeholders ──────────────────────────────────────────────────
export const MOCK_CONTRACTORS = [
  { id: 'c1', name: 'Ramesh Civil Co.', type: 'Civil', phone: '+91 98765 11111', status: 'active', workersCount: 25, progress: 60, assignedTasks: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't11'], delayed: false, rating: 4.8 },
  { id: 'c2', name: 'Gupta Electricals', type: 'Electrical', phone: '+91 98765 22222', status: 'active', workersCount: 12, progress: 15, assignedTasks: ['t8'], delayed: true, rating: 4.2 },
  { id: 'c3', name: 'Metro Plumbing & Sanitation', type: 'Plumbing', phone: '+91 98765 33333', status: 'active', workersCount: 8, progress: 85, assignedTasks: ['t12'], delayed: false, rating: 4.5 },
  { id: 'c4', name: 'Sharma Finishers', type: 'Finishing', phone: '+91 98765 44444', status: 'pending_request', workersCount: 18, progress: 0, assignedTasks: [], delayed: false, rating: 4.9 },
];

export const MOCK_ARCHITECTS = [
  { id: 'a1', name: 'Studio V Architecture', lead: 'Priya Desai', phone: '+91 98765 55555', status: 'active', drawingsSubmitted: 14, approved: 12 },
];

export const MOCK_ENGINEERS = [
  { id: 'e1', name: 'Vikram Singh', specialization: 'Structural Engineer', phone: '+91 87654 32109', status: 'active' },
  { id: 'e2', name: 'Pradeep Verma', specialization: 'Site Supervisor', phone: '+91 65432 10987', status: 'active' },
];

export const MOCK_LABOUR_REQUESTS = [
  { id: 'lr1', workerName: 'Raju Bhai', skill: 'Mason', experience: '5 years', phone: '+91 99999 11111', expectedWage: 800, contractorId: 'c1', status: 'pending' },
  { id: 'lr2', workerName: 'Kishan Verma', skill: 'Helper', experience: '1 year', phone: '+91 99999 22222', expectedWage: 450, contractorId: 'c1', status: 'pending' },
  { id: 'lr3', workerName: 'Anil Kumar', skill: 'Electrician', experience: '3 years', phone: '+91 99999 33333', expectedWage: 900, contractorId: 'c2', status: 'pending' },
];

// ─── Tasks ────────────────────────────────────────────────────────────────
export const MOCK_TASKS = [
  { id: 't1', title: '8th Floor Slab Shuttering', status: 'in_progress', priority: 'high', phase: 'structure', assignee: { name: 'Rajesh Kumar', avatar: null }, dueDate: '2026-04-10', createdAt: '2026-03-28', assignedContractorId: 'c1', assignedWorkerIds: ['w1', 'w5', 'w9'] },
  { id: 't2', title: 'Steel Bar Inspection - 8th Floor', status: 'todo', priority: 'critical', phase: 'structure', assignee: { name: 'Vikram Singh', avatar: null }, dueDate: '2026-04-08', createdAt: '2026-03-30', assignedContractorId: 'c1', assignedWorkerIds: [] },
  { id: 't3', title: 'Concrete Mix Testing Report', status: 'review', priority: 'medium', phase: 'structure', assignee: { name: 'Pradeep Verma', avatar: null }, dueDate: '2026-04-07', createdAt: '2026-03-25', assignedContractorId: 'c1', assignedWorkerIds: [] },
  { id: 't4', title: 'Water Pump Installation - Basement', status: 'done', priority: 'high', phase: 'structure', assignee: { name: 'Suresh Yadav', avatar: null }, dueDate: '2026-04-01', createdAt: '2026-03-15', assignedContractorId: 'c1', assignedWorkerIds: ['w3'] },
  { id: 't5', title: 'Column Alignment Check - 7th Floor', status: 'done', priority: 'critical', phase: 'structure', assignee: { name: 'Rajesh Kumar', avatar: null }, dueDate: '2026-03-28', createdAt: '2026-03-20', assignedContractorId: 'c1', assignedWorkerIds: ['w2'] },
  { id: 't6', title: 'Safety Net Installation - Perimeter', status: 'in_progress', priority: 'high', phase: 'structure', assignee: { name: 'Mohan Lal', avatar: null }, dueDate: '2026-04-06', createdAt: '2026-03-29', assignedContractorId: 'c1', assignedWorkerIds: ['w5', 'w9'] },
  { id: 't7', title: 'Procure TMT Bars for 9th Floor', status: 'todo', priority: 'high', phase: 'structure', assignee: { name: 'Amit Sharma', avatar: null }, dueDate: '2026-04-15', createdAt: '2026-04-01', assignedContractorId: 'c1', assignedWorkerIds: ['w7'] },
  { id: 't8', title: 'Electrical Conduit Layout - Floor 5-7', status: 'in_progress', priority: 'medium', phase: 'services', assignee: { name: 'Dinesh Gupta', avatar: null }, dueDate: '2026-04-12', createdAt: '2026-03-22', assignedContractorId: 'c2', assignedWorkerIds: ['w6'] },
  { id: 't9', title: 'Update Site Drainage Plan', status: 'review', priority: 'low', phase: 'planning', assignee: { name: 'Pradeep Verma', avatar: null }, dueDate: '2026-04-20', createdAt: '2026-04-02', assignedContractorId: null, assignedWorkerIds: ['w4'] },
  { id: 't10', title: 'Crane Maintenance Schedule', status: 'todo', priority: 'medium', phase: 'structure', assignee: { name: 'Vikram Singh', avatar: null }, dueDate: '2026-04-14', createdAt: '2026-04-03', assignedContractorId: null, assignedWorkerIds: ['w8'] },
  { id: 't11', title: 'Waterproofing - Basement Level 2', status: 'done', priority: 'high', phase: 'structure', assignee: { name: 'Mohan Lal', avatar: null }, dueDate: '2026-03-20', createdAt: '2026-03-10', assignedContractorId: 'c1', assignedWorkerIds: ['w5', 'w9'] },
  { id: 't12', title: 'Plumbing Rough-In - Floors 1-4', status: 'done', priority: 'medium', phase: 'services', assignee: { name: 'Dinesh Gupta', avatar: null }, dueDate: '2026-03-25', createdAt: '2026-03-05', assignedContractorId: 'c3', assignedWorkerIds: ['w3'] },
];

// ─── Workforce ────────────────────────────────────────────────────────────
export const MOCK_WORKERS = [
  { id: 'w1', name: 'Rajesh Kumar', role: 'Mason (Head)', phone: '+91 98765 43210', status: 'active', attendance: 96, performance: 92, tasksCompleted: 34, hoursLogged: 420, dailyWage: 900, contractorId: 'c1' },
  { id: 'w2', name: 'Vikram Singh', role: 'Structural Engineer', phone: '+91 87654 32109', status: 'active', attendance: 98, performance: 95, tasksCompleted: 28, hoursLogged: 380, dailyWage: 2500, contractorId: null },
  { id: 'w3', name: 'Suresh Yadav', role: 'Plumber', phone: '+91 76543 21098', status: 'active', attendance: 89, performance: 78, tasksCompleted: 18, hoursLogged: 310, dailyWage: 800, contractorId: 'c3' },
  { id: 'w4', name: 'Pradeep Verma', role: 'Site Supervisor', phone: '+91 65432 10987', status: 'active', attendance: 100, performance: 97, tasksCompleted: 42, hoursLogged: 456, dailyWage: 1800, contractorId: null },
  { id: 'w5', name: 'Mohan Lal', role: 'Carpenter', phone: '+91 54321 09876', status: 'active', attendance: 93, performance: 88, tasksCompleted: 22, hoursLogged: 348, dailyWage: 850, contractorId: 'c1' },
  { id: 'w6', name: 'Dinesh Gupta', role: 'Electrician', phone: '+91 43210 98765', status: 'active', attendance: 91, performance: 85, tasksCompleted: 15, hoursLogged: 298, dailyWage: 950, contractorId: 'c2' },
  { id: 'w7', name: 'Amit Sharma', role: 'Procurement Officer', phone: '+91 32109 87654', status: 'active', attendance: 95, performance: 90, tasksCompleted: 30, hoursLogged: 402, dailyWage: 1500, contractorId: null },
  { id: 'w8', name: 'Ravi Tiwari', role: 'Crane Operator', phone: '+91 21098 76543', status: 'on_leave', attendance: 82, performance: 80, tasksCompleted: 12, hoursLogged: 260, dailyWage: 1200, contractorId: null },
  { id: 'w9', name: 'Sanjay Mishra', role: 'Helper', phone: '+91 10987 65432', status: 'active', attendance: 88, performance: 75, tasksCompleted: 45, hoursLogged: 390, dailyWage: 500, contractorId: 'c1' },
  { id: 'w10', name: 'Arun Patel', role: 'Welder', phone: '+91 09876 54321', status: 'active', attendance: 90, performance: 82, tasksCompleted: 20, hoursLogged: 320, dailyWage: 1000, contractorId: 'c1' },
];

export const MOCK_ATTENDANCE = [
  { date: '2026-04-05', records: [
    { workerId: 'w1', status: 'present', checkIn: '07:00', checkOut: '18:00' },
    { workerId: 'w2', status: 'present', checkIn: '08:30', checkOut: '17:30' },
    { workerId: 'w3', status: 'late', checkIn: '09:15', checkOut: '17:00' },
    { workerId: 'w4', status: 'present', checkIn: '07:00', checkOut: '19:00' },
    { workerId: 'w5', status: 'present', checkIn: '07:30', checkOut: '17:30' },
    { workerId: 'w6', status: 'absent', checkIn: null, checkOut: null },
    { workerId: 'w7', status: 'present', checkIn: '09:00', checkOut: '18:00' },
    { workerId: 'w8', status: 'on_leave', checkIn: null, checkOut: null },
    { workerId: 'w9', status: 'present', checkIn: '06:45', checkOut: '17:00' },
    { workerId: 'w10', status: 'present', checkIn: '07:15', checkOut: '17:30' },
  ]},
  { date: '2026-04-04', records: [
    { workerId: 'w1', status: 'present', checkIn: '07:05', checkOut: '18:00' },
    { workerId: 'w2', status: 'present', checkIn: '08:30', checkOut: '17:30' },
    { workerId: 'w3', status: 'present', checkIn: '07:30', checkOut: '17:00' },
    { workerId: 'w4', status: 'present', checkIn: '07:00', checkOut: '18:30' },
    { workerId: 'w5', status: 'present', checkIn: '07:30', checkOut: '17:30' },
    { workerId: 'w6', status: 'present', checkIn: '08:00', checkOut: '17:00' },
    { workerId: 'w7', status: 'present', checkIn: '09:00', checkOut: '18:00' },
    { workerId: 'w8', status: 'on_leave', checkIn: null, checkOut: null },
    { workerId: 'w9', status: 'present', checkIn: '06:50', checkOut: '17:00' },
    { workerId: 'w10', status: 'late', checkIn: '09:30', checkOut: '17:30' },
  ]},
];

// ─── Materials ────────────────────────────────────────────────────────────
export const MOCK_MATERIALS = [
  { id: 'm1', name: 'TMT Steel Bars (Fe500D)', category: 'Steel', quantity: 120, unit: 'tonnes', unitCost: 52000, totalCost: 6240000, supplier: 'Tata Steel Ltd.', status: 'in_stock', minThreshold: 20, currentStock: 45 },
  { id: 'm2', name: 'OPC Cement (53 Grade)', category: 'Cement', quantity: 8000, unit: 'bags', unitCost: 380, totalCost: 3040000, supplier: 'UltraTech Cement', status: 'in_stock', minThreshold: 500, currentStock: 1200 },
  { id: 'm3', name: 'River Sand (Fine)', category: 'Aggregates', quantity: 500, unit: 'cu.m', unitCost: 3500, totalCost: 1750000, supplier: 'Local Supplier', status: 'low_stock', minThreshold: 50, currentStock: 35 },
  { id: 'm4', name: 'Crushed Stone (20mm)', category: 'Aggregates', quantity: 400, unit: 'cu.m', unitCost: 2800, totalCost: 1120000, supplier: 'Sharma Crushers', status: 'in_stock', minThreshold: 40, currentStock: 120 },
  { id: 'm5', name: 'AAC Blocks (600x200x200)', category: 'Blocks', quantity: 25000, unit: 'pcs', unitCost: 55, totalCost: 1375000, supplier: 'Magicrete Building', status: 'ordered', minThreshold: 2000, currentStock: 800 },
  { id: 'm6', name: 'Plywood (Shuttering Grade)', category: 'Formwork', quantity: 300, unit: 'sheets', unitCost: 1800, totalCost: 540000, supplier: 'Century Plyboards', status: 'in_stock', minThreshold: 30, currentStock: 85 },
  { id: 'm7', name: 'Binding Wire (18 Gauge)', category: 'Steel', quantity: 50, unit: 'kg rolls', unitCost: 75, totalCost: 3750, supplier: 'Local Supplier', status: 'low_stock', minThreshold: 10, currentStock: 8 },
  { id: 'm8', name: 'Waterproofing Chemical (Dr. Fixit)', category: 'Chemicals', quantity: 200, unit: 'litres', unitCost: 450, totalCost: 90000, supplier: 'Pidilite Industries', status: 'in_stock', minThreshold: 20, currentStock: 65 },
];

export const MOCK_SUPPLY_ORDERS = [
  { id: 'so1', material: 'AAC Blocks (600x200x200)', quantity: '5000 pcs', supplier: 'Magicrete Building', orderDate: '2026-04-01', expectedDelivery: '2026-04-08', status: 'shipped', amount: 275000 },
  { id: 'so2', material: 'TMT Steel Bars (Fe500D)', quantity: '30 tonnes', supplier: 'Tata Steel Ltd.', orderDate: '2026-04-03', expectedDelivery: '2026-04-12', status: 'confirmed', amount: 1560000 },
  { id: 'so3', material: 'River Sand (Fine)', quantity: '100 cu.m', supplier: 'Local Supplier', orderDate: '2026-04-04', expectedDelivery: '2026-04-06', status: 'delivered', amount: 350000 },
  { id: 'so4', material: 'Ready-Mix Concrete (M30)', quantity: '50 cu.m', supplier: 'ACC RMX', orderDate: '2026-04-05', expectedDelivery: '2026-04-05', status: 'in_transit', amount: 225000 },
];

// ─── Finance ──────────────────────────────────────────────────────────────
export const MOCK_FINANCE = {
  totalBudget: 85000000,
  spent: 32500000,
  remaining: 52500000,
  projected: 88000000,
  categories: [
    { name: 'Materials', amount: 14200000, percent: 43.7, color: '#f97316' },
    { name: 'Labour', amount: 9800000, percent: 30.2, color: '#3b82f6' },
    { name: 'Equipment', amount: 3400000, percent: 10.5, color: '#22c55e' },
    { name: 'Overheads', amount: 2600000, percent: 8.0, color: '#eab308' },
    { name: 'Permits & Legal', amount: 1500000, percent: 4.6, color: '#8b5cf6' },
    { name: 'Miscellaneous', amount: 1000000, percent: 3.0, color: '#6b7280' },
  ],
};

export const MOCK_PAYMENTS = [
  { id: 'p1', date: '2026-04-04', recipient: 'Tata Steel Ltd.', category: 'Materials', amount: 1560000, status: 'completed', method: 'Bank Transfer', invoice: 'INV-2026-0042' },
  { id: 'p2', date: '2026-04-03', recipient: 'Worker Payroll (Weekly)', category: 'Labour', amount: 385000, status: 'completed', method: 'UPI Bulk', invoice: 'PAY-W14-2026' },
  { id: 'p3', date: '2026-04-02', recipient: 'ABC Crane Rentals', category: 'Equipment', amount: 180000, status: 'completed', method: 'Cheque', invoice: 'INV-CR-0089' },
  { id: 'p4', date: '2026-04-01', recipient: 'UltraTech Cement', category: 'Materials', amount: 456000, status: 'completed', method: 'Bank Transfer', invoice: 'INV-2026-0038' },
  { id: 'p5', date: '2026-03-30', recipient: 'Municipal Corporation', category: 'Permits & Legal', amount: 250000, status: 'completed', method: 'DD', invoice: 'GOV-MC-6721' },
  { id: 'p6', date: '2026-04-08', recipient: 'Magicrete Building', category: 'Materials', amount: 275000, status: 'pending', method: 'Bank Transfer', invoice: 'INV-2026-0045' },
  { id: 'p7', date: '2026-04-10', recipient: 'Worker Payroll (Weekly)', category: 'Labour', amount: 392000, status: 'scheduled', method: 'UPI Bulk', invoice: 'PAY-W15-2026' },
  { id: 'p8', date: '2026-03-28', recipient: 'Insurance Premium (Q2)', category: 'Overheads', amount: 120000, status: 'completed', method: 'Bank Transfer', invoice: 'INS-Q2-2026' },
];

// ─── Issues ───────────────────────────────────────────────────────────────
export const MOCK_ISSUES = [
  { id: 'i1', title: 'Concrete Curing Time Not Maintained on 6th Floor', severity: 'critical', status: 'open', reporter: 'Vikram Singh', reportedAt: '2026-04-04', phase: 'structure', description: 'Formwork was removed before the 28-day curing period. Strength test pending. Could compromise structural integrity.', resolution: '' },
  { id: 'i2', title: 'Safety Harness Shortage for Workers Above 5th Floor', severity: 'high', status: 'in_progress', reporter: 'Pradeep Verma', reportedAt: '2026-04-03', phase: 'structure', description: 'Only 12 harnesses available for 20+ workers at height. Orders placed for 15 more.', resolution: 'Order placed with SafeGuard Equipments. Expected delivery: April 6.' },
  { id: 'i3', title: 'Rainwater Seepage in Basement Level 1', severity: 'medium', status: 'resolved', reporter: 'Suresh Yadav', reportedAt: '2026-03-28', phase: 'structure', description: 'Water accumulation found near south wall. Waterproofing membrane may have been damaged during excavation.', resolution: 'Applied additional Dr. Fixit waterproofing layer. Monitoring for 7 days.' },
  { id: 'i4', title: 'Delivery Delay: TMT Bars from Tata Steel', severity: 'high', status: 'open', reporter: 'Amit Sharma', reportedAt: '2026-04-05', phase: 'structure', description: 'Scheduled delivery of 30 tonnes delayed by 3 days due to logistics strike. Could impact 8th floor column work schedule.', resolution: '' },
  { id: 'i5', title: 'Noise Complaint from Adjacent Residential Colony', severity: 'low', status: 'resolved', reporter: 'Pradeep Verma', reportedAt: '2026-03-25', phase: 'structure', description: 'Residents complained about late-night concrete pouring noise.', resolution: 'Adjusted work hours. No pouring after 8 PM. Written notice sent to residents.' },
  { id: 'i6', title: 'Electrical Panel Short Circuit - Site Office', severity: 'medium', status: 'in_progress', reporter: 'Dinesh Gupta', reportedAt: '2026-04-04', phase: 'services', description: 'Temporary electrical panel near site office caught fire. No injuries. Panel needs replacement.', resolution: 'Temporary power restored via generator. New panel ordered.' },
];

// ─── Daily Updates ────────────────────────────────────────────────────────
export const MOCK_DAILY_UPDATES = [
  {
    id: 'du1',
    date: '2026-04-05',
    author: 'Rajesh Kumar',
    workerId: 'w1',
    contractorId: 'c1',
    role: 'Mason (Head)',
    status: 'pending_verification',
    weather: 'Sunny, 38°C',
    workersPresent: 8,
    summary: '8th floor shuttering work in progress. 70% of column formwork completed. Steel reinforcement binding ongoing for east wing.',
    activities: [
      'Column formwork — 8th floor east wing',
      'Steel binding — 8th floor columns',
      'Safety inspection — morning briefing'
    ],
    materialsUsed: [
      { name: 'TMT Steel (Fe500D)', quantity: '0.8 tonnes' },
      { name: 'Binding Wire', quantity: '15 kg' },
    ],
  },
  {
    id: 'du2',
    date: '2026-04-05',
    author: 'Mohan Lal',
    workerId: 'w5',
    contractorId: 'c1',
    role: 'Carpenter',
    status: 'verified',
    weather: 'Sunny, 38°C',
    summary: 'Prepared formwork for the remaining 3 columns on the North side. Material inventory check completed.',
    activities: [
      'North side column formwork prep',
      'Plywood cutting and reinforcement'
    ],
    materialsUsed: [
      { name: 'Plywood Sheets', quantity: '8 pcs' },
    ],
  },
  {
    id: 'du3',
    date: '2026-04-04',
    author: 'Dinesh Gupta',
    workerId: 'w6',
    contractorId: 'c2',
    role: 'Electrician',
    status: 'verified',
    weather: 'Clear, 36°C',
    summary: 'Conduit laying for 5th floor apartments 501-504 completed. Fire alarm cabling initiated.',
    activities: [
      'Apartment 501-504 conduit layout',
      'Fire alarm cabling'
    ],
    materialsUsed: [
      { name: 'PVC Conduits', quantity: '120m' },
    ],
  },
];

// ─── Documents ────────────────────────────────────────────────────────────
export const MOCK_DOCUMENTS = [
  { id: 'd1', name: 'Architectural Blueprint - Rev 5', category: 'Blueprints', type: 'pdf', size: '14.2 MB', uploadedBy: 'Vikram Singh', uploadedAt: '2026-03-15', status: 'approved' },
  { id: 'd2', name: 'RERA Registration Certificate', category: 'Legal', type: 'pdf', size: '2.1 MB', uploadedBy: 'Asrar Builder', uploadedAt: '2025-10-20', status: 'approved' },
  { id: 'd3', name: 'Soil Testing Report', category: 'Reports', type: 'pdf', size: '5.8 MB', uploadedBy: 'Vikram Singh', uploadedAt: '2025-09-12', status: 'approved' },
  { id: 'd4', name: 'Environmental Clearance', category: 'Legal', type: 'pdf', size: '3.4 MB', uploadedBy: 'Asrar Builder', uploadedAt: '2025-10-05', status: 'approved' },
  { id: 'd5', name: 'Structural Design Calculations', category: 'Engineering', type: 'pdf', size: '8.7 MB', uploadedBy: 'Vikram Singh', uploadedAt: '2025-11-18', status: 'approved' },
  { id: 'd6', name: '8th Floor Column Schedule', category: 'Engineering', type: 'xlsx', size: '1.2 MB', uploadedBy: 'Vikram Singh', uploadedAt: '2026-04-02', status: 'review' },
  { id: 'd7', name: 'Safety Compliance Report - March 2026', category: 'Safety', type: 'pdf', size: '4.5 MB', uploadedBy: 'Pradeep Verma', uploadedAt: '2026-04-01', status: 'approved' },
  { id: 'd8', name: 'Insurance Policy Document', category: 'Legal', type: 'pdf', size: '6.2 MB', uploadedBy: 'Asrar Builder', uploadedAt: '2025-09-25', status: 'approved' },
  { id: 'd9', name: 'Monthly Progress Photos - March', category: 'Media', type: 'zip', size: '128 MB', uploadedBy: 'Pradeep Verma', uploadedAt: '2026-04-01', status: 'approved' },
  { id: 'd10', name: 'Vendor Contract - Tata Steel', category: 'Contracts', type: 'pdf', size: '3.8 MB', uploadedBy: 'Amit Sharma', uploadedAt: '2025-11-10', status: 'approved' },
];

// ─── Activity Feed (for Overview) ──────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: 'a1', type: 'task', text: '8th Floor Slab Shuttering started', time: '2 hours ago', icon: 'task' },
  { id: 'a2', type: 'issue', text: 'New critical issue: Concrete curing time violation', time: '3 hours ago', icon: 'issue' },
  { id: 'a3', type: 'material', text: 'Supply order #SO4 delivered: Ready-Mix Concrete', time: '5 hours ago', icon: 'material' },
  { id: 'a4', type: 'payment', text: 'Payment ₹1,56,000 to Tata Steel completed', time: '1 day ago', icon: 'payment' },
  { id: 'a5', type: 'workforce', text: 'Ravi Tiwari marked on leave (crane operator)', time: '1 day ago', icon: 'workforce' },
  { id: 'a6', type: 'update', text: 'Daily report submitted by Pradeep Verma', time: '1 day ago', icon: 'update' },
  { id: 'a7', type: 'task', text: 'Column Alignment Check completed ✓', time: '2 days ago', icon: 'task' },
  { id: 'a8', type: 'document', text: '8th Floor Column Schedule uploaded for review', time: '3 days ago', icon: 'document' },
];

// ─── Role Composition Data ────────────────────────────────────────────────
export const WORKER_ROLES_DATA = [
  { role: 'Mason', count: 12, color: '#f97316' },
  { role: 'Carpenter', count: 6, color: '#3b82f6' },
  { role: 'Electrician', count: 4, color: '#eab308' },
  { role: 'Plumber', count: 3, color: '#22c55e' },
  { role: 'Welder', count: 3, color: '#8b5cf6' },
  { role: 'Helper', count: 14, color: '#6b7280' },
  { role: 'Operator', count: 2, color: '#ef4444' },
  { role: 'Supervisor', count: 2, color: '#06b6d4' },
  { role: 'Engineer', count: 2, color: '#ec4899' },
];
