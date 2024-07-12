const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendReferralEmail = async (referral) => {
  const { name, email, referredName, referredEmail, message } = referral;
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
      text: `Hi ${referredName},\n\nYou have been referred by ${name}.\n\nMessage: ${message}\n\nContact ${name} at ${email}`,
      html: `<p>Hi ${referredName},</p><p>${name} (${email}) has referred you.</p><p>Best regards,<br>accredian</p>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending referral email");
  }
};

module.exports = {
  sendReferralEmail,
};
