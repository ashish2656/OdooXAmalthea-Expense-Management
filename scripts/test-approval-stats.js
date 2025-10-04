const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testApprovalStats() {
  try {
    console.log('🔍 Testing Approval Statistics...\n')
    
    // Get the manager user
    const manager = await prisma.user.findFirst({
      where: { role: 'MANAGER' }
    })
    
    if (!manager) {
      console.log('❌ No manager found')
      return
    }
    
    console.log(`📊 Manager: ${manager.name}`)
    
    // Get all approvals for this manager
    const allApprovals = await prisma.approval.findMany({
      where: { approverId: manager.id },
      include: {
        expense: {
          select: {
            description: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📋 Total Approvals for Manager: ${allApprovals.length}`)
    
    const pending = allApprovals.filter(a => a.status === 'PENDING')
    const approved = allApprovals.filter(a => a.status === 'APPROVED')
    const rejected = allApprovals.filter(a => a.status === 'REJECTED')
    
    console.log(`\n📊 Approval Stats:`)
    console.log(`  ⏳ Pending: ${pending.length}`)
    console.log(`  ✅ Approved: ${approved.length}`)
    console.log(`  ❌ Rejected: ${rejected.length}`)
    
    console.log(`\n📝 Detailed Breakdown:`)
    allApprovals.forEach(approval => {
      console.log(`  ${approval.status}: ${approval.expense.description} - ₹${approval.expense.amount}`)
    })
    
    // Check current month stats
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonth = allApprovals.filter(a => {
      const approvalDate = new Date(a.expense.createdAt)
      return approvalDate.getMonth() === currentMonth && 
             approvalDate.getFullYear() === currentYear
    })
    
    console.log(`\n📅 This Month: ${thisMonth.length} approvals`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApprovalStats()