"use server";

import prisma from "@/lib/db/prisma";
import { userAuthSchema, UserAuthInput } from "@/lib/validations/auth";
import { sendOTPVerificationEmail } from "@/lib/email/sender";
import bcrypt from "bcryptjs";

// Generate a random 6-digit numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const initiateRegistration = async (data: UserAuthInput) => {
  try {
    // 1. Zod Validation
    const parsedData = userAuthSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid input data." };
    }

    const { email, password } = parsedData.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email is already registered." };
    }

    // 3. Generate OTP and Expiration (10 minutes from now)
    const otpCode = generateOTP();
    const expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    // 4. Delete any existing OTP for this email to prevent spam issues
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    // 5. Save the new OTP to the database
    await prisma.verificationToken.create({
      data: {
        email,
        token: otpCode, // Note: For ultra-high security, this could also be hashed. But plain text is standard for short-lived 6-digit codes.
        expires: expiresAt,
      },
    });

    // 6. Send the Email
    const emailResult = await sendOTPVerificationEmail(email, otpCode);
    
    if (!emailResult.success) {
      return { success: false, error: "Could not send OTP email. Please try again." };
    }

    // We DO NOT create the user yet. We wait for OTP verification.
    // Instead, we will pass the hashed password to the client securely, or store it temporarily.
    // For best practice, we hash it now and return it to be passed in the verification step.
    const hashedPassword = await bcrypt.hash(password, 12);

    return { 
      success: true, 
      message: "OTP sent successfully.",
      tempHash: hashedPassword // Safe to send to client temporarily, cannot be reversed
    };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
};