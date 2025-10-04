const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixManagerRoleAssignments() {
  try {
    console.log('🔧 Fixing manager role assignments...\n')
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        companyId: true
      },
      orderBy: { role: 'asc' }
    })
    
    console.log('📋 Current Users:')
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.name} (${user.email})`)
    })
    
    // Find managers (people with MANAGER role)
    const managers = users.filter(u => u.role === 'MANAGER')
    const employees = users.filter(u => u.role === 'EMPLOYEE')
    
    console.log(`\n👔 Found ${managers.length} users with MANAGER role`)
    console.log(`👷 Found ${employees.length} employees`)
    
    if (managers.length === 0) {
      console.log('\n❌ No MANAGER role users found! Need to assign MANAGER role to someone.')
      
      // Find an admin or create a manager
      const admins = users.filter(u => u.role === 'ADMIN')
      if (admins.length > 0) {
        // Promote one admin to manager
        const adminToPromote = admins[0]
        await prisma.user.update({
          where: { id: adminToPromote.id },
          data: { role: 'MANAGER' }
        })
        console.log(`✅ Changed ${adminToPromote.name} from ADMIN to MANAGER`)
        managers.push({ ...adminToPromote, role: 'MANAGER' })
      }
    }
    
    if (managers.length > 0) {
      console.log('\n🔧 Assigning MANAGER to employees...')
      
      const primaryManager = managers[0] // Use first manager
      
      for (const employee of employees) {
        // Only update if they don't have the right manager or have admin as manager
        const currentManager = users.find(u => u.id === employee.managerId)
        
        if (!employee.managerId || !currentManager || currentManager.role !== 'MANAGER') {
          await prisma.user.update({
            where: { id: employee.id },
            data: { managerId: primaryManager.id }
          })
          console.log(`✅ Assigned ${primaryManager.name} (MANAGER) to ${employee.name}`)
        } else {
          console.log(`✅ ${employee.name} already has correct MANAGER: ${currentManager.name}`)
        }
      }
    }
    
    // Update approval records to use the correct manager
    console.log('\n🔧 Updating existing approval records...')
    
    const approvals = await prisma.approval.findMany({
      include: {
        approver: true,
        expense: {
          include: {
            user: true
          }
        }
      }
    })
    
    for (const approval of approvals) {
      if (approval.approver.role !== 'MANAGER') {
        console.log(`Fixing approval for ${approval.expense.description}...`)
        
        // Find the correct manager for this expense user
        const expenseUser = await prisma.user.findUnique({
          where: { id: approval.expense.userId },
          include: {
            manager: true
          }
        })
        
        if (expenseUser.manager && expenseUser.manager.role === 'MANAGER') {
          await prisma.approval.update({
            where: { id: approval.id },
            data: { approverId: expenseUser.manager.id }
          })
          console.log(`  ✅ Updated approver to ${expenseUser.manager.name} (MANAGER)`)
        }
      }
    }
    
    // Show final state
    console.log('\n📋 Final State:')
    const finalUsers = await prisma.user.findMany({
      include: {
        manager: {
          select: { name: true, role: true }
        }
      }
    })
    
    finalUsers.forEach(user => {
      console.log(`  ${user.role}: ${user.name} → Manager: ${user.manager?.name} (${user.manager?.role || 'None'})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixManagerRoleAssignments()