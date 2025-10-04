const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixManagerAssignments() {
  try {
    console.log('🔍 Checking current users...')
    
    // Get all users in the company
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
    
    console.log('\n📋 Current Users:')
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.name} (${user.email}) - Manager: ${user.managerId || 'None'}`)
    })
    
    // Find managers and admins
    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN')
    const employees = users.filter(u => u.role === 'EMPLOYEE' && !u.managerId)
    
    console.log(`\n👔 Found ${managers.length} managers/admins`)
    console.log(`👷 Found ${employees.length} employees without managers`)
    
    if (managers.length === 0) {
      console.log('\n❌ No managers found! Creating a manager...')
      
      // Promote the first user to manager or create one
      if (users.length > 0) {
        const firstUser = users[0]
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { role: 'MANAGER' }
        })
        console.log(`✅ Promoted ${firstUser.name} to MANAGER`)
        managers.push({ ...firstUser, role: 'MANAGER' })
      }
    }
    
    if (employees.length > 0 && managers.length > 0) {
      console.log('\n🔧 Assigning managers to employees...')
      
      const defaultManager = managers[0] // Use first manager as default
      
      for (const employee of employees) {
        await prisma.user.update({
          where: { id: employee.id },
          data: { managerId: defaultManager.id }
        })
        console.log(`✅ Assigned ${defaultManager.name} as manager for ${employee.name}`)
      }
    }
    
    console.log('\n✅ Manager assignments completed!')
    
    // Show final state
    const updatedUsers = await prisma.user.findMany({
      include: {
        manager: {
          select: { name: true, email: true, role: true }
        }
      }
    })
    
    console.log('\n📋 Final User Structure:')
    updatedUsers.forEach(user => {
      console.log(`  ${user.role}: ${user.name} → Manager: ${user.manager?.name || 'None'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixManagerAssignments()