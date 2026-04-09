import nodemailer from "nodemailer";

export const sendOTPVerificationEmail = async (email: string, otpCode: string) => {
  // GELİŞTİRME MODU: E-posta göndermek yerine kodu VS Code terminaline yazdır
  if (process.env.NODE_ENV !== "production") {
    console.log("\n=========================================");
    console.log(`🚀 YENİ KULLANICI KAYDI: ${email}`);
    console.log(`🔑 OTP KODUNUZ: [ ${otpCode} ]`);
    console.log("=========================================\n");
    return { success: true };
  }

  // CANLI (PRODUCTION) MODU İÇİN YEDEK KOD (İleride Resend vb. ile değiştireceğiz)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AI Content Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Authentication Code",
      html: `<h2>Your code is: ${otpCode}</h2>`,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Sending Error:", error);
    return { success: false, error: "Failed to send verification email." };
  }
};