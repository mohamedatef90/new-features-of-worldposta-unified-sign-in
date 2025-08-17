

import type { User, UserGroup, Invoice, SupportTicket, LogEntry, SupportTicketProduct, InvoiceLineItem, StaffGroup, SmtpLogEntry, KnowledgeBaseArticle, KubernetesCluster, LoadBalancer, FirewallRule, StorageBucket, SecurityAlert, BackupJob, Mailbox, MailboxPlan, DistributionList, SharedContact, EmailMigrationProject, EmailMigrationAccount } from './types';

// Mock User Data
export const MOCK_USERS: { [email: string]: User & { passwordHash: string } } = {
  "customer@worldposta.com": { 
    id: "user123",
    fullName: "Demo Customer Alpha",
    email: "customer@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "DemoCustomerA",
    phoneNumber: "555-1234",
    avatarUrl: "https://picsum.photos/seed/customer123/100/100",
    passwordHash: "hashedpassword123", 
    role: "customer",
    status: 'active',
    creationDate: '2023-05-10T14:48:00Z',
    country: 'US',
    isTrial: false
  },
   "customer2@worldposta.com": {
    id: "user777",
    fullName: "Beta User (Team Alpha)",
    email: "customer2@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "BetaUser",
    avatarUrl: "https://picsum.photos/seed/customer777/100/100",
    passwordHash: "hashedpassword777",
    role: "customer",
    status: 'active',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaAdmins",
    creationDate: '2023-06-15T09:20:00Z',
    country: 'US',
    isTrial: false,
  },
  "customer3@worldposta.com": {
    id: "user888",
    fullName: "Gamma Client (Team Alpha)",
    email: "customer3@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "GammaClient",
    avatarUrl: "https://picsum.photos/seed/customer888/100/100",
    passwordHash: "hashedpassword888",
    role: "customer",
    status: 'suspended',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaViewers",
    creationDate: '2023-07-01T11:00:00Z',
    country: 'US',
    isTrial: false,
  },
   "customer.new1@example.com": {
    id: "user-new-1",
    fullName: "Charlie Brown",
    email: "customer.new1@example.com",
    companyName: "Peanuts Comics",
    displayName: "CharlieB",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user1/100/100",
    creationDate: '2024-01-20T18:00:00Z',
    country: 'CA',
    isTrial: true,
  },
  "customer.new2@example.com": {
    id: "user-new-2",
    fullName: "Lucy van Pelt",
    email: "customer.new2@example.com",
    companyName: "Psychiatric Help Inc.",
    displayName: "LucyVP",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'blocked',
    avatarUrl: "https://picsum.photos/seed/new-user2/100/100",
    creationDate: '2024-02-11T12:30:00Z',
    country: 'GB',
    isTrial: false,
  },
  "customer.new3@example.com": {
    id: "user-new-3",
    fullName: "Linus van Pelt",
    email: "customer.new3@example.com",
    companyName: "Great Pumpkin Believers",
    displayName: "Linus",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user3/100/100",
    creationDate: '2024-03-05T08:45:00Z',
    country: 'AU',
    isTrial: true,
  },
  "admin@worldposta.com": {
    id: "admin456",
    fullName: "Admin User",
    email: "admin@worldposta.com",
    companyName: "WorldPosta Admin Dept.",
    displayName: "SysAdmin",
    avatarUrl: "https://picsum.photos/seed/admin456/100/100",
    passwordHash: "hashedpassword_admin",
    role: "admin",
    staffGroupId: "staffGroupAdmins",
    status: 'active',
    creationDate: '2023-01-15T10:00:00Z',
    mfaEnabled: true,
  },
  "reseller@worldposta.com": {
    id: "reseller789",
    fullName: "Reseller Partner",
    email: "reseller@worldposta.com",
    companyName: "Partner Solutions Ltd.",
    displayName: "ResellerPro",
    avatarUrl: "https://picsum.photos/seed/reseller789/100/100",
    passwordHash: "hashedpassword_reseller",
    role: "reseller",
    staffGroupId: "staffGroupSupport",
    status: 'suspended',
    creationDate: '2023-02-20T11:30:00Z',
    mfaEnabled: false,
  }
};

// Mock User Groups for customer@worldposta.com (user123)
export const MOCK_USER_GROUPS: UserGroup[] = [
  { 
    id: "groupAlphaAdmins", 
    name: "Team Administrators", 
    description: "Full access to manage team services and users.",
    permissions: ["view_billing", "manage_services", "admin_team_users", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupAlphaViewers",
    name: "Service Viewers",
    description: "Can view services and logs, but cannot make changes.",
    permissions: ["view_services", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupBillingManagers",
    name: "Billing Managers",
    description: "Can view and manage billing aspects.",
    permissions: ["view_billing", "manage_billing"],
    teamManagerId: "user123"
  }
];

export const MOCK_PERMISSIONS: string[] = [
  'view_billing', 
  'manage_billing', 
  'view_services', 
  'manage_services', 
  'admin_team_users', 
  'view_action_logs'
];


export const MOCK_ADMIN_PERMISSIONS: string[] = [
    'manage_customers',
    'view_all_billing',
    'manage_all_billing',
    'manage_support_tickets',
    'manage_staff_members',
    'manage_staff_groups',
    'access_system_settings',
    'impersonate_users'
];

export const MOCK_ADMIN_ROLES = MOCK_ADMIN_PERMISSIONS.map(perm => ({
    id: perm,
    label: perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `Allows user to ${perm.replace(/_/g, ' ')}.`
}));


export const MOCK_STAFF_GROUPS: StaffGroup[] = [
    {
        id: "staffGroupAdmins",
        name: "Super Administrators",
        description: "Full access to all system features and settings.",
        permissions: MOCK_ADMIN_PERMISSIONS,
    },
    {
        id: "staffGroupSupport",
        name: "Support Team",
        description: "Can manage customer support tickets and view customer information.",
        permissions: ['manage_support_tickets', 'view_all_billing', 'manage_customers'],
    },
    {
        id: "staffGroupBilling",
        name: "Billing Department",
        description: "Manages all aspects of customer and system billing.",
        permissions: ['view_all_billing', 'manage_all_billing'],
    }
];

// Function to get user by ID, used by DashboardPage for "View As" mode
export const getMockUserById = (userId: string): User | undefined => {
  return Object.values(MOCK_USERS).find(u => u.id === userId);
};
// Function to get all customers, used by UserManagementPage and ResellerCustomersPage
export const getAllMockCustomers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'customer');
};
// Function to get all internal users (admins/resellers)
export const getAllMockInternalUsers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'admin' || u.role === 'reseller');
};
// Function to get users for a specific team manager
export const getUsersForTeam = (teamManagerId: string): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.teamManagerId === teamManagerId);
};
// Function to get groups for a specific team manager
export const getGroupsForTeam = (teamManagerId: string): UserGroup[] => {
  return MOCK_USER_GROUPS.filter(g => g.teamManagerId === teamManagerId);
};

export const getAllMockStaffGroups = (): StaffGroup[] => {
  return MOCK_STAFF_GROUPS;
};


// --- MOCK DATA FOR PAGES ---
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
const inTwoWeeks = new Date(); inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);


export const mockInvoices: Invoice[] = [
    { 
        id: 'INV-2024-004', 
        date: '2024-08-01', 
        amount: 250.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Aug 1, 2024 to Sep 1, 2024',
        nextBillingDate: 'Sep 1, 2024',
        subscriptionId: 'sub-cloud-cluster-xyz',
        lineItems: [
            { description: 'CloudEdge - Web Server Cluster', units: 1, amount: 238.10 },
            { description: 'Posta Standard Plan (5 users)', units: 1, amount: 50.00 },
        ],
        subTotal: 288.10,
        tax: { label: 'Tax (8.25%)', amount: 23.77 },
        payments: -61.87, // partial payment? just for example
        amountDue: 250.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: inTwoWeeks.toISOString().split('T')[0],
        packageName: 'Posta Standard Plan',
        type: 'Renewal'
    },
     { 
        id: 'INV-2024-005', 
        date: new Date().toISOString().split('T')[0], 
        amount: 38.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-1',
        customerName: 'Charlie Brown',
        customerAddress: ['123 Peanuts Lane', 'Cartoonville, CA 90210', 'Canada'],
        customerEmail: 'customer.new1@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-biz-456',
        lineItems: [{ description: 'Posta Business Plan (10 users)', units: 1, amount: 38.00 }],
        subTotal: 38.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 38.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: nextWeek.toISOString().split('T')[0],
        packageName: 'Posta Business Plan',
        type: 'New Subscription'
    },
    { 
        id: 'INV-2024-006', 
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        amount: 55.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-3',
        customerName: 'Linus van Pelt',
        customerAddress: ['456 Security Blanket Ave', 'Pumpkin Patch, AU 2000', 'Australia'],
        customerEmail: 'customer.new3@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-pro-789',
        lineItems: [{ description: 'Posta Pro Plan (10 users)', units: 1, amount: 55.00 }],
        subTotal: 55.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 55.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: lastWeek.toISOString().split('T')[0], // Overdue
        packageName: 'Posta Pro Plan',
        type: 'Upgrade'
    },
    { 
        id: 'INV-2024-007', 
        date: new Date().toISOString().split('T')[0], 
        amount: 18.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-2', // Blocked customer
        customerName: 'Lucy van Pelt',
        customerAddress: ['789 Psychiatric Booth St', 'Doctor In, GB SW1A 0AA', 'United Kingdom'],
        customerEmail: 'customer.new2@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-light-101',
        lineItems: [{ description: 'Posta Light Plan (10 users)', units: 1, amount: 18.00 }],
        subTotal: 18.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 18.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: tomorrow.toISOString().split('T')[0],
        packageName: 'Posta Light Plan',
        type: 'Renewal'
    },
    { 
        id: 'INV-2024-003', 
        date: '2024-07-01', 
        amount: 150.00, 
        status: 'Paid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Jul 1, 2024 to Aug 1, 2024',
        nextBillingDate: 'Aug 1, 2024',
        subscriptionId: 'sub-posta-std-abc',
        lineItems: [
            { description: 'Posta Standard Plan (10 users)', units: 1, amount: 100.00 },
            { description: 'Advanced Email Archiving', units: 1, amount: 42.86 },
        ],
        subTotal: 142.86,
        tax: { label: 'Tax (5%)', amount: 7.14 },
        payments: -150.00,
        amountDue: 0.00,
        paymentDetails: '$150.00 was paid on Jul 3, 2024 by Visa card ending 4242.'
    },
];


export const mockSupportTickets: SupportTicket[] = [
    {
        id: 'TKT-58291',
        subject: 'Cannot access my VM',
        product: 'CloudEdge',
        status: 'In Progress',
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        description: 'I am unable to SSH into my production web server (prod-web-01). The connection times out. I have confirmed my firewall rules allow port 22 from my IP. Please investigate.',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        priority: 'High',
        department: 'Technical Support',
        requestType: 'Issue',
        comments: [
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), content: 'This is urgent, my website is down.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), content: 'We are looking into the issue and will update you shortly.' }
        ]
    },
    {
        id: 'TKT-58275',
        subject: 'Invoice Discrepancy',
        product: 'Subscriptions',
        status: 'Resolved',
        lastUpdate: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: 'My last invoice (INV-2024-003) seems to have an incorrect charge. Can you please review it?',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        priority: 'Normal',
        department: 'Billing Department',
        requestType: 'Inquiry'
    }
];

export const MOCK_KB_ARTICLES: KnowledgeBaseArticle[] = [
    { id: 'kb1', category: 'Billing', question: 'How do I update my payment method?', answer: 'You can update your payment method from the Billing Settings page. Navigate to Settings > Billing and you will find an option to add or remove payment methods.', keywords: ['payment', 'credit card', 'billing', 'update'] },
    { id: 'kb2', category: 'CloudEdge', question: 'How can I reset the root password for my Linux VM?', answer: 'To reset the root password, you will need to boot into single-user mode. Please follow the specific instructions for your distribution (e.g., Ubuntu, CentOS) which can be found in our detailed documentation.', keywords: ['ssh', 'password', 'root', 'reset', 'vm'] },
    { id: 'kb3', category: 'Posta Email', question: 'How do I set up my email on Outlook?', answer: 'Please use the following server settings: IMAP server: mail.worldposta.com, SMTP server: smtp.worldposta.com. Use your full email address as the username and your password. Detailed guides are available in our support section.', keywords: ['outlook', 'email', 'configuration', 'setup', 'posta'] },
    { id: 'kb4', category: 'General', question: 'How do I enable Multi-Factor Authentication (MFA)?', answer: 'Navigate to Settings > Security. From there, you can enable MFA and choose your preferred method (Authenticator App or Email). Follow the on-screen instructions to complete the setup.', keywords: ['mfa', 'security', '2fa', 'authentication'] }
];

export const mockSmtpLogs: SmtpLogEntry[] = [
    { id: 'smtp1', timestamp: new Date().toISOString(), from: 'user@external.com', to: 'sales@alpha.inc', subject: 'Inquiry about your services', action: 'PASS', status: 'Passed', details: 'Message-ID: <123@external.com>' },
    { id: 'smtp2', timestamp: new Date(Date.now() - 3600000).toISOString(), from: 'spam@spamdomain.com', to: 'info@alpha.inc', subject: '!!! You WON a PRIZE !!!', action: 'REJECT', status: 'Spam (Confirmed)', details: 'High spam score (15.2)' },
    { id: 'smtp3', timestamp: new Date(Date.now() - 7200000).toISOString(), from: 'marketing@legit.com', to: 'contact@alpha.inc', subject: 'Our latest newsletter', action: 'DELIVER', status: 'Passed', details: 'Message-ID: <abc@legit.com>' },
    { id: 'smtp4', timestamp: new Date(Date.now() - 10800000).toISOString(), from: 'hr@alpha.inc', to: 'archive@alpha.inc', subject: 'FW: Employee Onboarding', action: 'ARCHIVE', status: 'Archived', details: 'Archived by rule: "Internal HR Comms"' },
];

export const mockPostaPackages = [
    { id: 'posta-light', name: 'Posta Light Plan' },
    { id: 'posta-business', name: 'Posta Business Plan' },
    { id: 'posta-pro', name: 'Posta Pro Plan' },
    { id: 'posta-enterprise', name: 'Posta Enterprise Plan' },
];

export const mockMailboxPlans: MailboxPlan[] = ['Posta Light', 'Posta Business', 'Posta Pro', 'Posta Enterprise'];
export const mockMailboxDomains: string[] = ['alpha.inc', 'worldposta.com', 'betacorp.io'];

export const mockMailboxes: Mailbox[] = [
    { id: 'mbx1', displayName: 'Demo Customer Alpha', login: 'customer@worldposta.com', mailboxPlan: 'Posta Pro', creationDate: '2023-05-10T14:48:00Z', driveQuota: { usedGB: 15.2, totalGB: 200 }, level: 'Admin', status: 'active', mfaEnabled: true },
    { id: 'mbx2', displayName: 'Beta User', login: 'customer2@worldposta.com', mailboxPlan: 'Posta Business', creationDate: '2023-06-15T09:20:00Z', driveQuota: { usedGB: 5.8, totalGB: 100 }, level: 'User', status: 'active' },
    { id: 'mbx3', displayName: 'Sales Department', login: 'sales@alpha.inc', mailboxPlan: 'Posta Business', creationDate: '2023-06-01T10:00:00Z', driveQuota: { usedGB: 45.1, totalGB: 100 }, level: 'User', status: 'active' },
    { id: 'mbx4', displayName: 'John Smith (Former)', login: 'jsmith@alpha.inc', mailboxPlan: 'Posta Light', creationDate: '2023-01-20T11:00:00Z', driveQuota: { usedGB: 9.5, totalGB: 10 }, level: 'User', status: 'suspended' },
    { id: 'mbx5', displayName: 'Gamma Client', login: 'customer3@worldposta.com', mailboxPlan: 'Posta Business', creationDate: '2023-07-01T11:00:00Z', driveQuota: { usedGB: 1.2, totalGB: 100 }, level: 'User', status: 'suspended', mfaEnabled: true },
    { id: 'mbx6', displayName: 'Marketing Team', login: 'marketing@alpha.inc', mailboxPlan: 'Posta Pro', creationDate: '2023-08-01T12:00:00Z', driveQuota: { usedGB: 189.7, totalGB: 200 }, level: 'User', status: 'active' },
];

export const mockDistributionLists: DistributionList[] = [
    { id: 'dl1', displayName: 'All Employees', primaryEmail: 'all.employees@alpha.inc', memberCount: 150, creationDate: '2023-01-10T09:00:00Z', managerEmail: 'admin@alpha.inc' },
    { id: 'dl2', displayName: 'Marketing Team', primaryEmail: 'marketing.team@alpha.inc', memberCount: 12, creationDate: '2023-02-05T11:30:00Z' },
    { id: 'dl3', displayName: 'Project Phoenix Members', primaryEmail: 'project.phoenix@alpha.inc', memberCount: 8, creationDate: '2024-03-20T15:00:00Z', managerEmail: 'project.manager@alpha.inc' },
    { id: 'dl4', displayName: 'Executive Board', primaryEmail: 'board@alpha.inc', memberCount: 5, creationDate: '2022-11-20T10:00:00Z' },
];

export const mockSharedContacts: SharedContact[] = [
    { id: 'sc1', displayName: 'Support Team', email: 'support@alpha.inc', creationDate: '2023-08-01T10:00:00Z' },
    { id: 'sc2', displayName: 'Sales Inquiries', email: 'sales@alpha.inc', creationDate: '2023-08-01T10:05:00Z' },
    { id: 'sc3', displayName: 'External Consultant', email: 'consultant@external.com', creationDate: '2024-01-15T14:00:00Z' },
    { id: 'sc4', displayName: 'Marketing Department', email: 'marketing@alpha.inc', creationDate: '2023-08-01T10:10:00Z' },
    { id: 'sc5', displayName: 'HR Department', email: 'hr@alpha.inc', creationDate: '2023-09-01T11:00:00Z' },
    { id: 'sc6', displayName: 'Legal Counsel', email: 'legal@external-firm.com', creationDate: '2024-02-01T09:30:00Z' }
];

export const mockEmailMigrationProjects: EmailMigrationProject[] = [
    {
        id: 'proj_1',
        projectName: 'Marketing Team Migration',
        sourceProvider: 'google',
        sourceConnection: { useOAuth: true, username: 'marketing@oldsystem.com' },
        destinationProvider: 'microsoft',
        destinationConnection: { useOAuth: true, username: 'marketing@newsystem.com' },
        itemsToMigrate: ['emails', 'calendar'],
        mailboxesToMigrate: 5,
        status: 'completed',
        progress: 100,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        isIncrementalSyncEnabled: true,
        report: {
            transferredEmails: 25432,
            transferredContacts: 0,
            transferredCalendarEvents: 123,
            failedItems: [{ name: 'Q4 Strategy.pptx', type: 'Email', reason: 'File size exceeds limit.', retryable: true }]
        }
    },
    {
        id: 'proj_2',
        projectName: 'Executive Accounts',
        sourceProvider: 'imap',
        sourceConnection: { useOAuth: false, username: 'ceo@legacy.com', server: 'imap.legacy.com', port: 993, useSsl: true },
        destinationProvider: 'google',
        destinationConnection: { useOAuth: true, username: 'ceo@newsystem.com' },
        itemsToMigrate: ['emails', 'contacts', 'calendar'],
        mailboxesToMigrate: 2,
        status: 'in_progress',
        progress: 65,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        isIncrementalSyncEnabled: true,
    },
    {
        id: 'proj_3',
        projectName: 'Sales Department Sync',
        sourceProvider: 'microsoft',
        sourceConnection: { useOAuth: true, username: 'sales@oldcorp.com' },
        destinationProvider: 'microsoft',
        destinationConnection: { useOAuth: true, username: 'sales@newcorp.com' },
        itemsToMigrate: ['emails'],
        mailboxesToMigrate: 15,
        status: 'error',
        progress: 20,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        isIncrementalSyncEnabled: false,
        report: {
            transferredEmails: 3050,
            transferredContacts: 0,
            transferredCalendarEvents: 0,
            failedItems: [
                { name: 'Invalid Credentials', type: 'Folder', reason: 'Source account authentication failed.', retryable: false },
                { name: 'Connection Timeout', type: 'Folder', reason: 'Could not maintain a stable connection to the source server.', retryable: true }
            ]
        }
    }
];

export const mockEmailMigrationAccounts: EmailMigrationAccount[] = [
  {
    id: 'acc-1',
    destination: 'zdvzdfbfg@sdfd.dds',
    source: 'zdvzdfbfg@sdfd.dds',
    status: 'Cancelled',
    note: 'Host1 failure: Error connecting to source server.',
    progress: 0,
    total: 15230,
    processed: 0,
    failed: 0,
    removed: 0,
  },
  {
    id: 'acc-2',
    destination: 'zdvzdfbfg@sdfd.dds',
    source: 'zdvzdfbfg@sdfd.dds',
    status: 'New',
    note: '',
    progress: 0,
    total: 21050,
    processed: 0,
    failed: 0,
    removed: 0,
  },
  {
    id: 'acc-3',
    destination: 'sdfgdf@ssw.com',
    source: 'sdfsfd@dflgjfd.ci',
    status: 'New',
    note: '',
    progress: 0,
    total: 8500,
    processed: 0,
    failed: 0,
    removed: 0,
  },
  {
    id: 'acc-4',
    destination: 'completed@example.com',
    source: 'source.completed@example.com',
    status: 'Completed',
    note: 'Migration finished successfully.',
    progress: 100,
    total: 12000,
    processed: 12000,
    failed: 0,
    removed: 0,
  },
  {
    id: 'acc-5',
    destination: 'inprogress@example.com',
    source: 'source.inprogress@example.com',
    status: 'In Progress',
    note: 'Migrating mailbox...',
    progress: 45,
    total: 30000,
    processed: 13500,
    failed: 2,
    removed: 0,
  },
];


// --- NEW MOCK DATA for PRODUCTS ---
export const mockKubernetesClusters: KubernetesCluster[] = [
  { id: 'k8s-prod-1', name: 'production-cluster', version: '1.28.3', status: 'Running', nodeCount: 5, region: 'US East (N. Virginia)', creationDate: '2024-07-15T10:00:00Z' },
  { id: 'k8s-dev-1', name: 'development-sandbox', version: '1.27.5', status: 'Running', nodeCount: 2, region: 'EU (Frankfurt)', creationDate: '2024-06-20T14:30:00Z' },
  { id: 'k8s-staging-1', name: 'staging-cluster', version: '1.28.3', status: 'Creating', nodeCount: 3, region: 'US West (Oregon)', creationDate: new Date().toISOString() },
  { id: 'k8s-legacy-1', name: 'legacy-app-support', version: '1.25.10', status: 'Stopped', nodeCount: 1, region: 'US East (N. Virginia)', creationDate: '2023-11-01T08:00:00Z' },
];

export const mockLoadBalancers: LoadBalancer[] = [
  { id: 'lb-1', name: 'main-web-app-lb', type: 'L7 Application', status: 'Active', ipAddress: '203.0.113.10' },
  { id: 'lb-2', name: 'internal-services-lb', type: 'L4 Network', status: 'Active', ipAddress: '10.0.5.25' },
  { id: 'lb-3', name: 'new-api-gateway-lb', type: 'L7 Application', status: 'Building', ipAddress: 'Pending...' },
];

export const mockFirewallRules: FirewallRule[] = [
  { id: 'fw-1', policyName: 'allow-https', direction: 'Inbound', protocol: 'TCP', portRange: '443', source: '0.0.0.0/0', action: 'Allow' },
  { id: 'fw-2', policyName: 'allow-ssh-admin', direction: 'Inbound', protocol: 'TCP', portRange: '22', source: '73.22.19.101/32', action: 'Allow' },
  { id: 'fw-3', policyName: 'deny-all-outbound', direction: 'Outbound', protocol: 'TCP', portRange: '*', source: '*', action: 'Deny' },
  { id: 'fw-4', policyName: 'allow-icmp', direction: 'Inbound', protocol: 'ICMP', portRange: 'any', source: '0.0.0.0/0', action: 'Allow' },
];

export const mockStorageBuckets: StorageBucket[] = [
  { id: 'sb-1', name: 'app-assets-prod', region: 'US East (N. Virginia)', sizeGB: 1250, creationDate: '2024-01-10T11:00:00Z' },
  { id: 'sb-2', name: 'user-uploads-staging', region: 'EU (Frankfurt)', sizeGB: 320, creationDate: '2024-05-02T18:45:00Z' },
  { id: 'sb-3', name: 'database-backups', region: 'US West (Oregon)', sizeGB: 5800, creationDate: '2023-09-15T05:00:00Z' },
];

export const mockSecurityAlerts: SecurityAlert[] = [
  { id: 'sa-1', severity: 'Critical', description: 'Potential SQL Injection attempt detected on prod-db-01.', resource: 'prod-db-01', timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: 'sa-2', severity: 'High', description: 'Unusual login pattern detected for user admin@alpha.inc.', resource: 'Authentication Service', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'sa-3', severity: 'Medium', description: 'Port scan detected from IP 198.51.100.45.', resource: 'main-web-app-lb', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: 'sa-4', severity: 'Low', description: 'Legacy TLS version 1.1 used to connect to internal-api.', resource: 'internal-api', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
];

export const mockBackupJobs: BackupJob[] = [
  { id: 'bj-1', name: 'daily-prod-db-backup', resource: 'prod-db-01', schedule: 'Daily at 2:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
  { id: 'bj-2', name: 'weekly-web-server-snapshot', resource: 'prod-web-cluster', schedule: 'Weekly on Sunday at 4:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'bj-3', name: 'archive-storage-bucket-sync', resource: 'app-assets-prod', schedule: 'Monthly on the 1st', lastRunStatus: 'In Progress', lastRunDate: new Date().toISOString() },
  { id: 'bj-4', name: 'dev-vm-backup', resource: 'dev-sandbox-vm', schedule: 'Daily at 5:00 AM UTC', lastRunStatus: 'Failed', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
];