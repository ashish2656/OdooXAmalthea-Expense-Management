const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simulateManagerStats() {
  try {
    console.log('📊 Simulating Manager Portal Stats...\n')
    
    // Find the manager
    const manager = await prisma.user.findFirst({
      where: { role: 'MANAGER' }
    })
    
    if (!manager) {
      console.log('❌ No manager found')
      return
    }
    
    console.log(`👔 Manager: ${manager.name} (${manager.email})`)
    
    // Simulate the stats API logic
    const allApprovals = await prisma.approval.findMany({
      where: { approverId: manager.id },
      include: {
        expense: {
          select: {
            createdAt: true,
            amount: true,
            description: true
          }
        }
      }
    })
    
    // Calculate stats (same logic as the API)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const stats = {
      totalPending: allApprovals.filter(a => a.status === 'PENDING').length,
      totalApproved: allApprovals.filter(a => a.status === 'APPROVED').length,
      totalRejected: allApprovals.filter(a => a.status === 'REJECTED').length,
      thisMonth: allApprovals.filter(a => {
        const approvalDate = new Date(a.expense.createdAt)
        return approvalDate.getMonth() === currentMonth && 
               approvalDate.getFullYear() === currentYear
      }).length,
      totalAmount: allApprovals
        .filter(a => a.status === 'APPROVED')
        .reduce((sum, a) => sum + parseFloat(a.expense.amount || 0), 0)
    }
    
    console.log('\n📊 MANAGER PORTAL STATS:')
    console.log(`  ⏳ Pending Approvals: ${stats.totalPending}`)
    console.log(`  ✅ Approved: ${stats.totalApproved}`)
    console.log(`  ❌ Rejected: ${stats.totalRejected}`)
    console.log(`  📅 This Month: ${stats.thisMonth}`)
    console.log(`  💰 Total Approved Amount: ₹${stats.totalAmount.toFixed(2)}`)
    
    console.log('\n📋 DETAILED APPROVALS:')
    allApprovals.forEach(approval => {
      console.log(`  ${approval.status}: ${approval.expense.description} - ₹${approval.expense.amount}`)
    })
    
    // Also get pending approvals for the pending section
    const pendingApprovals = await prisma.approval.findMany({
      where: {
        approverId: manager.id,
        status: 'PENDING'
      },
      include: {
        expense: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })
    
    console.log(`\n⏳ PENDING APPROVALS SECTION:`)
    if (pendingApprovals.length === 0) {
      console.log('  No pending approvals - "All expenses are up to date"')
    } else {
      pendingApprovals.forEach(approval => {
        console.log(`  📝 ${approval.expense.description} by ${approval.expense.user.name} - ₹${approval.expense.amount}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simulateManagerStats()