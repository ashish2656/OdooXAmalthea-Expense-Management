# 🏢 Odoo IITGN Expense Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A comprehensive, modern expense management system built for **Indian Institute of Technology Guwahati (IITG)** with multi-role support, automated approval workflows, and detailed reporting capabilities.

## 🌟 Key Features

### 💼 Multi-Role Architecture
- **Admin**: Complete system management and oversight
- **Manager**: Expense approval and team management  
- **Employee**: Expense submission and tracking

### 💰 Expense Management
- Submit expenses with detailed information
- Multiple expense categories (Travel, Food, Accommodation, etc.)
- Receipt attachment support
- Real-time status tracking
- Indian Rupee (₹) currency support

### 🔄 Automated Approval Workflow
- Configurable approval rules based on amount thresholds
- Multi-level approval system
- Email notifications (configurable)
- Approval history tracking

### 📊 Advanced Reporting & Analytics
- Real-time dashboard with key metrics
- Detailed expense reports with filtering
- CSV export functionality
- Visual charts and statistics
- Company-wide expense analytics

### 🔐 Security & Authentication
- JWT-based secure authentication
- Role-based access control (RBAC)
- Password encryption with bcrypt
- Company-level data isolation

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/Light theme support
- Smooth animations with Framer Motion
- Accessible components with Radix UI
- Clean, professional interface

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4.1.9 + shadcn/ui
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database ORM**: Prisma 6.16.3
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer (optional)

### Database
- **Database**: PostgreSQL (Neon Cloud)
- **Migration**: Prisma Migrate
- **Seeding**: Custom seed scripts

### Development Tools
- **Language**: JavaScript (converted from TypeScript)
- **Package Manager**: npm/pnpm
- **Code Quality**: ESLint
- **Version Control**: Git

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (Neon recommended)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/ombarvaliya/Odoo-IITG-Expense-Management.git
cd Odoo-IITG-Expense-Management
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database Configuration - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Next.js Configuration
NEXTAUTH_SECRET="your-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 Default User Accounts

After seeding, you can login with these accounts:

### Admin Account
- **Email**: `admin@iitg.ac.in`
- **Password**: `admin123`
- **Permissions**: Full system access

### Manager Account
- **Email**: `manager@iitg.ac.in`
- **Password**: `manager123`
- **Permissions**: Expense approval, team management

### Employee Account
- **Email**: `employee@iitg.ac.in`
- **Password**: `employee123`
- **Permissions**: Expense submission and tracking

## 📁 Project Structure

```
Odoo-IITG-Expense-Management/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin-specific APIs
│   │   ├── employee/             # Employee APIs
│   │   └── manager/              # Manager APIs
│   ├── admin/                    # Admin dashboard pages
│   ├── employee/                 # Employee dashboard
│   ├── manager/                  # Manager dashboard
│   ├── login/                    # Authentication pages
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Shared components
├── lib/                          # Utility functions
│   ├── utils.ts                  # Helper utilities
│   ├── middleware.js             # Auth middleware
│   └── fetcher.js                # API fetcher
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Database seeding
├── public/                       # Static assets
├── hooks/                        # Custom React hooks
└── styles/                       # Additional stylesheets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
npm run seed         # Seed database with initial data

# Deployment
npm run build        # Build optimized production bundle
npm run start        # Start production server
```

## 🎯 Core Functionality

### For Employees
1. **Expense Submission**
   - Fill expense details (amount, category, description)
   - Add vendor information and dates
   - Attach receipts (optional)
   - Submit for approval

2. **Expense Tracking**
   - View all submitted expenses
   - Check approval status
   - Track approval history
   - Download expense reports

### For Managers
1. **Expense Approval**
   - Review pending expense requests
   - Approve or reject with comments
   - View expense details and attachments
   - Track team expenses

2. **Team Management**
   - View team member expenses
   - Analyze spending patterns
   - Generate team reports

### For Admins
1. **User Management**
   - Add new users with roles
   - Manage user permissions
   - View user activity
   - Export user data

2. **System Configuration**
   - Set approval rules and thresholds
   - Configure expense categories
   - Manage company settings
   - System analytics

3. **Reporting & Analytics**
   - Company-wide expense analytics
   - Export data in CSV format
   - View detailed reports
   - Financial insights

## 🔐 Security Features

- **Authentication**: JWT-based secure login system
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Company-level data isolation
- **Password Security**: bcrypt encryption
- **API Security**: Request validation and error handling
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📊 Database Schema

### Core Models
- **Company**: Organization information
- **User**: User accounts with roles
- **Expense**: Expense records with approvals
- **ApprovalRule**: Configurable approval workflows
- **PasswordResetToken**: Secure password reset tokens

### Relationships
- Companies have multiple users and approval rules
- Users can have managers and manage other users
- Expenses belong to users and require approvals
- Approval rules determine workflow based on amounts

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/signup` - User registration

### Employee APIs
- `GET /api/employee/expenses` - Get user expenses
- `POST /api/employee/expenses` - Create new expense
- `PUT /api/employee/expenses/[id]` - Update expense

### Manager APIs
- `GET /api/manager/pending-approvals` - Get pending approvals
- `POST /api/manager/approve` - Approve/reject expense

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/expenses` - Get all expenses
- `GET /api/admin/export/expenses` - Export CSV

## 🎨 UI Components

Built with **shadcn/ui** and **Radix UI** for:
- Consistent design system
- Accessibility compliance
- Customizable themes
- Responsive layouts
- Smooth animations

### Key Components
- Tables with sorting and filtering
- Modal dialogs for forms
- Alert notifications
- Loading states
- Error boundaries

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IIT Gandhinagar** for the project inspiration
- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **Vercel** for deployment platform
- **shadcn** for the beautiful UI components
- **Neon** for PostgreSQL cloud hosting

---

**Built with ❤️ for IIT Guwahati**

## 📈 Roadmap

### Version 2.0 (Planned)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Automated receipt scanning (OCR)
- [ ] Integration with accounting software
- [ ] Multi-currency support
- [ ] Expense policies and compliance
- [ ] Real-time notifications
- [ ] Advanced reporting with charts

### Version 1.1 (Current)
- [x] Multi-role user management
- [x] Automated approval workflows  
- [x] CSV export functionality
- [x] Indian Rupee currency support
- [x] Responsive design
- [x] Dashboard analytics
- [x] Secure authentication

---

*This README was last updated on October 4, 2025*
