import { Staff, Workstream, Deliverable, PTORequest, HoursLog } from '@/types';

// Current user for testing
export const currentUser: Staff = {
  id: '1',
  name: 'Sarah Mitchell',
  title: 'Partner',
  role: 'Lead Partner',
  email: 'sarah.mitchell@pwc.com',
  department: 'Advisory',
  workstreamIds: ['ws1', 'ws2', 'ws3', 'ws4', 'ws5'],
  userRole: 'Admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z'
};

// Workstreams
export const workstreams: Workstream[] = [
  {
    id: 'ws1',
    name: 'Risk & Compliance',
    description: 'Regulatory compliance and risk assessment',
    lead: 'James Wilson',
    color: '#D04A02',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ws2',
    name: 'Data Migration',
    description: 'Core banking data migration',
    lead: 'Emily Chen',
    color: '#2563EB',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ws3',
    name: 'Process Automation',
    description: 'Business process automation initiatives',
    lead: 'Michael Brown',
    color: '#059669',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ws4',
    name: 'Client Onboarding',
    description: 'Digital client onboarding transformation',
    lead: 'Lisa Park',
    color: '#7C3AED',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ws5',
    name: 'Testing & QA',
    description: 'Quality assurance and testing',
    lead: 'David Kim',
    color: '#DC2626',
    createdAt: '2024-01-01T00:00:00Z'
  },
];

// Team members
export const teamMembers: Staff[] = [
  currentUser,
  {
    id: '2',
    name: 'James Wilson',
    email: 'james.wilson@pwc.com',
    title: 'Director',
    role: 'Workstream Lead',
    department: 'Risk',
    supervisorId: '1',
    workstreamIds: ['ws1'],
    userRole: 'Manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily.chen@pwc.com',
    title: 'Director',
    role: 'Workstream Lead',
    department: 'Data',
    supervisorId: '1',
    workstreamIds: ['ws2'],
    userRole: 'Manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.brown@pwc.com',
    title: 'Senior Manager',
    role: 'Workstream Lead',
    department: 'Process',
    supervisorId: '1',
    workstreamIds: ['ws3'],
    userRole: 'Manager',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lisa.park@pwc.com',
    title: 'Senior Manager',
    role: 'Workstream Lead',
    department: 'Client Experience',
    supervisorId: '1',
    workstreamIds: ['ws4'],
    userRole: 'User',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david.kim@pwc.com',
    title: 'Manager',
    role: 'QA Lead',
    department: 'Quality',
    supervisorId: '1',
    workstreamIds: ['ws5'],
    userRole: 'User',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
];

// Deliverables
export const deliverables: Deliverable[] = [
  {
    id: 'del1',
    title: 'Compliance Framework Assessment',
    description: 'Review and update compliance framework documentation',
    workstreamId: 'ws1',
    ownerId: '2',
    status: 'In Progress',
    priority: 'High',
    risk: 'Low',
    startDate: '2024-01-15',
    dueDate: '2024-02-15',
    partnerReviewDate: '2024-02-10',
    clientReviewDate: '2024-02-13',
    progress: 65,
    dependencies: [],
    tags: ['compliance', 'documentation'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-21T00:00:00Z'
  },
  {
    id: 'del2',
    title: 'Data Migration Strategy',
    description: 'Develop comprehensive data migration plan',
    workstreamId: 'ws2',
    ownerId: '3',
    status: 'At Risk',
    priority: 'Critical',
    risk: 'High',
    startDate: '2024-01-10',
    dueDate: '2024-02-28',
    partnerReviewDate: '2024-02-20',
    progress: 45,
    dependencies: [],
    tags: ['data', 'migration', 'strategy'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'del3',
    title: 'RPA Bot Development',
    description: 'Build automation bots for repetitive processes',
    workstreamId: 'ws3',
    ownerId: '4',
    status: 'In Progress',
    priority: 'Medium',
    risk: 'Medium',
    startDate: '2024-01-20',
    dueDate: '2024-03-10',
    progress: 30,
    dependencies: [],
    tags: ['automation', 'development'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  },
  {
    id: 'del4',
    title: 'Digital Onboarding Portal',
    description: 'Create self-service client onboarding portal',
    workstreamId: 'ws4',
    ownerId: '5',
    status: 'Completed',
    priority: 'High',
    risk: 'Low',
    startDate: '2023-12-01',
    dueDate: '2024-02-05',
    clientReviewDate: '2024-02-03',
    completedDate: '2024-01-30',
    progress: 100,
    dependencies: [],
    tags: ['client', 'portal', 'onboarding'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  },
  {
    id: 'del5',
    title: 'UAT Test Plan',
    description: 'Create comprehensive user acceptance testing plan',
    workstreamId: 'ws5',
    ownerId: '6',
    status: 'Not Started',
    priority: 'Medium',
    risk: 'Low',
    startDate: '2024-02-01',
    dueDate: '2024-02-20',
    partnerReviewDate: '2024-02-15',
    progress: 0,
    dependencies: ['del1', 'del2', 'del3'],
    tags: ['testing', 'quality'],
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z'
  },
  {
    id: 'del6',
    title: 'API Integration Documentation',
    description: 'Document all API integrations and endpoints',
    workstreamId: 'ws2',
    ownerId: '3',
    status: 'In Progress',
    priority: 'High',
    risk: 'Medium',
    startDate: '2024-01-25',
    dueDate: '2024-03-01',
    progress: 20,
    dependencies: [],
    tags: ['documentation', 'api', 'integration'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
];

// PTO Requests
export const ptoRequests: PTORequest[] = [
  {
    id: 'pto1',
    staffId: '2',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    type: 'Vacation',
    status: 'Approved',
    notes: 'Family vacation',
    approvedBy: '1',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'pto2',
    staffId: '3',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    type: 'Personal',
    status: 'Pending',
    notes: 'Personal matters',
    createdAt: '2024-01-22T00:00:00Z'
  },
  {
    id: 'pto3',
    staffId: '4',
    startDate: '2024-02-20',
    endDate: '2024-02-23',
    type: 'Vacation',
    status: 'Approved',
    approvedBy: '1',
    createdAt: '2024-01-23T00:00:00Z'
  },
];

// Hours logs
export const hoursLogs: HoursLog[] = [
  {
    id: 'hr1',
    staffId: '2',
    deliverableId: 'del1',
    date: '2024-01-21',
    hours: 8,
    description: 'Framework review and updates',
    createdAt: '2024-01-21T00:00:00Z'
  },
  {
    id: 'hr2',
    staffId: '3',
    deliverableId: 'del2',
    date: '2024-01-21',
    hours: 6,
    description: 'Migration strategy planning',
    createdAt: '2024-01-21T00:00:00Z'
  },
  {
    id: 'hr3',
    staffId: '4',
    deliverableId: 'del3',
    date: '2024-01-21',
    hours: 7,
    description: 'RPA bot development',
    createdAt: '2024-01-21T00:00:00Z'
  },
];
