import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAILJET_HOST,
  port: Number(process.env.MAILJET_PORT),
  secure: false,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  },
  tls:{
    rejectUnauthorized:true
  }
});
