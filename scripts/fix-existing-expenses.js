const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixExistingExpenses() {
  try {
    console.log('🔧 Fixing existing expenses without approval records...\n')
    
    // Get pending expenses without approval records
    const pendingExpenses = await prisma.expense.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          include: {
            manager: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
        approvals: true
      }
    })
    
    console.log(`Found ${pendingExpenses.length} pending expenses`)
    
    for (const expense of pendingExpenses) {
      console.log(`\nProcessing: ${expense.description} by ${expense.user.name}`)
      
      // Check if it already has approval records
      if (expense.approvals.length > 0) {
        console.log(`  ✅ Already has ${expense.approvals.length} approval record(s)`)
        continue
      }
      
      // Create approval record
      if (expense.user.managerId && expense.user.manager) {
        await prisma.approval.create({
          data: {
            expenseId: expense.id,
            approverId: expense.user.manager.id,
            stepOrder: 1,
            status: 'PENDING'
          }
        })
        console.log(`  ✅ Created approval record for manager: ${expense.user.manager.name}`)
      } else {
        // Find an admin as fallback
        const admin = await prisma.user.findFirst({
          where: {
            companyId: expense.user.companyId,
            role: 'ADMIN'
          }
        })
        
        if (admin) {
          await prisma.approval.create({
            data: {
              expenseId: expense.id,
              approverId: admin.id,
              stepOrder: 1,
              status: 'PENDING'
            }
          })
          console.log(`  ✅ Created approval record for admin: ${admin.name}`)
        } else {
          console.log(`  ❌ No manager or admin found for user ${expense.user.name}`)
        }
      }
    }
    
    // Show final state
    const finalApprovals = await prisma.approval.findMany({
      include: {
        expense: {
          select: { description: true }
        },
        approver: {
          select: { name: true, role: true }
        }
      }
    })
    
    console.log(`\n✅ Final state: ${finalApprovals.length} approval records created`)
    finalApprovals.forEach(approval => {
      console.log(`  ${approval.expense.description} → ${approval.approver.name} (${approval.approver.role})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingExpenses()