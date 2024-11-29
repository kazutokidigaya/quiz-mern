import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("Email sent: ", info.response); // Log the email response for debugging
    return info; // Return the response to the caller
  } catch (error) {
    console.error("Error in sendEmail:", error); // Log the error for debugging
    return null; // Return null to indicate failure
  }
};

export default sendEmail;
