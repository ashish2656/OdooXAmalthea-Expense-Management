import { prisma } from '@/lib/prisma'

// Check if user can access expense (role-based)
export async function canAccessExpense(userId, userRole, expenseId) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      user: {
        select: { id: true, managerId: true, companyId: true }
      }
    }
  })

  if (!expense) return false

  switch (userRole) {
    case 'ADMIN':
      return true // Admin can access all expenses
    
    case 'MANAGER':
      // Managers can access their team's expenses
      const teamMembers = await prisma.user.findMany({
        where: { managerId: userId },
        select: { id: true }
      })
      const teamMemberIds = teamMembers.map(member => member.id)
      return teamMemberIds.includes(expense.user.id) || expense.user.id === userId
    
    case 'EMPLOYEE':
      return expense.user.id === userId // Employees can only access their own expenses
    
    default:
      return false
  }
}

// Get approval workflow for expense
export async function getApprovalWorkflow(expenseId, companyId, amount) {
  const rules = await prisma.approvalRule.findMany({
    where: {
      companyId,
      isActive: true
    },
    include: {
      specialApprover: {
        select: { id: true, name: true, email: true, role: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const workflow = []
  let stepOrder = 1

  for (const rule of rules) {
    switch (rule.ruleType) {
      case 'PERCENTAGE':
        // Auto-approve if amount is within threshold
        if (rule.threshold && amount <= rule.maxAmount) {
          return [] // No approval needed
        }
        break
      
      case 'SPECIFIC_APPROVER':
        if (rule.specialApprover) {
          workflow.push({
            stepOrder,
            approverId: rule.specialApprover.id,
            approver: rule.specialApprover,
            rule
          })
          stepOrder++
        }
        break
      
      case 'HYBRID':
        // Combine percentage and specific approver logic
        if (rule.threshold && amount > rule.maxAmount && rule.specialApprover) {
          workflow.push({
            stepOrder,
            approverId: rule.specialApprover.id,
            approver: rule.specialApprover,
            rule
          })
          stepOrder++
        }
        break
    }
  }

  return workflow
}

// Create approval entries for expense
export async function createApprovalEntries(expenseId, workflow) {
  const approvals = []

  for (const step of workflow) {
    const approval = await prisma.approval.create({
      data: {
        expenseId,
        approverId: step.approverId,
        stepOrder: step.stepOrder,
        status: 'PENDING'
      },
      include: {
        approver: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })
    approvals.push(approval)
  }

  return approvals
}

// Process approval (approve/reject)
export async function processApproval(approvalId, status, comments, approverId) {
  return await prisma.$transaction(async (tx) => {
    // Update the approval
    const approval = await tx.approval.update({
      where: { id: approvalId },
      data: {
        status,
        comments,
        updatedAt: new Date()
      },
      include: {
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (status === 'REJECTED') {
      // If rejected, mark expense as rejected
      await tx.expense.update({
        where: { id: approval.expenseId },
        data: { status: 'REJECTED' }
      })
    } else if (status === 'APPROVED') {
      // Check if this is the last approval step
      const pendingApprovals = await tx.approval.findMany({
        where: {
          expenseId: approval.expenseId,
          status: 'PENDING',
          stepOrder: { gt: approval.stepOrder }
        }
      })

      if (pendingApprovals.length === 0) {
        // All approvals complete, mark expense as approved
        await tx.expense.update({
          where: { id: approval.expenseId },
          data: { status: 'APPROVED' }
        })
      }
    }

    return approval
  })
}

// Get expenses for manager (team expenses)
export async function getTeamExpenses(managerId, filters = {}) {
  const teamMembers = await prisma.user.findMany({
    where: { managerId },
    select: { id: true }
  })
  
  const teamMemberIds = teamMembers.map(member => member.id)
  teamMemberIds.push(managerId) // Include manager's own expenses

  const where = {
    userId: { in: teamMemberIds },
    ...filters
  }

  return await prisma.expense.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      approvals: {
        include: {
          approver: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { stepOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}