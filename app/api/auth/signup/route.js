import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { name, email, password, confirmPassword, country } = await request.json()

    // Validation
    if (!name || !email || !password || !confirmPassword || !country) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Fetch currency for the country
    let currency = 'USD' // default
    try {
      const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=currencies`)
      const countryData = await countryResponse.json()
      if (countryData && countryData[0] && countryData[0].currencies) {
        const currencyCode = Object.keys(countryData[0].currencies)[0]
        currency = currencyCode
      }
    } catch (error) {
      console.error('Error fetching currency:', error)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: `${name}'s Company`,
          country,
          currency
        }
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id
        }
      })

      return { company, user }
    })

    // Generate JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.user.companyId
    })

    // Create response with JWT cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        }
      },
      { status: 201 }
    )

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}