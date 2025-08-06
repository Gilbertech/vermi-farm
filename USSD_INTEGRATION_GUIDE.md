# 🔗 USSD Integration Guide for *702*44#

## Overview
This guide explains how to integrate the Vermi-Farm MIS frontend with your existing USSD code `*702*44#` to create a seamless experience between mobile USSD and web admin interfaces.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USSD Users    │    │  Web Admin      │    │   Database      │
│   *702*44#      │◄──►│   Interface     │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Backend API    │◄─────────────┘
                        │   (Node.js)     │
                        └─────────────────┘
```

## 📱 USSD Menu Structure

### Main Menu (*702*44#)
```
Welcome [Name]!
Vermi-Farm Services

1. Check Balance
2. Loan Services  
3. Group Info
4. Transaction History
5. Make Payment
6. PIN Services
0. Exit
```

### Sub-Menus

#### 1. Check Balance
```
Account Balance
Name: John Doe
Balance: KES 5,000
Group: Nairobi Farmers
Status: Active

0. Main Menu
00. Exit
```

#### 2. Loan Services
```
Loan Services

1. Apply for Loan
2. Check Loan Status
3. Make Repayment
4. Loan History

0. Main Menu
00. Exit
```

#### 3. Group Information
```
Group Information
Name: Nairobi Farmers
Location: Nairobi, Kenya
Members: 15
Balance: KES 127,000
Your Role: Secretary

0. Main Menu
00. Exit
```

## 🔧 Backend Integration Points

### 1. Database Schema Alignment
Your USSD backend should use the same database tables as the web interface:

```sql
-- Core tables that both systems will share
- admin_users (web admin users)
- users (USSD users/members)
- groups (farmer groups)
- transactions (all financial transactions)
- loans (loan records)
- payments (payment records)
- ussd_sessions (USSD session management)
- otp_codes (OTP verification)
```

### 2. API Endpoints for USSD

#### Authentication & User Management
```javascript
// Check if user exists by phone
GET /api/ussd/user/check/{phone}

// Get user details for USSD
GET /api/ussd/user/{phone}

// Update user PIN
POST /api/ussd/user/{phone}/pin
{
  "old_pin": "1234",
  "new_pin": "5678"
}
```

#### Balance & Account Services
```javascript
// Get user balance
GET /api/ussd/balance/{phone}

// Get group information
GET /api/ussd/group/{phone}

// Get transaction history
GET /api/ussd/transactions/{phone}?limit=5
```

#### Loan Services
```javascript
// Apply for loan via USSD
POST /api/ussd/loans/apply
{
  "phone": "0712345678",
  "amount": 10000,
  "purpose": "Farm equipment",
  "type": "individual"
}

// Check loan status
GET /api/ussd/loans/{phone}

// Make loan repayment
POST /api/ussd/loans/repay
{
  "phone": "0712345678",
  "loan_id": "loan_123",
  "amount": 2000,
  "mpesa_receipt": "QGH7K8L9M0"
}
```

#### Payment Services
```javascript
// Initiate payment via USSD
POST /api/ussd/payments/send
{
  "from_phone": "0712345678",
  "to_phone": "0787654321",
  "amount": 1000,
  "purpose": "Group contribution"
}

// Check payment status
GET /api/ussd/payments/{phone}/status/{transaction_id}
```

### 3. USSD Session Management

```javascript
// Create/Update USSD session
POST /api/ussd/session
{
  "session_id": "ussd_session_123",
  "phone_number": "0712345678",
  "current_menu": "main",
  "menu_data": {},
  "status": "active"
}

// Get current session
GET /api/ussd/session/{session_id}

// End session
DELETE /api/ussd/session/{session_id}
```

## 🔄 Real-time Synchronization

### Web Admin ↔ USSD Sync Points

1. **User Registration**: When admin adds user via web → User can immediately access USSD
2. **Balance Updates**: USSD transactions → Real-time updates in web dashboard
3. **Loan Applications**: USSD loan requests → Appear in web admin for approval
4. **PIN Resets**: Admin resets PIN via web → User gets new PIN via SMS
5. **Group Changes**: Admin updates group info → Reflected in USSD group menu

### Implementation Example

```javascript
// In your USSD handler
app.post('/ussd', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  try {
    // Process USSD request using shared API
    const response = await ussdApi.handleUSSDRequest(sessionId, phoneNumber, text);
    
    res.send(response.data.response);
    
    // If session should continue, keep it active
    if (!response.data.continue_session) {
      await endUSSDSession(sessionId);
    }
  } catch (error) {
    res.send('Service temporarily unavailable. Please try again later.');
  }
});
```

## 📊 Data Flow Examples

### Example 1: Loan Application via USSD
```
1. User dials *702*44# → 2 → 1 (Apply for Loan)
2. USSD prompts for amount and purpose
3. User enters: 10000*Farm equipment
4. Backend creates loan application record
5. Web admin receives real-time notification
6. Admin approves/rejects via web interface
7. User gets SMS notification of decision
8. If approved, loan appears in user's USSD loan menu
```

### Example 2: Balance Update via Web Admin
```
1. Admin deposits money for user via web interface
2. Transaction record created in database
3. User's balance updated in real-time
4. Next time user checks balance via USSD, new amount is shown
5. Transaction appears in user's USSD transaction history
```

## 🔐 Security Considerations

### 1. PIN-based Authentication for USSD
```javascript
// Verify user PIN before sensitive operations
const verifyPIN = async (phone, pin) => {
  const user = await getUserByPhone(phone);
  return user && user.pin === pin;
};

// Example USSD flow with PIN verification
if (text.endsWith('*1234')) { // User entered PIN
  const pin = text.split('*').pop();
  const isValid = await verifyPIN(phoneNumber, pin);
  
  if (isValid) {
    // Proceed with sensitive operation
    return showBalanceMenu(user);
  } else {
    return 'Invalid PIN. Please try again.\n0. Main Menu';
  }
}
```

### 2. Session Security
- **Session Timeout**: USSD sessions expire after 5 minutes of inactivity
- **PIN Attempts**: Limit PIN attempts (3 tries, then lock for 30 minutes)
- **Transaction Limits**: Set daily/monthly limits for USSD transactions
- **Audit Trail**: Log all USSD activities for security monitoring

## 🚀 Implementation Steps

### Step 1: Database Setup
1. **Connect to Supabase**: Click "Connect to Supabase" in the top right
2. **Run Migrations**: Execute the SQL migrations provided in the backend documentation
3. **Seed Data**: Add initial admin users and test data

### Step 2: Backend API Development
1. **Implement API Endpoints**: Use the comprehensive API documentation provided
2. **Add USSD Handlers**: Create USSD-specific endpoints for menu processing
3. **Set up Real-time**: Configure WebSocket connections for live updates
4. **Integrate M-Pesa**: Connect M-Pesa API for payment processing

### Step 3: USSD Code Integration
1. **Update USSD Handler**: Modify your existing `*702*44#` code to use new APIs
2. **Menu Logic**: Implement the menu structure provided above
3. **Session Management**: Add session tracking for multi-step operations
4. **Error Handling**: Add proper error handling and fallbacks

### Step 4: Testing & Deployment
1. **Test USSD Flow**: Test all menu options and transactions
2. **Test Web Interface**: Ensure real-time updates work correctly
3. **Load Testing**: Test with multiple concurrent USSD sessions
4. **Security Testing**: Verify PIN security and session management

## 📋 USSD Menu Implementation Template

```javascript
// USSD Menu Handler Template
const handleUSSDMenu = async (text, phoneNumber, sessionId) => {
  const user = await getUserByPhone(phoneNumber);
  const session = await getUSSDSession(sessionId);
  
  // Parse user input
  const inputs = text.split('*');
  const currentInput = inputs[inputs.length - 1];
  
  // Main menu logic
  switch (session.current_menu) {
    case 'main':
      return handleMainMenu(currentInput, user);
    
    case 'balance':
      return handleBalanceMenu(currentInput, user);
    
    case 'loans':
      return handleLoansMenu(currentInput, user, session);
    
    case 'payments':
      return handlePaymentsMenu(currentInput, user, session);
    
    default:
      return handleMainMenu(currentInput, user);
  }
};

// Example: Balance menu handler
const handleBalanceMenu = async (input, user) => {
  if (input === '0') {
    return {
      response: getMainMenuText(user),
      continue: true,
      menu: 'main'
    };
  }
  
  if (input === '00') {
    return {
      response: 'Thank you for using Vermi-Farm!',
      continue: false
    };
  }
  
  // Show balance information
  const group = await getGroupById(user.group_id);
  return {
    response: `Account Balance
Name: ${user.name}
Balance: KES ${user.balance.toLocaleString()}
Group: ${group?.name || 'No Group'}
Status: ${user.status}

0. Main Menu
00. Exit`,
    continue: true,
    menu: 'balance'
  };
};
```

## 🔄 Real-time Updates

### WebSocket Events for USSD Integration
```javascript
// Listen for real-time updates that affect USSD users
supabase
  .channel('ussd-updates')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'users' },
    (payload) => {
      // Notify USSD user of balance/status changes
      if (payload.new.balance !== payload.old.balance) {
        sendSMSNotification(payload.new.phone, 
          `Your balance has been updated to KES ${payload.new.balance.toLocaleString()}`
        );
      }
    }
  )
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'loans' },
    (payload) => {
      // Notify user of loan approval
      const user = getUserById(payload.new.user_id);
      sendSMSNotification(user.phone,
        `Loan of KES ${payload.new.amount.toLocaleString()} has been approved!`
      );
    }
  )
  .subscribe();
```

## 📞 SMS Integration for USSD

```javascript
// SMS notifications for USSD users
const smsNotifications = {
  loanApproved: (phone, amount) => 
    `Loan of KES ${amount.toLocaleString()} approved! Check *702*44# for details.`,
  
  balanceUpdate: (phone, balance) =>
    `Account balance updated: KES ${balance.toLocaleString()}. Dial *702*44# to view.`,
  
  pinReset: (phone, newPin) =>
    `Your new PIN is: ${newPin}. Keep it secure. Change it via *702*44#.`,
  
  paymentReceived: (phone, amount, from) =>
    `Payment received: KES ${amount.toLocaleString()} from ${from}. Dial *702*44# for details.`
};
```

## 🎯 Next Steps

1. **Set up Supabase**: Click "Connect to Supabase" button in the web interface
2. **Implement Backend APIs**: Use the provided API documentation
3. **Integrate USSD Code**: Update your existing `*702*44#` implementation
4. **Test Integration**: Verify data flows between USSD and web interface
5. **Deploy**: Deploy both web interface and USSD backend

The frontend is now fully prepared for database integration and will work seamlessly with your USSD system once the backend APIs are implemented!