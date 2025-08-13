


export interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: 'customer' | 'admin' | 'reseller'; // Added role
  status?: 'active' | 'suspended' | 'blocked';
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string; // URL to placeholder image
  teamManagerId?: string; // ID of the primary customer managing this user
  assignedGroupId?: string; // ID of the UserGroup this user belongs to
  staffGroupId?: string; // ID of the StaffGroup this user belongs to
  creationDate?: string;
  mfaEnabled?: boolean;
  country?: string;
  isTrial?: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission key strings
  teamManagerId: string; // ID of the customer who owns/manages this group
}

export interface StaffGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string, redirectPath?: string) => Promise<void>;
  signup: (details: Omit<User, 'id' | 'avatarUrl' | 'displayName' | 'phoneNumber' | 'role' | 'teamManagerId' | 'assignedGroupId' | 'status' | 'creationDate' | 'mfaEnabled' | 'country' | 'isTrial'> & {password: string}) => Promise<void>;
  logout: () => void;
  updateProfile: (details: Partial<Pick<User, 'fullName' | 'companyName' | 'displayName' | 'phoneNumber' | 'avatarUrl'>>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
}

export interface NavItem {
  name: string;
  path: string;
  iconName?: string; // For Font Awesome class
  iconUrl?: string;  // For image URL
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SECURITY = 'security', 
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

export interface ProductPortal {
  id: string;
  name: string;
  description: string;
  iconBgColor: string;
  url: string; // Could be external or internal path
}

// Data for the Floating App Launcher and Dashboard Cards
export interface ApplicationCardData {
  id:string;
  name: string;
  description: string;
  iconName: string;
  launchUrl: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  performedBy: string;
  status: 'Success' | 'Failed' | 'Pending User Action' | 'Pending System Action' | 'Information' | 'Warning';
}

export type SupportTicketProduct = 'CloudEdge' | 'Posta Email' | 'Subscriptions' | 'General Inquiry';

export interface TicketAttachment {
    name: string;
    type: string;
    size: number;
    dataUrl: string; // base64
}

export interface SupportTicketComment {
    author: string;
    timestamp: string;
    content: string;
    attachments?: TicketAttachment[];
}

export type SupportTicketRequestType = 'Inquiry' | 'Issue' | 'Task' | 'Feature Request';
export type SupportTicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type SupportTicketDepartment = 'Technical Support' | 'Billing Department' | 'Sales Inquiry';

export interface SupportTicket {
    id: string;
    subject: string;
    product: SupportTicketProduct;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    lastUpdate: string;
    description: string;
    attachments?: TicketAttachment[];
    customerId?: string;
    customerName?: string;
    comments?: SupportTicketComment[];
    internalComments?: SupportTicketComment[];
    priority: SupportTicketPriority;
    department: SupportTicketDepartment;
    requestType: SupportTicketRequestType;
}

export interface KnowledgeBaseArticle {
  id: string;
  category: 'Billing' | 'CloudEdge' | 'Posta Email' | 'General';
  question: string;
  answer: string;
  keywords: string[];
}

export interface StepperStep {
  name: string;
}

export type EmailPlanDuration = 'monthly' | 'yearly';

export interface EmailPlan {
  id: string;
  name: string;
  basePriceMonthly: number;
  features: string[];
  description: string;
  isRecommended?: boolean;
}

export interface EmailCartItem {
  plan: EmailPlan;
  quantity: number;
  duration: EmailPlanDuration;
  advancedRulesEnabled: boolean;
}

export type CloudEdgeComponentType = 'instance' | 'vdc' | 'ready-plan';
export type MachineType = 'performance-01' | 'performance-02' | 'performance-03';
export type ProvisioningModel = 'regular' | 'spot';
export type SubscriptionTermUnit = 'hr' | 'week' | 'month' | 'year';

export interface CloudEdgeConfiguration {
    id: string;
    name: string;
    type: CloudEdgeComponentType;
    quantity: number;
    subscriptionTermValue: number;
    subscriptionTermUnit: SubscriptionTermUnit;
    deploymentRegion: string;
    
    // Instance specific
    instanceTemplateId?: string;
    machineType?: MachineType;
    osSoftware?: string;

    // VDC specific
    vdcCPU?: number;
    vdcRAM?: number;
    vdcFlashStorage?: number;

    // Ready Plan specific
    readyPlanId?: string;
    
    // Advanced/Optional
    provisioningModel?: ProvisioningModel;
    confidentialVM?: boolean;
    addGPUs?: boolean;
    gpuType?: string;
    gpuCount?: number;

    // Other resources
    staticPublicIPs?: number;
    objectStorageGB?: number;
    advancedBackupGB?: number;
    trendMicroEndpoints?: number;
    windowsServerLicenses?: number;
    linuxEnterpriseLicenses?: number;
    cortexXDREndpoints?: number;
    loadBalancerInstances?: number;
    
    // Add-ons
    advancedFirewall?: boolean;
    enhancedMonitoring?: boolean;

    // Calculated
    unitSubtotalMonthly: number;
}
export interface InstanceTemplate {
  id: string;
  name: string;
  cpu: number;
  ramGB: number;
  bootDiskGB: number;
  priceMonthly: number;
  description: string;
}
export interface GPUType {
  id: string;
  name: string;
  priceMonthly: number;
}
export interface InvoiceLineItem {
  description: string;
  units: number;
  amount: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  url: string; // for PDF download
  customerId: string;
  customerName: string;
  customerAddress: string[];
  customerEmail: string;
  billingPeriod: string;
  nextBillingDate: string;
  subscriptionId: string;
  lineItems: InvoiceLineItem[];
  subTotal: number;
  tax: {
    label: string;
    amount: number;
  };
  payments: number;
  amountDue: number;
  paymentDetails: string;
  dueDate?: string;
  packageName?: string;
  type?: 'New Subscription' | 'Renewal' | 'Upgrade';
}

export interface AddedResource {
    id: string; // Unique ID for the table row
    productId: 'posta' | 'cloudedge' | string;
    packageId: string;
    organizationId: string;
    domainIds: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  priceAnnuallyPerMonth: number;
  description: string;
  features: string[];
  isRecommended?: boolean;
}

export interface Feature {
  name:string;
  availability: { [planId: string]: boolean | string };
}

export interface FeatureCategory {
  name: string;
  features: Feature[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type SmtpLogAction = 'DELIVER' | 'QUARANTINE' | 'REJECT' | 'ARCHIVE' | 'PASS';
export type SmtpLogStatus = 'Passed' | 'Archived' | 'Rejected (Data)' | 'Rejected (Block)' | 'Spam (Confirmed)' | 'Spam (Scam)' | 'Rejected (Suspect)' | 'User Invalid';

export interface SmtpLogEntry {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  subject: string;
  action: SmtpLogAction;
  status: SmtpLogStatus;
  details: string; // e.g., Message-ID or reason for rejection
}

// Kubernetes
export interface KubernetesCluster {
  id: string;
  name: string;
  version: string;
  status: 'Running' | 'Stopped' | 'Creating' | 'Error';
  nodeCount: number;
  region: string;
  creationDate: string;
}

// Networking
export interface LoadBalancer {
  id: string;
  name: string;
  type: 'L4 Network' | 'L7 Application';
  status: 'Active' | 'Inactive' | 'Building';
  ipAddress: string;
}

export interface FirewallRule {
  id: string;
  policyName: string;
  direction: 'Inbound' | 'Outbound';
  protocol: 'TCP' | 'UDP' | 'ICMP';
  portRange: string;
  source: string;
  action: 'Allow' | 'Deny';
}

// Storage
export interface StorageBucket {
  id:string;
  name: string;
  region: string;
  sizeGB: number;
  creationDate: string;
}

// Monitoring & Security
export interface SecurityAlert {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  resource: string;
  timestamp: string;
}

// Backup & DR
export interface BackupJob {
  id: string;
  name: string;
  resource: string; // e.g., VM name or Volume ID
  schedule: string;
  lastRunStatus: 'Success' | 'Failed' | 'In Progress';
  lastRunDate: string;
}

export type MailboxPlan = 'Posta Light' | 'Posta Business' | 'Posta Pro' | 'Posta Enterprise';

export interface Mailbox {
  id: string;
  displayName: string;
  login: string;
  mailboxPlan: MailboxPlan;
  creationDate: string;
  driveQuota: { usedGB: number; totalGB: number };
  level: 'User' | 'Admin';
  status: 'active' | 'suspended';
  mfaEnabled?: boolean;
}

export interface DistributionList {
  id: string;
  displayName: string;
  primaryEmail: string;
  memberCount: number;
  creationDate: string;
  managerEmail?: string;
}

export interface SharedContact {
  id: string;
  displayName: string;
  email: string;
  creationDate: string;
}

// --- EMAIL MIGRATION ---
export type EmailProvider = 'google' | 'microsoft' | 'zoho' | 'other_imap';
export type MigrationItem = 'emails' | 'contacts' | 'calendar';
export type MigrationStatus = 'not_started' | 'analyzing' | 'ready' | 'in_progress' | 'error' | 'completed' | 'cancelled';

export interface ConnectionDetails {
  useOAuth: boolean;
  username?: string;
  password?: string;
  server?: string;
  port?: number;
  useSsl: boolean;
}

export interface FailedItem {
  name: string;
  type: 'Email' | 'Contact' | 'Calendar Event' | 'Folder';
  reason: string;
  retryable: boolean;
}

export interface EmailMigrationReport {
  transferredEmails: number;
  transferredContacts: number;
  transferredCalendarEvents: number;
  failedItems: FailedItem[];
}

export interface EmailMigrationProject {
  id: string;
  projectName: string;
  
  sourceProvider: EmailProvider;
  sourceConnection: Partial<ConnectionDetails>;
  
  destinationProvider: EmailProvider;
  destinationConnection: Partial<ConnectionDetails>;

  itemsToMigrate: MigrationItem[];
  mailboxesToMigrate: number;
  
  status: MigrationStatus;
  progress: number;
  report?: EmailMigrationReport;
  createdAt: string;

  isIncrementalSyncEnabled: boolean;
  migrationWindow?: 'all' | 'recent' | 'unread';
  scheduledAt?: string;
}