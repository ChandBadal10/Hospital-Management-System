import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: Number(this.configService.get<string>("SMTP_PORT")),
      secure: false, // true only for port 465
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `"Hospital Management System" <${this.configService.get<string>(
        "SENDER_EMAIL",
      )}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Password Reset</h2>

          <p>Hello,</p>

          <p>Your OTP for resetting your password is:</p>

          <h1 style="letter-spacing:5px; color:#2563eb;">
            ${otp}
          </h1>

          <p>This OTP is valid for <b>5 minutes</b>.</p>

          <p>If you didn't request a password reset, you can safely ignore this email.</p>

          <br/>

          <p>Regards,</p>
          <p><strong>Hospital Management System</strong></p>
        </div>
      `,
    });
  }

  async sendDoctorCredentials(
    email: string,
    password: string,
    ) {
    await this.transporter.sendMail({
      from: `"Hospital Management System" <${this.configService.get("SENDER_EMAIL")}>`,
      to: email,
      subject: "Doctor Account Created",

      html: `
        <h2>Welcome Doctor</h2>

        <p>Your account has been created successfully.</p>

        <p><b>Email:</b> ${email}</p>

        <p><b>Temporary Password:</b> ${password}</p>

        <p>Please login and change your password immediately.</p>
      `,
    });
  }
}