# Database Variable Names and Schema

## 📊 **Core Tables and Fields**

### 👤 **Users Table**
```sql
users {
  id: string (primary key)
  name: string
  phone: string (Kenyan format: 07xxxxxxxx or 01xxxxxxxx)
  role: enum ('admin', 'member', 'secretary', 'chairperson', 'treasurer')
  group_id: string (foreign key to groups.id)
  balance: decimal(10,2) -- Loan limit/balance
  status: enum ('active', 'inactive')
  created_at: timestamp
  updated_at: timestamp
}
```

### 👥 **Groups Table**
```sql
groups {
  id: string (primary key)
  name: string
  reg_no: string (registration number)
  location: string
  description: text
  admin_id: string (foreign key to users.id)
  total_balance: decimal(12,2)
  loan_limit: decimal(12,2)
  interest_rate: decimal(5,2) -- percentage
  active_loans: integer
  total_disbursed: decimal(12,2)
  created_at: timestamp
  updated_at: timestamp
}
```

### 💸 **Transactions Table**
```sql
transactions {
  id: string (primary key)
  tx_code: string (unique transaction code)
  type: enum ('deposit', 'withdrawal', 'loan', 'repayment', 'transfer')
  amount: decimal(12,2)
  fees: decimal(8,2)
  user_id: string (foreign key to users.id)
  group_id: string (foreign key to groups.id, nullable)
  from_account: string
  to_account: string
  description: text
  status: enum ('completed', 'pending', 'failed')
  mpesa_receipt: string (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 🏦 **Loans Table**
```sql
loans {
  id: string (primary key)
  user_id: string (foreign key to users.id)
  group_id: string (foreign key to groups.id)
  amount: decimal(12,2)
  repaid_amount: decimal(12,2)
  interest_rate: decimal(5,2)
  due_date: date
  status: enum ('active', 'completed', 'overdue')
  created_at: timestamp
  updated_at: timestamp
}
```

### 📊 **Portfolio Transactions Table**
```sql
portfolio_transactions {
  id: string (primary key)
  tx_code: string (unique)
  portfolio_type: enum ('loan', 'revenue', 'investment', 'expense', 'working', 'b2b', 'savings')
  from_account: string
  to_account: string
  amount: decimal(12,2)
  fees: decimal(8,2)
  status: enum ('completed', 'pending', 'failed')
  created_at: timestamp
  updated_at: timestamp
}
```

### 💳 **Payments Table**
```sql
payments {
  id: string (primary key)
  tx_code: string (unique)
  payment_type: enum ('normal', 'b2b', 'paybill', 'buygoods', 'bulk')
  initiator_id: string (foreign key to users.id)
  recipient_name: string
  recipient_msisdn: string
  paybill_number: string (nullable)
  account_number: string (nullable)
  business_number: string (nullable)
  amount: decimal(12,2)
  cost: decimal(8,2)
  mpesa_receipt: string (nullable)
  description: text (nullable)
  status: enum ('completed', 'pending', 'failed')
  created_at: timestamp
  updated_at: timestamp
}
```

### 🔁 **Reversal Requests Table**
```sql
reversal_requests {
  id: string (primary key)
  tx_code: string (transaction to reverse)
  initiated_by: string (foreign key to users.id)
  transaction_type: string
  amount: decimal(12,2)
  transaction_time: timestamp
  from_account: string
  to_account: string
  reason: text
  status: enum ('pending', 'approved', 'rejected')
  created_at: timestamp
  updated_at: timestamp
}
```

### 📄 **Statements Table**
```sql
statements {
  id: string (primary key)
  from_date: date
  to_date: date
  user_id: string (foreign key to users.id, nullable)
  group_id: string (foreign key to groups.id, nullable)
  statement_type: string
  file_path: string (path to generated PDF/CSV)
  created_at: timestamp
}
```

### 🏦 **Accounts Table**
```sql
accounts {
  id: string (primary key)
  account_name: string -- 'Vermifarm'
  paybill_number: string -- '4703932'
  current_balance: decimal(12,2)
  last_updated: timestamp
}
```

## 🔗 **Key Relationships**

1. **Users ↔ Groups**: Many-to-One (users.group_id → groups.id)
2. **Users ↔ Transactions**: One-to-Many (users.id ← transactions.user_id)
3. **Groups ↔ Transactions**: One-to-Many (groups.id ← transactions.group_id)
4. **Users ↔ Loans**: One-to-Many (users.id ← loans.user_id)
5. **Groups ↔ Loans**: One-to-Many (groups.id ← loans.group_id)
6. **Users ↔ Payments**: One-to-Many (users.id ← payments.initiator_id)

## 📱 **API Endpoints Structure**

### Authentication
- `POST /api/auth/login` - Phone + Password login
- `POST /api/auth/reset-password` - SMS-based reset

### Users
- `GET /api/users` - List all users with filters
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/reset-pin` - Reset user PIN

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `PUT /api/groups/:id/executives` - Update group executives
- `PUT /api/groups/:id/loan-limit` - Update loan limit
- `PUT /api/groups/:id/interest-rate` - Update interest rate

### Transactions
- `GET /api/transactions` - List transactions with filters
- `GET /api/transactions/inwallet` - Inwallet transactions
- `GET /api/transactions/outwallet` - Outwallet transactions
- `GET /api/transactions/withdrawals` - Withdrawal transactions
- `POST /api/transactions` - Create new transaction

### Portfolios
- `GET /api/portfolios/:type/transactions` - Get portfolio-specific transactions
- `POST /api/portfolios/transfer` - Transfer between portfolios
- `GET /api/portfolios/:type/stats` - Get portfolio statistics

### Payments
- `GET /api/payments` - List payments with filters
- `POST /api/payments/single` - Single payment
- `POST /api/payments/paybill` - Paybill payment
- `POST /api/payments/buygoods` - Buy goods payment
- `POST /api/payments/bulk` - Bulk payments

### Statements
- `GET /api/statements` - List generated statements
- `POST /api/statements/generate` - Generate new statement
- `GET /api/statements/:id/download` - Download statement file

### Reversals
- `GET /api/reversals` - List reversal requests
- `POST /api/reversals/:id/approve` - Approve reversal
- `POST /api/reversals/:id/reject` - Reject reversal

## 🔧 **Environment Variables**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/vermifarm_db
JWT_SECRET=your_jwt_secret_key
SMS_API_KEY=your_sms_provider_api_key
SMS_SENDER_ID=VERMIFARM
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=4703932
```