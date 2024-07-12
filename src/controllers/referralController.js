const prisma = require("../config/prismaClient");
const { validateReferral } = require("../utils/validator");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const createReferral = async (req, res, next) => {
  const { name, email, referredName, referredEmail, message } = req.body;

  const validationError = validateReferral(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const referral = prisma.referral.create({
      data: { name, email, referredName, referredEmail, message },
    });

    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GMAIL_USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      const mailOptions = {
        from: `<${process.env.GMAIL_USER}>`,
        to: referredEmail,
        subject: "You have been referred!",
        text: `Hi ${referredName},\n\nYou have been referred by ${name}.\n\nContact ${name} at ${email}`,
        html: `<p>Hi ${referredName},</p><p>${name} (${email}) has referred you.</p>
        <p>Best regards,<br>accredian</p>
        <p></p>
        <p>This automated email has been generated for testing purposes. If you receive any unintended messages, I sincerely apologize for any inconvenience caused. Please inform me at ${process.env.GMAIL_USER} so I can address the issue promptly. Thank you for your understanding and cooperation.</p>
        `,
      };

      const result = await transport.sendMail(mailOptions);

      res.status(201).json(referral);
      return result;
    } catch (error) {
      throw new Error("Error sending referral email");
    }
  } catch (error) {
    console.log("in catch block");
    next(error);
  }
  console.log("end of try block");
};

module.exports = {
  createReferral,
};
