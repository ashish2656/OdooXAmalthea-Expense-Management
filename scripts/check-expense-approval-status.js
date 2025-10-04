const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkExpenseVsApprovalStatus() {
  try {
    console.log('🔍 Checking Expense vs Approval Status...\n')
    
    // Get all expenses with their approval records
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: { name: true, role: true }
        },
        approvals: {
          include: {
            approver: {
              select: { name: true, role: true }
            }
          },
          orderBy: { stepOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('📊 EXPENSE STATUS vs APPROVAL STATUS:\n')
    
    expenses.forEach(expense => {
      console.log(`💰 ${expense.description} (₹${expense.amount})`)
      console.log(`   Expense Status: ${expense.status}`)
      console.log(`   By: ${expense.user.name} (${expense.user.role})`)
      
      if (expense.approvals.length > 0) {
        expense.approvals.forEach(approval => {
          console.log(`   ✓ Approval Status: ${approval.status} by ${approval.approver.name} (${approval.approver.role})`)
        })
      } else {
        console.log(`   ❌ No approval records found!`)
      }
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExpenseVsApprovalStatus()