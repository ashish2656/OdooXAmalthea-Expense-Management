const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testManagerPortalSections() {
  try {
    console.log('📊 Testing Complete Manager Portal Sections...\n')
    
    // Find the manager
    const manager = await prisma.user.findFirst({
      where: { role: 'MANAGER' }
    })
    
    console.log(`👔 Manager: ${manager.name}`)
    
    // Get pending approvals
    const pending = await prisma.approval.findMany({
      where: { approverId: manager.id, status: 'PENDING' },
      include: {
        expense: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })
    
    // Get approved approvals  
    const approved = await prisma.approval.findMany({
      where: { approverId: manager.id, status: 'APPROVED' },
      include: {
        expense: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })
    
    // Get rejected approvals
    const rejected = await prisma.approval.findMany({
      where: { approverId: manager.id, status: 'REJECTED' },
      include: {
        expense: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })
    
    console.log('\n📊 MANAGER PORTAL SECTIONS:')
    
    console.log('\n⏳ PENDING APPROVALS SECTION:')
    if (pending.length === 0) {
      console.log('  📝 "No pending approvals - All expenses are up to date"')
    } else {
      pending.forEach(approval => {
        console.log(`  📝 ${approval.expense.description} by ${approval.expense.user.name} - ₹${approval.expense.amount}`)
      })
    }
    
    console.log('\n✅ APPROVED EXPENSES SECTION:')
    if (approved.length === 0) {
      console.log('  📝 "No approved expenses yet - Approved expenses will appear here"')
    } else {
      approved.forEach(approval => {
        console.log(`  ✅ ${approval.expense.description} by ${approval.expense.user.name} - ₹${approval.expense.amount}`)
        if (approval.comments) {
          console.log(`      💬 Approval Note: ${approval.comments}`)
        }
      })
    }
    
    console.log('\n❌ REJECTED EXPENSES SECTION:')
    if (rejected.length === 0) {
      console.log('  📝 "No rejected expenses - Rejected expenses will appear here"')
    } else {
      rejected.forEach(approval => {
        console.log(`  ❌ ${approval.expense.description} by ${approval.expense.user.name} - ₹${approval.expense.amount}`)
        if (approval.comments) {
          console.log(`      💬 Rejection Reason: ${approval.comments}`)
        }
      })
    }
    
    console.log('\n📈 STATISTICS:')
    console.log(`  Pending: ${pending.length}`)
    console.log(`  Approved: ${approved.length}`)
    console.log(`  Rejected: ${rejected.length}`)
    console.log(`  Total: ${pending.length + approved.length + rejected.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testManagerPortalSections()