# 🌱 Vermi-Farm Management Information System (MIS)

A comprehensive web-based Management Information System designed specifically for **Vermi-Farm**, a sustainable agriculture organization. This system provides complete management capabilities for users, groups, loans, transactions, payments, and financial portfolios.

## 🚀 Features

### 👥 **User Management**
- **Role-based Access Control**: Chairperson, Secretary, Treasurer, and Member roles
- **User Registration & Authentication**: Secure login with Kenyan phone number validation
- **Profile Management**: Complete user profile editing and management
- **PIN Reset Functionality**: Secure PIN reset via SMS
- **Transaction History**: Individual user transaction tracking
- **Loan History**: Personal loan application and repayment tracking

### 🏢 **Group Management**
- **Group Creation & Administration**: Complete group lifecycle management
- **Executive Role Assignment**: Dynamic assignment of Secretary, Chairperson, and Treasurer
- **Financial Settings**: Configurable loan limits and interest rates
- **Member Management**: Add/remove members and manage group composition
- **Group Transactions**: Track all group-level financial activities
- **Location & Registration**: Group location and registration number management

### 💰 **Loan Management**
- **Dual Loan Types**:
  - **Group Loans**: Loans issued to groups
  - **Individual Loans**: Personal loans to individual members
- **Loan Disbursement**: Streamlined loan approval and disbursement process
- **Repayment Tracking**: Real-time repayment progress monitoring
- **Interest Calculation**: Automated interest calculation and tracking
- **Loan Status Management**: Active, completed, and overdue loan tracking

### 💳 **Transaction Management**
- **Multi-type Transactions**: Deposits, withdrawals, loans, and repayments
- **Real-time Processing**: Instant transaction processing and updates
- **Transaction Categories**: Organized by Inwallet, Outwallet, and Withdrawals
- **Search & Filtering**: Advanced filtering by amount, time, and type
- **Receipt Generation**: Automatic PDF receipt generation for all transactions

### 🏦 **Payment System**
- **Multiple Payment Types**:
  - Single Payments
  - Paybill Payments
  - Buy Goods Payments
  - Bulk Payments
- **B2B Payment Support**: Business-to-business payment processing
- **Payment Tracking**: Complete payment history and status tracking
- **Cost Management**: Transaction fee tracking and management

### 📊 **Portfolio Management**
- **7 Portfolio Types**:
  - Loan Portfolio
  - Revenue Portfolio
  - Investment Portfolio
  - Expense Portfolio
  - Working Account Portfolio
  - B2B Holding Portfolio
  - Savings Portfolio
- **Inter-portfolio Transfers**: Secure transfers between portfolios
- **Role-based Approvals**: Initiator and approver workflow for transfers
- **Portfolio Analytics**: Detailed statistics and performance tracking

### 🔄 **Reversal Management**
- **Reversal Requests**: Submit and track transaction reversal requests
- **Approval Workflow**: Multi-level approval process for reversals
- **Detailed Tracking**: Complete audit trail for all reversal activities
- **Status Management**: Pending, approved, and rejected reversal tracking

### 📄 **Statement Generation**
- **Custom Statement Generator**: Professional PDF statement generation
- **Flexible Date Ranges**: Generate statements for any date period
- **User & Group Statements**: Individual and group-level statements
- **Transaction Summaries**: Comprehensive transaction summaries
- **Professional Formatting**: Branded PDF statements with logos and formatting

### 🏦 **Account Management**
- **Paybill Integration**: Manage paybill number (4703932) and account details
- **Balance Tracking**: Real-time account balance monitoring
- **Transaction History**: Complete account transaction history
- **M-Pesa Integration**: Seamless M-Pesa transaction processing

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive and modern UI design
- **Lucide React** for consistent iconography
- **Vite** for fast development and building

### **PDF Generation**
- **jsPDF** for client-side PDF generation
- **Custom Receipt Generator** for transaction receipts
- **Statement Generator** for account statements

### **State Management**
- **React Context API** for global state management
- **Custom Hooks** for reusable logic
- **TypeScript Interfaces** for type safety

## 🎨 **Design System**

### **Color Palette**
- **Primary Green**: `#2d8e41` - Main brand color
- **Secondary Brown**: `#983F21` - Accent color
- **Neutral Grays**: Various shades for text and backgrounds
- **Status Colors**: Green (success), Yellow (pending), Red (error)

### **Typography**
- **Headings**: Bold, hierarchical sizing (text-3xl, text-2xl, text-xl)
- **Body Text**: Clean, readable font sizes
- **Interactive Elements**: Medium weight for buttons and links

### **Layout**
- **Responsive Design**: Mobile-first approach with breakpoints
- **Grid System**: CSS Grid and Flexbox for layouts
- **Spacing**: Consistent 8px spacing system
- **Cards**: Rounded corners with subtle shadows

## 🔐 **Security Features**

### **Authentication**
- **Phone Number Validation**: Kenyan phone number format validation
- **Role-based Access**: Different permission levels for different roles
- **Session Management**: Secure session handling
- **PIN Reset**: Secure PIN reset functionality

### **Authorization**
- **Initiator Roles**: Can initiate transfers and payments
- **Approver Roles**: Can approve high-value transactions
- **Super Admin**: Full system access and control

## 📱 **Responsive Design**

### **Mobile Optimization**
- **Touch-friendly Interface**: Large touch targets and intuitive navigation
- **Responsive Tables**: Horizontal scrolling for data tables
- **Mobile Navigation**: Collapsible sidebar for mobile devices
- **Optimized Forms**: Mobile-friendly form layouts

### **Tablet & Desktop**
- **Multi-column Layouts**: Efficient use of screen real estate
- **Advanced Filtering**: Comprehensive search and filter options
- **Data Visualization**: Charts and graphs for analytics

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/vermi-farm-mis.git
   cd vermi-farm-mis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### **Demo Credentials**

#### **Super Admin** (Full Access)
- **Phone**: `0712345678`
- **Password**: `admin123`

#### **Admin Initiators** (Can Initiate Actions)
- **Phone**: `0712345679` | **Password**: `admin123`
- **Phone**: `0712345680` | **Password**: `admin123`

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── modals/          # Modal components
│   └── ...              # Feature components
├── context/             # React Context providers
├── utils/               # Utility functions
│   ├── receiptGenerator.ts
│   └── statementGenerator.ts
├── types/               # TypeScript type definitions
└── styles/              # CSS and styling files
```

## 🔧 **Configuration**

### **Environment Variables**
```env
VITE_API_URL=your_api_endpoint
VITE_MPESA_SHORTCODE=4703932
VITE_SMS_API_KEY=your_sms_api_key
```

### **Customization**
- **Colors**: Modify `tailwind.config.js` for color scheme changes
- **Logo**: Replace logo URLs in components
- **Branding**: Update company information in PDF generators

## 📊 **Key Metrics & Analytics**

### **Dashboard Statistics**
- Total registered users
- Active groups
- Completed transactions
- Total amount transacted
- Loan disbursement and repayment tracking
- Revenue and earnings analytics

### **Financial Tracking**
- Real-time balance updates
- Transaction categorization
- Portfolio performance metrics
- Interest calculation and tracking

## 🔄 **Workflow Examples**

### **Loan Disbursement Workflow**
1. User/Group applies for loan
2. Admin reviews application
3. Loan approval and disbursement
4. Automatic interest calculation
5. Repayment tracking and management

### **Portfolio Transfer Workflow**
1. Initiator creates transfer request
2. System validates transfer details
3. Approver reviews and approves
4. Transfer execution and confirmation
5. Audit trail creation

## 🛡️ **Data Security**

### **Data Protection**
- **Input Validation**: Comprehensive input sanitization
- **XSS Prevention**: Protection against cross-site scripting
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Storage**: Encrypted sensitive data storage

### **Audit Trail**
- **Transaction Logging**: Complete transaction history
- **User Activity Tracking**: User action logging
- **System Changes**: Administrative action tracking

## 🤝 **Contributing**

### **Development Guidelines**
1. Follow TypeScript best practices
2. Maintain responsive design principles
3. Write comprehensive tests
4. Follow Git commit conventions
5. Update documentation for new features

### **Code Style**
- **ESLint**: Automated code linting
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Component Structure**: Consistent component organization

## 📞 **Support & Contact**

### **Technical Support**
- **Email**: support@vermi-farm.org
- **Phone**: +254 700 000 000
- **Website**: www.vermi-farm.org

### **Documentation**
- **API Documentation**: Available in `/docs` folder
- **User Manual**: Comprehensive user guide
- **Developer Guide**: Technical implementation details

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Vermi-Farm Team** for requirements and feedback
- **React Community** for excellent documentation and tools
- **Tailwind CSS** for the utility-first CSS framework
- **Open Source Contributors** for various libraries and tools

---

**Built with ❤️ for sustainable agriculture and financial inclusion in Kenya** 🇰🇪

*Last updated: January 2024*