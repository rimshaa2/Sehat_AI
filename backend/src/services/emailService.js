const nodemailer = require("nodemailer");

// ── Transporter Setup ─────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Send Appointment Confirmation to Patient ──────────────────────────────────
const sendPatientConfirmation = async ({
  patientEmail,
  patientName,
  doctorName,
  specialty,
  appointmentDate,
  timeSlot,
  reason,
  amount,
  paymentMethod,
  appointmentId,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping patient email");
    return;
  }

  const paymentText =
    paymentMethod === "cash"
      ? "Cash on Visit — please bring exact amount"
      : `Paid online — Rs. ${amount}`;

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #199A8E, #0d7a6e); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; color: #1C2A3A; margin-bottom: 24px; }
    .card { background: #F0FDF9; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #199A8E; }
    .card-title { font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #D1FAE5; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B7280; font-size: 14px; }
    .detail-value { color: #1C2A3A; font-size: 14px; font-weight: 600; }
    .amount-box { background: #199A8E; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .amount-box p { color: rgba(255,255,255,0.8); margin: 0 0 4px; font-size: 13px; }
    .amount-box h2 { color: white; margin: 0; font-size: 28px; }
    .tip { background: #FFF8E1; border-radius: 8px; padding: 14px; font-size: 13px; color: #856404; margin-top: 20px; }
    .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; font-size: 12px; color: #9CA3AF; }
    .id-badge { display: inline-block; background: #E5E7EB; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #374151; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Appointment Confirmed!</h1>
      <p>Your booking has been successfully placed</p>
    </div>
    <div class="body">
      <p class="greeting">Dear <strong>${patientName}</strong>,</p>
      <p style="color:#6B7280;font-size:14px;">Your appointment has been confirmed. Here are the details:</p>

      <div class="card">
        <div class="card-title">Doctor Information</div>
        <div class="detail-row">
          <span class="detail-label">Doctor</span>
          <span class="detail-value">Dr. ${doctorName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Specialization</span>
          <span class="detail-value">${specialty || "General Physician"}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Appointment Details</div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${appointmentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${timeSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reason</span>
          <span class="detail-value">${reason || "General Consultation"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking ID</span>
          <span class="detail-value"><span class="id-badge">#${appointmentId}</span></span>
        </div>
      </div>

      <div class="amount-box">
        <p>Total Amount</p>
        <h2>Rs. ${amount}</h2>
        <p style="font-size:12px;margin-top:4px;">${paymentText}</p>
      </div>

      <div class="tip">
        💡 <strong>Reminder:</strong> Please arrive 10 minutes before your appointment time. Bring any relevant medical documents or previous prescriptions.
      </div>

      <p style="color:#6B7280;font-size:13px;margin-top:20px;">
        To cancel or reschedule, please open the Sehat AI app at least 2 hours before your appointment.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation from <strong>Sehat AI</strong></p>
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Sehat AI <${process.env.EMAIL_USER}>`,
    to: patientEmail,
    subject: `✅ Appointment Confirmed — Dr. ${doctorName} on ${appointmentDate}`,
    html,
  });

  console.log(`✅ Confirmation email sent to ${patientEmail}`);
};

// ── Send Notification to Doctor ───────────────────────────────────────────────
const sendDoctorNotification = async ({
  doctorEmail,
  doctorName,
  patientName,
  appointmentDate,
  timeSlot,
  reason,
  appointmentId,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping doctor email");
    return;
  }

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1565C0, #0d47a1); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .card { background: #EFF6FF; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #1565C0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #DBEAFE; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6B7280; font-size: 14px; }
    .detail-value { color: #1C2A3A; font-size: 14px; font-weight: 600; }
    .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Appointment Booked</h1>
    </div>
    <div class="body">
      <p>Dear <strong>Dr. ${doctorName}</strong>,</p>
      <p style="color:#6B7280;font-size:14px;">A new appointment has been booked with you:</p>
      <div class="card">
        <div class="detail-row">
          <span class="detail-label">Patient</span>
          <span class="detail-value">${patientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${appointmentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${timeSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reason</span>
          <span class="detail-value">${reason || "General Consultation"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking ID</span>
          <span class="detail-value">#${appointmentId}</span>
        </div>
      </div>
      <p style="color:#6B7280;font-size:13px;">Please log in to the Sehat AI Doctor Portal to manage this appointment.</p>
    </div>
    <div class="footer">Sehat AI — Doctor Portal Notification</div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Sehat AI <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: `📅 New Appointment — ${patientName} on ${appointmentDate} at ${timeSlot}`,
    html,
  });

  console.log(`✅ Doctor notification email sent to ${doctorEmail}`);
};

// ── Send Welcome Email to Doctor ────────────────────────────────────────────────
const sendDoctorWelcomeEmail = async ({
  doctorEmail,
  doctorName,
  tempPassword,
  resetLink,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping doctor welcome email");
    return;
  }

  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginUrl = `${frontendUrl}/doctor-login`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #199A8E, #0d7a6e); padding: 40px 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; color: #0f172a; margin-bottom: 16px; font-weight: 700; }
    .intro { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9; }
    .card-title { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { color: #0f172a; font-size: 14px; font-weight: 600; }
    .detail-value.password-badge { font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .cta-container { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background-color: #199A8E; color: white !important; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(25, 154, 142, 0.15); transition: background-color 0.2s; }
    .divider { height: 1px; background: #f1f5f9; margin: 32px 0; }
    .reset-section { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 20px; }
    .reset-title { color: #115e59; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; }
    .reset-text { color: #14b8a6; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5; }
    .reset-button { display: inline-block; background-color: #14b8a6; color: white !important; font-weight: 700; font-size: 13px; padding: 8px 16px; text-decoration: none; border-radius: 6px; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Welcome to Sehat AI</h1>
      <p>Your Professional Doctor Account is Ready</p>
    </div>
    <div class="body">
      <p class="greeting">Dear Dr. ${doctorName},</p>
      <p class="intro">
        An administrator has registered your professional account on the <strong>Sehat AI Healthcare Network</strong>. 
        You now have access to your digital clinic where you can manage appointments, patients, and digital prescriptions.
      </p>

      <div class="card">
        <div class="card-title">Login Credentials</div>
        <div class="detail-row">
          <span class="detail-label">Email Address</span>
          <span class="detail-value">${doctorEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Temporary Password</span>
          <span class="detail-value"><code class="password-badge">${tempPassword}</code></span>
        </div>
      </div>

      <div class="cta-container">
        <a href="${loginUrl}" target="_blank" class="cta-button">Log In to Doctor Portal</a>
      </div>

      <div class="reset-section">
        <h4 class="reset-title">🔒 Set a Custom Password</h4>
        <p class="reset-text">
          For your security, we highly recommend setting your own password before logging in. 
          Use the secure link below to set up your password:
        </p>
        <a href="${resetLink}" target="_blank" class="reset-button">Set Custom Password</a>
      </div>

      <div class="divider"></div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
        <strong>Note:</strong> If you did not expect this email or are not associated with Sehat AI, please contact our support team immediately.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message from <strong>Sehat AI Healthcare Network</strong></p>
      <p>Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Sehat AI <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: `🏥 Welcome to Sehat AI — Your Account Credentials`,
    html,
  });

  console.log(`✅ Welcome email sent to Dr. ${doctorName} at ${doctorEmail}`);
};

module.exports = {
  sendPatientConfirmation,
  sendDoctorNotification,
  sendDoctorWelcomeEmail,
};