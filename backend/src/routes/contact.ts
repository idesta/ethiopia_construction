import { Router, Request, Response } from "express";
import { Resend } from "resend";
import { db } from "../db/client";

const router = Router();
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;
const MAIL_FROM = process.env.MAIL_FROM || "ethioconstruction.abrdns.com";

// POST /api/contact
router.post("/", async (req: Request, res: Response) => {
  const { slug, name, phone, email, service, message } = req.body;

  // Validate required fields
  if (!slug || !name || !message) {
    res.status(400).json({ message: "slug, name and message are required" });
    return;
  }

  try {
    // Look up the company and its contact email from DB
    const result = await db.query(
      `SELECT t.name, t.slug, c.email
       FROM tenants t
       LEFT JOIN contacts c ON c.tenant_id = t.id
       WHERE t.slug = $1 AND t.is_active = TRUE`,
      [slug],
    );

    const company = result.rows[0];
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (!company.email) {
      res
        .status(400)
        .json({ message: "This company has no contact email configured" });
      return;
    }

    // Build the email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #f4a61d; margin: 0;">New Enquiry — ${company.name}</h2>
        </div>
        <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0;">
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; width: 120px; font-weight: bold;">Full Name</td>
              <td style="padding: 10px 0; color: #1a1a1a;">${name}</td>
            </tr>
            ${
              email
                ? `
            <tr>
              <td style="padding: 10px 0; color: #666; font-weight: bold;">Email</td>
              <td style="padding: 10px 0; color: #1a1a1a;">
                <a href="mailto:${email}" style="color: #1a3a5c;">${email}</a>
              </td>
            </tr>`
                : ""
            }
            ${
              phone
                ? `
            <tr>
              <td style="padding: 10px 0; color: #666; font-weight: bold;">Phone</td>
              <td style="padding: 10px 0; color: #1a1a1a;">${phone}</td>
            </tr>`
                : ""
            }
            ${
              service
                ? `
            <tr>
              <td style="padding: 10px 0; color: #666; font-weight: bold;">Service</td>
              <td style="padding: 10px 0; color: #1a1a1a;">${service}</td>
            </tr>`
                : ""
            }
            <tr>
              <td colspan="2" style="padding: 16px 0 6px; color: #666; font-weight: bold; border-top: 1px solid #e0e0e0;">
                Message
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 0; color: #1a1a1a; line-height: 1.6;">
                ${message.replace(/\n/g, "<br/>")}
              </td>
            </tr>
          </table>
        </div>
        <div style="background: #f0f0f0; padding: 14px 24px; border-radius: 0 0 8px 8px;
                    font-size: 12px; color: #888; border: 1px solid #e0e0e0; border-top: none;">
          Sent via ${company.name} website contact form
        </div>
      </div>
    `;

    // If Resend is not configured, accept the contact form and return success
    // so the frontend works while email integration is still being configured.
    if (!resend) {
      console.warn("Resend API key not configured; skipping email send.");
      res.json({
        success: true,
        message:
          "Message received. Email service is not configured, so no email was sent.",
      });
      return;
    }

    try {
      const result = await resend.emails.send({
        from: MAIL_FROM,
        to: company.email,
        replyTo: email || undefined,
        subject: `New Enquiry from ${name} — ${company.name}`,
        html,
      });

      if ((result as any).error) {
        console.error("Resend error:", (result as any).error);
        res.status(500).json({ message: "Failed to send email" });
        return;
      }
    } catch (err) {
      console.error("Resend send error:", err);
      res.status(500).json({ message: "Failed to send email" });
      return;
    }

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
