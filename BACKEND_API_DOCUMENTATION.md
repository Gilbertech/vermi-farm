# Vermi-Farm Backend API Documentation

## Overview
This document outlines all the APIs and integrations required for the Vermi-Farm Management Information System. The backend developer should implement these endpoints to support the frontend functionality.

## Base Configuration
- **Base URL**: `https://api.vermi-farm.org/v1`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`
- **Rate Limiting**: 1000 requests per hour per user

## Authentication & Authorization

### 1. Authentication Endpoints

#### POST /auth/login
```json
{
  "phone": "0768299985",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "Super Admin",
      "phone": "0768299985",
      "role": "super_admin"
    },
    "requires_otp": true,
    "otp_sent": true
  }
}
```

#### POST /auth/verify-otp
```json
{
  "phone": "0768299985",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "user_123",
      "name": "Super Admin",
      "phone": "0768299985",
      "role": "super_admin"
    }
  }
}
```

#### POST /auth/send-otp
```json
{
  "phone": "0768299985"
}
```

#### POST /auth/reset-password
```json
{
  "phone": "0768299985"
}
```

#### POST /auth/refresh-token
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /auth/logout
Headers: `Authorization: Bearer {token}`

## User Management

### 2. Users Endpoints

#### GET /users
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `role`: Filter by role
- `group_id`: Filter by group
- `status`: active/inactive
- `created_from`: Date filter
- `created_to`: Date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "per_page": 10
    }
  }
}
```

#### POST /users
```json
{
  "name": "John Doe",
  "phone": "0712345678",
  "role": "member",
  "group_id": "group_123",
  "balance": 5000
}
```

#### GET /users/{id}
#### PUT /users/{id}
#### DELETE /users/{id}

#### POST /users/{id}/reset-pin
**Response:**
```json
{
  "success": true,
  "data": {
    "new_pin": "1234",
    "sms_sent": true
  }
}
```

#### GET /users/{id}/transactions
#### GET /users/{id}/loans

## Group Management

### 3. Groups Endpoints

#### GET /groups
#### POST /groups
```json
{
  "name": "Nairobi Farmers",
  "reg_no": "NF001",
  "location": "Nairobi, Kenya",
  "description": "Urban farming group",
  "admin_id": "user_123",
  "loan_limit": 50000,
  "interest_rate": 5.0
}
```

#### GET /groups/{id}
#### PUT /groups/{id}
#### DELETE /groups/{id}

#### PUT /groups/{id}/executives
```json
{
  "secretary": "user_456",
  "chairperson": "user_789",
  "treasurer": "user_101"
}
```

#### PUT /groups/{id}/loan-limit
```json
{
  "loan_limit": 75000
}
```

#### PUT /groups/{id}/interest-rate
```json
{
  "interest_rate": 4.5
}
```

#### GET /groups/{id}/members
#### GET /groups/{id}/transactions

## Transaction Management

### 4. Transactions Endpoints

#### GET /transactions
**Query Parameters:**
- `type`: inwallet/outwallet/withdrawals
- `status`: completed/pending/failed
- `user_id`: Filter by user
- `group_id`: Filter by group
- `amount_min`: Minimum amount
- `amount_max`: Maximum amount
- `date_from`: Start date
- `date_to`: End date

#### POST /transactions
```json
{
  "type": "deposit",
  "amount": 5000,
  "user_id": "user_123",
  "group_id": "group_456",
  "description": "Monthly contribution",
  "mpesa_receipt": "QGH7K8L9M0"
}
```

#### GET /transactions/{id}
#### PUT /transactions/{id}

#### GET /transactions/inwallet
#### GET /transactions/outwallet
#### GET /transactions/withdrawals

## Loan Management

### 5. Loans Endpoints

#### GET /loans
**Query Parameters:**
- `type`: group/individual
- `status`: active/completed/overdue
- `user_id`: Filter by borrower
- `group_id`: Filter by group

#### POST /loans
```json
{
  "user_id": "user_123",
  "group_id": "group_456",
  "amount": 15000,
  "interest_rate": 5.0,
  "due_date": "2024-12-31",
  "type": "group",
  "purpose": "Equipment purchase"
}
```

#### GET /loans/{id}
#### PUT /loans/{id}

#### POST /loans/{id}/repayment
```json
{
  "amount": 2000,
  "payment_method": "mpesa",
  "mpesa_receipt": "ABC123XYZ"
}
```

## Payment System

### 6. Payments Endpoints

#### GET /payments
#### POST /payments/single
```json
{
  "recipient_name": "John Doe",
  "recipient_msisdn": "0712345678",
  "amount": 5000,
  "purpose": "Salary payment"
}
```

#### POST /payments/paybill
```json
{
  "paybill_number": "4703932",
  "account_number": "VF001",
  "amount": 10000
}
```

#### POST /payments/buygoods
```json
{
  "business_number": "123456",
  "amount": 7500
}
```

#### POST /payments/bulk
```json
{
  "payments": [
    {
      "recipient_name": "John Doe",
      "recipient_msisdn": "0712345678",
      "amount": 5000
    }
  ],
  "reference_label": "Monthly Salaries",
  "scheduled_date": "2024-01-31"
}
```

## Portfolio Management

### 7. Portfolio Endpoints

#### GET /portfolios
#### GET /portfolios/{type}/transactions
**Types:** loan, revenue, investment, expense, working, b2b, savings

#### POST /portfolios/transfer
```json
{
  "from_portfolio": "revenue",
  "to_portfolio": "investment",
  "amount": 50000,
  "description": "Quarterly investment allocation",
  "reference": "Q1-2024-INV"
}
```

#### GET /portfolios/{type}/stats

## Account Management

### 8. Accounts Endpoints

#### GET /accounts
#### GET /accounts/balance
#### GET /accounts/transactions

## Statement Generation

### 9. Statements Endpoints

#### GET /statements
#### POST /statements/generate
```json
{
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "user_id": "user_123",
  "group_id": "group_456",
  "format": "pdf"
}
```

#### GET /statements/{id}/download

## Reversal Management

### 10. Reversals Endpoints

#### GET /reversals
#### POST /reversals
```json
{
  "transaction_id": "txn_123",
  "reason": "Incorrect amount"
}
```

#### POST /reversals/{id}/approve
#### POST /reversals/{id}/reject

## Notification System

### 11. Notifications Endpoints

#### GET /notifications
#### POST /notifications
#### PUT /notifications/{id}/read
#### DELETE /notifications/{id}

## Real-time Features

### 12. WebSocket Events

#### Connection
```
wss://api.vermi-farm.org/ws?token={jwt_token}
```

#### Events to Listen:
- `transaction_created`
- `loan_approved`
- `payment_completed`
- `notification_received`
- `user_status_changed`

#### Events to Emit:
- `join_room` (for group-specific updates)
- `typing` (for chat features)

## File Upload

### 13. Upload Endpoints

#### POST /upload/bulk-payments
**Content-Type:** `multipart/form-data`
```
file: CSV/Excel file
```

#### POST /upload/documents
**Content-Type:** `multipart/form-data`

## SMS Integration

### 14. SMS Service

#### POST /sms/send
```json
{
  "phone": "0712345678",
  "message": "Your OTP is: 123456",
  "type": "otp"
}
```

#### POST /sms/bulk
```json
{
  "recipients": ["0712345678", "0787654321"],
  "message": "Group meeting tomorrow at 2 PM"
}
```

## M-Pesa Integration

### 15. M-Pesa Endpoints

#### POST /mpesa/stk-push
```json
{
  "phone": "254712345678",
  "amount": 1000,
  "account_reference": "VF001",
  "transaction_desc": "Payment for services"
}
```

#### POST /mpesa/callback
**Webhook endpoint for M-Pesa callbacks**

#### GET /mpesa/transaction-status/{checkout_request_id}

## Analytics & Reports

### 16. Analytics Endpoints

#### GET /analytics/dashboard
#### GET /analytics/users
#### GET /analytics/transactions
#### GET /analytics/loans
#### GET /analytics/revenue

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone",
      "value": "invalid_phone"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ERROR`: Resource already exists
- `RATE_LIMIT_ERROR`: Too many requests
- `SERVER_ERROR`: Internal server error

## Security Requirements

### 1. Authentication
- JWT tokens with 24-hour expiry
- Refresh tokens with 30-day expiry
- OTP verification for sensitive operations

### 2. Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API rate limiting

### 3. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### 4. Encryption
- HTTPS only
- Password hashing (bcrypt)
- Sensitive data encryption at rest

## Database Schema Requirements

### Tables Required:
1. `users` - User management
2. `groups` - Group management
3. `transactions` - All transactions
4. `loans` - Loan records
5. `payments` - Payment records
6. `portfolio_transactions` - Portfolio movements
7. `reversal_requests` - Transaction reversals
8. `statements` - Generated statements
9. `accounts` - Account information
10. `notifications` - System notifications
11. `sessions` - User sessions
12. `audit_logs` - System audit trail

### Relationships:
- Users belong to Groups (many-to-one)
- Transactions belong to Users and Groups
- Loans belong to Users and Groups
- Payments initiated by Users
- Portfolio transactions track movements

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/vermifarm_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# SMS
SMS_API_KEY=your_sms_provider_api_key
SMS_SENDER_ID=VERMIFARM

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=4703932
MPESA_CALLBACK_URL=https://api.vermi-farm.org/mpesa/callback

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=vermifarm-files

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@vermi-farm.org
SMTP_PASS=your_email_password
```

## Testing Requirements

### 1. Unit Tests
- All API endpoints
- Business logic functions
- Database operations

### 2. Integration Tests
- M-Pesa integration
- SMS service integration
- File upload functionality

### 3. Load Testing
- API performance under load
- Database query optimization
- Concurrent user handling

## Deployment Requirements

### 1. Infrastructure
- Node.js/Python backend
- PostgreSQL database
- Redis for caching
- AWS S3 for file storage

### 2. Monitoring
- Application performance monitoring
- Error tracking
- Database monitoring
- API usage analytics

### 3. Backup & Recovery
- Daily database backups
- File storage backups
- Disaster recovery plan

## API Documentation Tools
- Use Swagger/OpenAPI for API documentation
- Postman collection for testing
- API versioning strategy

This documentation provides a comprehensive guide for implementing the backend services required for the Vermi-Farm Management Information System.