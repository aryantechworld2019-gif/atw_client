// User Types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CLIENT_OWNER = 'client_owner',
  CLIENT_USER = 'client_user',
  DEVELOPER = 'developer',
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

// Client Types
export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface ClientContact {
  name: string
  email: string
  phone: string
  designation: string
}

export interface ClientAddress {
  street: string
  city: string
  state: string
  country: string
  pincode: string
}

export interface Client {
  id: string
  user_id: string
  company_name: string
  industry: string
  website?: string
  contact_info: ClientContact
  address: ClientAddress
  status: ClientStatus
  account_manager_id?: string
  billing_email: string
  tax_id?: string
  created_at: string
  updated_at: string
}

// Developer Types
export enum DeveloperStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  ON_LEAVE = 'on_leave',
}

export interface Developer {
  id: string
  user_id: string
  skills: string[]
  hourly_rate: number
  status: DeveloperStatus
  availability_hours: number
  total_hours_worked: number
  projects_completed: number
  average_rating: number
  created_at: string
  updated_at: string
}

// Query Types
export enum QueryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum QueryStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  FIXED = 'fixed',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum QueryType {
  BUG = 'bug',
  FEATURE_REQUEST = 'feature_request',
  SUPPORT = 'support',
  ENHANCEMENT = 'enhancement',
}

export interface Query {
  id: string
  client_id: string
  title: string
  description: string
  type: QueryType
  priority: QueryPriority
  status: QueryStatus
  assigned_developer_id?: string
  estimated_hours?: number
  actual_hours?: number
  created_by: string
  created_at: string
  updated_at: string
  resolution?: string
  closed_at?: string
}

// Maintenance Package Types
export enum PackageStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface MaintenancePackage {
  id: string
  client_id: string
  package_name: string
  description: string
  included_hours: number
  used_hours: number
  remaining_hours: number
  monthly_fee: number
  start_date: string
  end_date: string
  status: PackageStatus
  auto_renew: boolean
  created_at: string
  updated_at: string
}

// Time Log Types
export interface TimeLog {
  id: string
  query_id: string
  developer_id: string
  hours_logged: number
  description: string
  date: string
  is_billable: boolean
  created_at: string
  updated_at: string
}

// Payment Types
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  UPI = 'upi',
  CASH = 'cash',
  CHEQUE = 'cheque',
}

export interface Payment {
  id: string
  client_id: string
  invoice_id?: string
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  transaction_id?: string
  status: PaymentStatus
  notes?: string
  created_at: string
  updated_at: string
}

// Invoice Types
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  issue_date: string
  due_date: string
  line_items: InvoiceLineItem[]
  subtotal: number
  tax_percentage: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  amount_due: number
  status: InvoiceStatus
  notes?: string
  created_at: string
  updated_at: string
}

// Notification Types
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

// Audit Log Types
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export interface AuditLog {
  id: string
  user_id: string
  action: AuditAction
  resource_type: string
  resource_id: string
  changes?: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

// Comment Types
export interface Comment {
  id: string
  query_id: string
  user_id: string
  content: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

// Dashboard Stats Types
export interface DashboardStats {
  total_queries: number
  active_clients: number
  maintenance_packages: number
  pending_invoices: number
  total_revenue: number
  revenue_this_month: number
}
