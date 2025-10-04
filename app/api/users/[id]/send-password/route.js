import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword, generateRandomPassword } from '@/lib/auth'
import { sendPasswordEmail } from '@/lib/email'

export async function POST(request, { params }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const { id } = params

    // Find user
    const user = await prisma.user.findUnique({
      where: { 
        id,
        companyId: decoded.companyId // Ensure user belongs to same company
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new random password
    const newPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    // Send email with new password
    const emailResult = await sendPasswordEmail(user.email, newPassword, false)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'New password has been sent to user\'s email'
    })

  } catch (error) {
    console.error('Send password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}