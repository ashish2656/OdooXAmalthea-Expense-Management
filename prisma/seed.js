const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a default company
  let company = await prisma.company.findFirst({
    where: { name: 'IITG Expense Management' }
  })
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'IITG Expense Management',
        country: 'India',
        currency: 'INR'
      }
    })
  }
  console.log('✅ Company created:', company.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iitg.ac.in' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@iitg.ac.in',
      password: adminPassword,
      role: 'ADMIN',
      companyId: company.id
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@iitg.ac.in' },
    update: {},
    create: {
      name: 'Department Manager',
      email: 'manager@iitg.ac.in',
      password: managerPassword,
      role: 'MANAGER',
      companyId: company.id
    }
  })
  console.log('✅ Manager user created:', manager.email)

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 12)
  const employee = await prisma.user.upsert({
    where: { email: 'employee@iitg.ac.in' },
    update: {},
    create: {
      name: 'John Employee',
      email: 'employee@iitg.ac.in',
      password: employeePassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      managerId: manager.id
    }
  })
  console.log('✅ Employee user created:', employee.email)

  // Create some sample expenses
  const sampleExpenses = [
    {
      amount: 2500.00,
      category: 'TRAVEL',
      description: 'Business trip to Delhi',
      vendor: 'Airlines India',
      date: new Date('2024-01-15'),
      userId: employee.id,
      status: 'APPROVED'
    },
    {
      amount: 850.00,
      category: 'FOOD',
      description: 'Team lunch meeting',
      vendor: 'Restaurant ABC',
      date: new Date('2024-01-20'),
      userId: employee.id,
      status: 'PENDING'
    },
    {
      amount: 1200.00,
      category: 'SOFTWARE',
      description: 'Software license renewal',
      vendor: 'TechCorp Solutions',
      date: new Date('2024-01-25'),
      userId: employee.id,
      status: 'REJECTED'
    }
  ]

  for (const expenseData of sampleExpenses) {
    const expense = await prisma.expense.create({
      data: expenseData
    })
    console.log(`✅ Sample expense created: ${expense.description}`)
  }

  // Create approval rules
  let approvalRule = await prisma.approvalRule.findFirst({
    where: { 
      companyId: company.id,
      ruleType: 'SPECIFIC_APPROVER'
    }
  })
  
  if (!approvalRule) {
    approvalRule = await prisma.approvalRule.create({
      data: {
        companyId: company.id,
        ruleType: 'SPECIFIC_APPROVER',
        maxAmount: 1000.00,
        specialApproverId: manager.id,
        isActive: true
      }
    })
  }
  console.log('✅ Approval rule created for amounts over ₹1000')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Test Credentials:')
  console.log('Admin: admin@iitg.ac.in / admin123')
  console.log('Manager: manager@iitg.ac.in / manager123')
  console.log('Employee: employee@iitg.ac.in / employee123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })