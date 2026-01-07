// App Configuration Constants
export const APP_CONFIG = {
  name: "Cier Check",
  version: "1.0.0",
  description: "Your Support Can Save Lives Through Early Cancer Detection",
  author: "Cier Check",
  logo: "/images/logo.png",
  supportEmail: "support@ciercheck.com",
  companyUrl: "https://ciercheck.com",
};

// Global Color Configuration - Dynamic Theme System
export const COLOR_CONFIG = {
  // Primary color (required) - Main brand color
  primary: {
    name: "Pink",
    hex: "#E10D80",
    rgb: "225, 13, 128",
    enabled: true, // Set to false to disable secondary color
  },
  // Secondary color (optional) - Accent color
  secondary: {
    name: "Orange",
    hex: "#DC6C35",
    rgb: "220, 108, 53",
    enabled: true,
  },
};

// Theme Options Configuration
export const THEME_OPTIONS = {
  enableThemeToggle: true, // Set to false to disable theme switching
  defaultTheme: "light", // 'light' or 'dark'
  forceTheme: null, // Set to 'light' or 'dark' to force a single theme (disables toggle)
  enableSecondaryColor: COLOR_CONFIG.secondary.enabled,
  // Theme persistence
  persistTheme: true, // Save theme preference to localStorage
  respectSystemTheme: true, // Respect system dark/light mode preference
};

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || "https://api.ciercheck.com/api/v1",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  formDataHeaders: {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },
  // Stripe Configuration (for revenue tracking)
  stripe: {
    enabled: true, // Set to false to disable Stripe features
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
    webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || "",
  },
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxVisiblePages: 5,
};

// Date Format Configuration
export const DATE_CONFIG = {
  format: "MM/dd/yyyy",
  timeFormat: "HH:mm:ss",
  dateTimeFormat: "MM/dd/yyyy HH:mm:ss",
  timezone: "UTC",
};

// Navigation Menu Items
export const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/",
    children: [],
  },
  {
    id: "users",
    label: "Users",
    icon: "Users",
    path: "/users",
    children: [],
  },
  {
    id: "shop",
    label: "Shop",
    icon: "Package",
    children: [
      {
        label: "Products",
        path: "/products",
      },
      {
        label: "Orders",
        path: "/orders",
      },
    ],
  },
  {
    id: "consultations",
    label: "Consultations",
    icon: "Stethoscope",
    path: "/consultations",
    children: [],
  },
  {
    id: "videos",
    label: "Videos",
    icon: "Film",
    path: "/videos",
    children: [],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "Bell",
    path: "/notifications",
    children: [],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    path: "/settings",
    children: [
      {
        id: "change-password",
        label: "Change Password",
        path: "/settings/change-password",
      },
    ],
  },
];

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  MODERATOR: "moderator",
};

// User Status Options
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
};

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ALL_USERS: "all_users",
  ROLE_BASED: "role_based",
  SPECIFIC_USERS: "specific_users",
  ACTIVE_USERS: "active_users",
  INACTIVE_USERS: "inactive_users",
};

// Transaction Statuses
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

// Support Ticket Statuses
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Support Ticket Priorities
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Report Types
export const REPORT_TYPES = {
  USER_REPORT: "user_report",
  CONTENT_REPORT: "content_report",
  SPAM_REPORT: "spam_report",
  ABUSE_REPORT: "abuse_report",
  OTHER: "other",
};

// Report Statuses
export const REPORT_STATUS = {
  PENDING: "pending",
  INVESTIGATING: "investigating",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

// Chart Colors (using primary/secondary theme)
export const CHART_COLORS = {
  primary: COLOR_CONFIG.primary.hex,
  secondary: COLOR_CONFIG.secondary.hex,
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  gray: "#6b7280",
};

// Dashboard Metrics Configuration
export const DASHBOARD_METRICS = {
  refreshInterval: 30000, // 30 seconds
  chartAnimationDuration: 1000,
  realtimeUpdates: true,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/csv",
  ],
  maxFiles: 5,
};

// Email Configuration
export const EMAIL_CONFIG = {
  templates: {
    welcome: "welcome",
    passwordReset: "password_reset",
    notification: "notification",
    support: "support_reply",
  },
  providers: {
    smtp: "smtp",
    sendgrid: "sendgrid",
    mailgun: "mailgun",
  },
};

// Security Configuration
export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 2 * 60 * 1000, // 2 minutes
  otpLength: 6,
  otpExpiry: 10 * 60 * 1000, // 10 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableReports: true,
  enableNotifications: true,
  enableChat: true,
  enableFileUpload: true,
  enableExport: true,
  enableBulkActions: true,
  enableAdvancedFilters: true,
};

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjkyNDUzMjI1ZWFkZGNiYTdmYjY3ZDE5Iiwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NjM5ODgyNTgsImV4cCI6MTc3MTc2NDI1OH0.B7JFUo-YrK-oLQaYl1JLBg1iuDu7eAjRvGoK4GljKhg
