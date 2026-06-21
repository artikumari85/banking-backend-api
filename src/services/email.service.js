require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,name){
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThanku you for registering at Backend Ledger.
    We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    // const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger.We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`

    const html = `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">

  <img
    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f"
    alt="Finance Banner"
    style="width: 100%; height: 220px; object-fit: cover;"
  />

  <div style="padding: 20px;">
    <h2 style="color: #2563eb;">
      Welcome to Backend Ledger 🎉
    </h2>

    <p>Hello <strong>${name}</strong>,</p>

    <p>
      Thank you for registering with <strong>Backend Ledger</strong>.
      Your account has been created successfully.
    </p>

    <p>
      You can now securely manage and track your financial records using Backend Ledger.
    </p>

    <p>
      We're excited to have you on board and hope you enjoy using our platform.
    </p>

    <p>
      Best Regards,<br>
      <strong>Backend Ledger Team</strong>
    </p>
  </div>

</div>
`;
    await sendEmail(userEmail,subject,text,html);
}


async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";

  const text = `Hello ${name},

Your transaction of $${amount} to account ${toAccount} was successful.

Thank you for using our service.

Regards,
The Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> was successful.</p>
    <p>Thank you for using our service.</p>
    <p>Regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
} 

async function sendEmailTransactionFailureEmail(
  userEmail,
  name,
  amount,
  accountNumber
) {
  const subject = "Transaction Failed";

  const text = `Hello ${name},

We regret to inform you that your transaction of $${amount} to account ${accountNumber} could not be processed.

Please check your account details and try again. If the issue persists, contact our support team.

Regards,
Banking Team`;

  const html = `
    <p>Hello ${name},</p>

    <p>We regret to inform you that your transaction of <strong>$${amount}</strong> to account <strong>${accountNumber}</strong> could not be processed.</p>

    <p>Please check your account details and try again. If the issue persists, contact our support team.</p>

    <p>Regards,<br>Banking Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}


module.exports={
    sendRegistrationEmail,
    sendTransactionEmail,
    sendEmailTransactionFailureEmail
}