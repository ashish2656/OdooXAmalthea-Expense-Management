const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixManagerEmployeeRelationships() {
  try {
    console.log('🔧 Fixing Manager-Employee Relationships...\n')

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    })

    console.log('Current users:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - Manager ID: ${user.managerId}`)
    })

    // Find managers
    const managers = users.filter(u => u.role === 'MANAGER')
    const employees = users.filter(u => u.role === 'EMPLOYEE')

    if (managers.length === 0) {
      console.log('\n❌ No MANAGER role users found!')
      return
    }

    console.log(`\n📋 Found ${managers.length} managers and ${employees.length} employees`)

    // Assign the first manager to all employees who don't have a manager
    const primaryManager = managers[0]
    console.log(`\n👔 Assigning ${primaryManager.name} as manager to all employees...`)

    const employeesWithoutManager = employees.filter(emp => !emp.managerId)
    
    for (const employee of employeesWithoutManager) {
      await prisma.user.update({
        where: { id: employee.id },
        data: { managerId: primaryManager.id }
      })
      console.log(`  ✅ ${employee.name} → Manager: ${primaryManager.name}`)
    }

    // Now update existing pending approvals to be assigned to managers instead of admins
    console.log('\n🔄 Updating pending approvals to be assigned to managers...')

    const pendingApprovals = await prisma.approval.findMany({
      where: { status: 'PENDING' },
      include: {
        expense: {
          include: {
            user: true
          }
        },
        approver: true
      }
    })

    for (const approval of pendingApprovals) {
      const expense = approval.expense
      const expenseUser = expense.user

      // Get the user's manager
      const userWithManager = await prisma.user.findUnique({
        where: { id: expenseUser.id },
        include: {
          manager: true
        }
      })

      if (userWithManager.manager && userWithManager.manager.role === 'MANAGER') {
        // Update the approval to be assigned to the manager
        await prisma.approval.update({
          where: { id: approval.id },
          data: { approverId: userWithManager.manager.id }
        })
        console.log(`  ✅ Updated approval for "${expense.description}" → Manager: ${userWithManager.manager.name}`)
      }
    }

    console.log('\n🎉 Manager-Employee relationships fixed!')

  } catch (error) {
    console.error('Error fixing relationships:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixManagerEmployeeRelationships()