const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugApprovalIssues() {
  try {
    console.log('🔍 Debugging Manager Portal and Admin User Issues...\n')

    // Check expenses and their approval status
    console.log('📊 EXPENSES:')
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: { id: true, name: true, role: true, managerId: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    expenses.forEach(expense => {
      console.log(`  - ${expense.description || 'No description'} by ${expense.user.name}`)
      console.log(`    Amount: $${expense.amount}, Status: ${expense.status}`)
      console.log(`    User Manager ID: ${expense.user.managerId}`)
      console.log(`    Approvals: ${expense.approvals.length}`)
      expense.approvals.forEach((approval, i) => {
        console.log(`      ${i+1}. ${approval.approver.name} (${approval.approver.role}) - ${approval.status}`)
      })
      console.log('')
    })

    // Check all users and their relationships
    console.log('👥 USERS:')
    const users = await prisma.user.findMany({
      include: {
        manager: {
          select: { id: true, name: true, role: true }
        },
        managees: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`)
      console.log(`    Manager: ${user.manager ? `${user.manager.name} (${user.manager.role})` : 'None'}`)
      console.log(`    Manages: ${user.managees.length} employees`)
      console.log('')
    })

    // Check pending approvals specifically for managers
    console.log('⏳ PENDING APPROVALS FOR MANAGERS:')
    const pendingApprovals = await prisma.approval.findMany({
      where: { status: 'PENDING' },
      include: {
        expense: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        },
        approver: { select: { id: true, name: true, role: true } }
      }
    })

    if (pendingApprovals.length === 0) {
      console.log('  ❌ No pending approvals found!')
    } else {
      pendingApprovals.forEach(approval => {
        console.log(`  - Expense: "${approval.expense.description}" by ${approval.expense.user.name}`)
        console.log(`    Amount: $${approval.expense.amount}`)
        console.log(`    Assigned to: ${approval.approver.name} (${approval.approver.role})`)
        console.log('')
      })
    }

    // Check companies
    console.log('🏢 COMPANIES:')
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          users: true
        }
      }
    })

    companies.forEach(company => {
      console.log(`  - ${company.name} (${company.country}) - ${company._count.users} users`)
    })

  } catch (error) {
    console.error('Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugApprovalIssues()