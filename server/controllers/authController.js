const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendResetOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'TransitOps Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #475569;">Use the following one-time password to verify your account and reset your password.</p>
        <div style="margin: 22px 0; padding: 16px 20px; background: #f8fafc; border-radius: 10px; font-size: 28px; letter-spacing: 6px; font-weight: 700; text-align: center;">${otp}</div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Server error during user registration.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const emailTrimmed = email.trim().toLowerCase();
    // Explicitly select the password hash since it is set to select: false in the Schema
    const user = await User.findOne({ email: emailTrimmed }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Reject inactive users
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Contact the administrator.'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during user login.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a password reset code has been sent to the email address.' });
    }

    const otp = generateOtp();
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendResetOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error('Password reset email error:', emailError.message);
    }

    return res.status(200).json({
      message: 'A one-time password has been sent to your email.',
      otp
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ message: 'Server error during password reset request.' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verify OTP Request Body:', { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? { email: user.email, hasOtp: !!user.passwordResetOtp, expires: user.passwordResetOtpExpires } : 'No User');
    
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    if (new Date(user.passwordResetOtpExpires) < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    const isOtpMatch = otp.toString().trim() === user.passwordResetOtp;
    console.log('OTP Match Result:', isOtpMatch);
    
    if (!isOtpMatch) {
      return res.status(400).json({ message: 'Invalid reset code.' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    return res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and the new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    if (new Date(user.passwordResetOtpExpires) < new Date()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    const isOtpMatch = otp.toString().trim() === user.passwordResetOtp;
    if (!isOtpMatch) {
      return res.status(400).json({ message: 'Invalid reset code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Password updated successfully. You can sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ message: 'Server error during password reset.' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current password.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one uppercase letter.' });
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must contain at least one special character.' });
    }

    // Explicitly select the password hash
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error.message);
    return res.status(500).json({ message: 'Server error during password update.' });
  }
};
const getCurrentUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User profile not found.' });
  }
  return res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getCurrentUserProfile
};
