const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n')
    
    // Check expenses
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true, managerId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('💰 EXPENSES:')
    if (expenses.length === 0) {
      console.log('  No expenses found')
    } else {
      expenses.forEach(expense => {
        console.log(`  ${expense.id}: ${expense.description} - ₹${expense.amount}`)
        console.log(`    By: ${expense.user.name} (${expense.user.role})`)
        console.log(`    Status: ${expense.status}`)
        console.log(`    Manager ID: ${expense.user.managerId || 'None'}`)
        console.log(`    Created: ${expense.createdAt}\n`)
      })
    }
    
    // Check approvals
    const approvals = await prisma.approval.findMany({
      include: {
        expense: {
          select: { description: true, amount: true }
        },
        approver: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('✅ APPROVALS:')
    if (approvals.length === 0) {
      console.log('  No approval records found')
    } else {
      approvals.forEach(approval => {
        console.log(`  ${approval.id}: ${approval.expense.description}`)
        console.log(`    Approver: ${approval.approver.name} (${approval.approver.role})`)
        console.log(`    Status: ${approval.status}`)
        console.log(`    Step: ${approval.stepOrder}`)
        console.log(`    Created: ${approval.createdAt}\n`)
      })
    }
    
    // Check users and their manager relationships
    const users = await prisma.user.findMany({
      include: {
        manager: {
          select: { name: true, role: true }
        }
      },
      orderBy: { role: 'asc' }
    })
    
    console.log('👥 USERS & MANAGERS:')
    users.forEach(user => {
      console.log(`  ${user.name} (${user.role}) → Manager: ${user.manager?.name || 'None'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState()