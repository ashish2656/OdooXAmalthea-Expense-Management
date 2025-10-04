# Expense Management API Documentation

## Overview
Complete backend API system for expense management with role-based access control, approval workflows, and administrative features.

## Authentication & Authorization
All endpoints require JWT authentication via HTTP-only cookies. Role-based access control implemented with three levels:
- **EMPLOYEE**: Submit and view own expenses
- **MANAGER**: Approve/reject expenses + employee permissions  
- **ADMIN**: Full system access + user management + reporting

## API Endpoints

### Expense Management

#### 1. Submit Expense
**POST** `/api/expenses`
- **Access**: All authenticated users
- **Body**: `{ description, amount, category, receiptUrl? }`
- **Features**: 
  - Auto-creates approval workflow if amount exceeds thresholds
  - Validates required fields and amount > 0
  - Associates expense with authenticated user

#### 2. Get User Expenses
**GET** `/api/expenses`
- **Access**: All authenticated users  
- **Query Params**: `status`, `category`, `page`, `limit`
- **Returns**: Paginated list of user's expenses with approval details

#### 3. Get Expense Details
**GET** `/api/expenses/[id]`
- **Access**: Expense owner, assigned approvers, admins
- **Returns**: Full expense details with approval history

#### 4. Update Expense
**PUT** `/api/expenses/[id]`
- **Access**: Expense owner (only if status is PENDING)
- **Body**: `{ description?, amount?, category?, receiptUrl? }`
- **Features**: Re-triggers approval workflow if amount threshold changes

#### 5. Delete Expense
**DELETE** `/api/expenses/[id]`
- **Access**: Expense owner (only if status is PENDING)
- **Features**: Soft delete with audit trail

#### 6. Upload Receipt
**POST** `/api/expenses/upload`
- **Access**: All authenticated users
- **Body**: FormData with `receipt` file
- **Features**: 
  - Supports JPEG, PNG, PDF (max 10MB)
  - Generates unique filenames
  - Returns file URL for expense association

### Approval System

#### 7. Get Pending Approvals
**GET** `/api/approvals/pending`
- **Access**: MANAGER, ADMIN
- **Features**: Shows approvals assigned to user or company-wide for admins
- **Returns**: List with expense details and user information

#### 8. Approve Expense  
**POST** `/api/approvals/[id]/approve`
- **Access**: Assigned approver or ADMIN
- **Body**: `{ comments? }`
- **Features**: 
  - Updates expense status to APPROVED
  - Transaction-safe processing
  - Email notifications (ready for implementation)

#### 9. Reject Expense
**POST** `/api/approvals/[id]/reject`  
- **Access**: Assigned approver or ADMIN
- **Body**: `{ comments }` (required)
- **Features**: 
  - Updates expense status to REJECTED
  - Requires rejection comments
  - Transaction-safe processing

### Admin Management

#### 10. Approval Rules Management
**GET/POST** `/api/admin/approval-rules`
**PUT/DELETE** `/api/admin/approval-rules/[id]`
- **Access**: ADMIN only
- **Features**:
  - Create threshold-based approval rules
  - Assign approvers to thresholds
  - Prevent duplicate thresholds
  - Validate approver permissions

#### 11. User Management
**GET** `/api/admin/users`
**PUT/DELETE** `/api/admin/users/[id]`
- **Access**: ADMIN only
- **Features**:
  - List all company users with pagination
  - Update user roles and active status  
  - Soft delete (deactivate) users
  - Prevent self-modification

#### 12. Admin Dashboard
**GET** `/api/admin/dashboard`
- **Access**: ADMIN only
- **Returns**:
  - User and expense statistics
  - Month-over-month growth metrics
  - Expense breakdown by category
  - Recent activity overview
  - Pending approvals count

#### 13. Expense Reports
**GET** `/api/admin/reports/expenses`
- **Access**: ADMIN, MANAGER
- **Query Params**: `startDate`, `endDate`, `status`, `category`, `userId`, `format`
- **Features**:
  - Filtered reporting with date ranges
  - Export to CSV or JSON
  - Summary statistics and breakdowns
  - User-specific or company-wide reports

## Technical Features

### Security
- JWT authentication with HTTP-only cookies
- Role-based access control middleware
- Input validation and sanitization
- SQL injection protection via Prisma
- File upload security (type/size validation)

### Data Integrity
- Transaction-safe approval processing
- Referential integrity via foreign keys
- Audit trails for all modifications
- Soft deletes for data preservation

### Performance
- Paginated responses for large datasets
- Optimized database queries with includes
- Indexed foreign keys for fast lookups
- Efficient aggregation queries for reports

### Error Handling
- Comprehensive error responses
- Proper HTTP status codes
- Detailed error logging
- Graceful failure handling

## Database Schema

### Key Tables
- **User**: Authentication and role management
- **Company**: Multi-tenant organization structure
- **Expense**: Core expense tracking
- **Approval**: Workflow state management  
- **ApprovalRule**: Configurable approval thresholds

### Relationships
- Users belong to Companies (multi-tenant)
- Expenses belong to Users
- Approvals link Expenses to Approvers
- ApprovalRules define company policies

## Next Steps for Frontend Integration

1. **Authentication Pages**: Login/signup forms with proper error handling
2. **Employee Dashboard**: Expense submission and tracking interface
3. **Manager Dashboard**: Approval workflow interface  
4. **Admin Panel**: User management and reporting interface
5. **File Upload**: Receipt upload component with preview
6. **Real-time Updates**: WebSocket integration for approval notifications
7. **Mobile Responsive**: Optimized mobile expense submission flow

## Environment Variables Required
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key  
NEXTAUTH_SECRET=your_nextauth_secret
SMTP_HOST=your_email_server (for notifications)
SMTP_USER=your_email_username
SMTP_PASS=your_email_password
```

The backend API is now complete and production-ready, providing a robust foundation for the expense management application with comprehensive security, data integrity, and administrative features.