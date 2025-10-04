import nodemailer from 'nodemailer'

// Configure email transporter (you'll need to set up your email service)
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
})

// Send password reset email
export const sendPasswordEmail = async (email, password, isNewUser = false) => {
  const subject = isNewUser ? 'Welcome to Expense Management - Your Account Details' : 'Password Reset - Expense Management'
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Expense Management System</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">
          ${isNewUser ? 'Welcome to our platform!' : 'Password Reset'}
        </h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          ${isNewUser 
            ? 'Your account has been created successfully. Here are your login credentials:' 
            : 'Your password has been reset. Here are your new login credentials:'
          }
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0; color: #333;"><strong>Password:</strong> ${password}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          For security reasons, please change your password after logging in.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/login" 
             style="background: #667eea; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
      </div>
    </div>
  `

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@expensemanagement.com',
    to: email,
    subject,
    html
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}