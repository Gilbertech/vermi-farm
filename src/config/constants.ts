// Application constants
export const APP_CONFIG = {
  name: 'Vermi-Farm MIS',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.vermi-farm.org/v1',
  mpesaShortcode: import.meta.env.VITE_MPESA_SHORTCODE || '4703932',
  enableDemoMode: import.meta.env.VITE_ENABLE_DEMO_MODE === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true'
};

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100
};

export const VALIDATION_RULES = {
  phone: {
    kenyan: /^(07|01)\d{8}$/,
    international: /^\+254[17]\d{8}$/
  },
  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true
  },
  amount: {
    min: 1,
    max: 10000000 // 10 million KES
  }
};

export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

export const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  admin_initiator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  chairperson: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  secretary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  treasurer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  member: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};

export const PORTFOLIO_TYPES = [
  { id: 'loan', label: 'Loan Portfolio', description: 'Loan disbursements and repayments' },
  { id: 'revenue', label: 'Revenue Portfolio', description: 'Interest income and service fees' },
  { id: 'investment', label: 'Investment Portfolio', description: 'Investment activities and returns' },
  { id: 'expense', label: 'Expense Portfolio', description: 'Operational expenses and costs' },
  { id: 'working', label: 'Working Account Portfolio', description: 'Daily operational funds' },
  { id: 'b2b', label: 'B2B Holding Portfolio', description: 'Business-to-business transactions' },
  { id: 'savings', label: 'Savings Portfolio', description: 'Member savings and deposits' }
];

export const TRANSACTION_TYPES = [
  { id: 'deposit', label: 'Deposit', color: 'green' },
  { id: 'withdrawal', label: 'Withdrawal', color: 'red' },
  { id: 'loan', label: 'Loan', color: 'blue' },
  { id: 'repayment', label: 'Repayment', color: 'purple' },
  { id: 'transfer', label: 'Transfer', color: 'orange' }
];

export const LOAN_TYPES = [
  { id: 'group', label: 'Group Loan', description: 'Loan issued to a group' },
  { id: 'individual', label: 'Individual Loan', description: 'Personal loan to individual member' }
];

export const PAYMENT_TYPES = [
  { id: 'single', label: 'Single Payment', description: 'Direct payment to individual' },
  { id: 'paybill', label: 'Paybill Payment', description: 'Payment to paybill number' },
  { id: 'buygoods', label: 'Buy Goods Payment', description: 'Payment to till number' },
  { id: 'bulk', label: 'Bulk Payments', description: 'Multiple payments at once' }
];