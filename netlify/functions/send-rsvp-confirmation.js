const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizePhoneNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    return digits ? `+${digits}` : "";
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return "";
}

function getDisplayName(payload) {
  return payload.householdName || payload.lookupName || "there";
}

function getGuestSummary(guests) {
  const list = Array.isArray(guests) ? guests : [];
  const attendingGuests = list.filter((guest) => guest?.attending).map((guest) => guest.name).filter(Boolean);
  const declinedGuests = list.filter((guest) => guest && guest.attending === false).map((guest) => guest.name).filter(Boolean);

  return {
    attendingGuests,
    declinedGuests,
    attendingCount: attendingGuests.length,
    declinedCount: declinedGuests.length,
  };
}

function getConfirmationCopy(payload) {
  const isSpanish = payload.language === "es";
  const displayName = getDisplayName(payload);
  const websiteUrl = payload.websiteUrl || "https://ginacarloswedding.com/";
  const summary = getGuestSummary(payload.guests);

  const contact = payload.contact || payload.email || payload.phone || "";
  const dietary = payload.dietaryNotes || "";
  const message = payload.message || "";

  const attendingList = summary.attendingGuests.length
    ? summary.attendingGuests.join(", ")
    : isSpanish
      ? "Ninguno"
      : "None";

  const declinedList = summary.declinedGuests.length
    ? summary.declinedGuests.join(", ")
    : isSpanish
      ? "Ninguno"
      : "None";

  const labels = isSpanish
    ? {
      subject: "Confirmación de RSVP para la boda de Gina y Carlos",
      title: "Confirmación de RSVP",
      greeting: "Hola",
      intro: "Recibimos tu RSVP. Gracias por tomarte el tiempo de responder.",
      attending: "Asistirán",
      notAttending: "No asistirán",
      contact: "Contacto",
      dietary: "Notas alimenticias",
      message: "Mensaje",
      detailsButton: "Ver detalles del evento",
      closingNote: "Si necesitas hacer algún cambio, por favor contáctanos directamente.",
      footer: "Con cariño",
      smsText: `Gina y Carlos: recibimos tu RSVP. Asistirán ${summary.attendingCount}. No asistirán ${summary.declinedCount}. Detalles: ${websiteUrl}`,
      dietaryFallback: "Ninguna",
      messageFallback: "Ninguno",
      contactFallback: "N/A",
    }
    : {
      subject: "RSVP confirmation for Gina & Carlos' wedding",
      title: "RSVP Confirmation",
      greeting: "Hi",
      intro: "We received your RSVP. Thank you for taking the time to respond.",
      attending: "Attending",
      notAttending: "Not attending",
      contact: "Contact",
      dietary: "Dietary notes",
      message: "Message",
      detailsButton: "View Event Details",
      closingNote: "If you need to make any changes, please contact us directly.",
      footer: "With love",
      smsText: `Gina & Carlos: we received your RSVP. Attending: ${summary.attendingCount}. Not attending: ${summary.declinedCount}. Details: ${websiteUrl}`,
      dietaryFallback: "None",
      messageFallback: "None",
      contactFallback: "N/A",
    };

  const emailText = [
    `${labels.greeting} ${displayName},`,
    "",
    labels.intro,
    "",
    `${labels.attending}: ${attendingList}`,
    `${labels.notAttending}: ${declinedList}`,
    "",
    `${labels.contact}: ${contact || labels.contactFallback}`,
    `${labels.dietary}: ${dietary || labels.dietaryFallback}`,
    `${labels.message}: ${message || labels.messageFallback}`,
    "",
    `${labels.detailsButton}: ${websiteUrl}`,
    "",
    labels.closingNote,
    "",
    `${labels.footer},`,
    "Gina & Carlos",
  ].join("\n");

  const emailHtml = `
    <div style="margin:0; padding:0; background:#340d12;">
      <div style="
        margin:0;
        padding:40px 16px;
        background:linear-gradient(180deg, #2a0c11 0%, #340d12 15%, #3d0b10 100%);
        font-family:Georgia, 'Times New Roman', serif;
        color:#f7f0e6;
      ">
        <div style="
          max-width:640px;
          margin:0 auto;
          background:#3d0b10;
          border:1px solid rgba(207, 171, 98, 0.42);
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 16px 40px rgba(34, 21, 23, 0.18);
        ">

          <div style="
            padding:32px 28px 20px;
            text-align:center;
            border-bottom:1px solid rgba(207, 171, 98, 0.22);
          ">
            <div style="
              text-transform:uppercase;
              letter-spacing:0.28em;
              font-size:12px;
              color:#cfab62;
              margin-bottom:12px;
            ">
              ${escapeHtml(labels.title)}
            </div>

            <h1 style="
              margin:0;
              font-size:38px;
              line-height:1;
              font-weight:500;
              color:#f7f0e6;
            ">
              Gina &amp; Carlos
            </h1>

            <p style="
              margin:16px 0 0;
              font-size:16px;
              line-height:1.7;
              color:#f7f0e6;
            ">
              ${escapeHtml(labels.intro)}
            </p>
          </div>

          <div style="padding:28px;">
            <h2 style="
              margin:0 0 18px;
              font-size:28px;
              line-height:1.1;
              font-weight:500;
              color:#f7f0e6;
            ">
              ${escapeHtml(labels.greeting)} ${escapeHtml(displayName)},
            </h2>

            <div style="
              background:rgba(247, 240, 230, 0.06);
              border:1px solid rgba(247, 240, 230, 0.12);
              border-radius:14px;
              padding:18px 18px 8px;
              margin-bottom:18px;
            ">
              <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#f7f0e6;">
                <strong style="color:#cfab62;">${escapeHtml(labels.attending)}:</strong>
                ${escapeHtml(attendingList)}
              </p>
              <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#f7f0e6;">
                <strong style="color:#cfab62;">${escapeHtml(labels.notAttending)}:</strong>
                ${escapeHtml(declinedList)}
              </p>
            </div>

            <div style="
              background:rgba(247, 240, 230, 0.06);
              border:1px solid rgba(247, 240, 230, 0.12);
              border-radius:14px;
              padding:18px 18px 8px;
              margin-bottom:24px;
            ">
              <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#f7f0e6;">
                <strong style="color:#cfab62;">${escapeHtml(labels.contact)}:</strong>
                ${escapeHtml(contact || labels.contactFallback)}
              </p>
              <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#f7f0e6;">
                <strong style="color:#cfab62;">${escapeHtml(labels.dietary)}:</strong>
                ${escapeHtml(dietary || labels.dietaryFallback)}
              </p>
              <p style="margin:0 0 10px; font-size:15px; line-height:1.7; color:#f7f0e6;">
                <strong style="color:#cfab62;">${escapeHtml(labels.message)}:</strong>
                ${escapeHtml(message || labels.messageFallback)}
              </p>
            </div>

            <div style="text-align:center; margin:28px 0 24px;">
              <a
                href="${escapeHtml(websiteUrl)}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  border-radius:999px;
                  background:linear-gradient(135deg, #cfab62 0%, #e3c17c 100%);
                  color:#3d0b10;
                  font-size:15px;
                  font-weight:700;
                  text-decoration:none;
                "
              >
                ${escapeHtml(labels.detailsButton)}
              </a>
            </div>

            <p style="
              margin:0;
              font-size:15px;
              line-height:1.8;
              color:#f7f0e6;
            ">
              ${escapeHtml(labels.closingNote)}
            </p>
          </div>

          <div style="
            padding:18px 28px 26px;
            text-align:center;
            border-top:1px solid rgba(207, 171, 98, 0.22);
          ">
            <p style="
              margin:0;
              font-size:14px;
              line-height:1.8;
              color:#cfab62;
              letter-spacing:0.08em;
            ">
              ${escapeHtml(labels.footer)},<br>
              <span style="color:#f7f0e6; letter-spacing:normal;">Gina &amp; Carlos</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  `;

  return {
    subject: labels.subject,
    smsText: labels.smsText,
    emailText,
    emailHtml,
  };
}

async function sendEmailConfirmation(email, copy) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RSVP_CONFIRMATION_FROM_EMAIL;
  const replyTo = process.env.RSVP_CONFIRMATION_REPLY_TO;

  if (!apiKey || !fromEmail) {
    return { status: "skipped", reason: "email_provider_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      reply_to: replyTo ? [replyTo] : undefined,
      subject: copy.subject,
      html: copy.emailHtml,
      text: copy.emailText,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      status: "error",
      reason: result?.message || "email_send_failed",
    };
  }

  return {
    status: "sent",
    id: result?.id || null,
  };
}

async function sendSmsConfirmation(phone, copy) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
    return { status: "skipped", reason: "sms_provider_not_configured" };
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) {
    return { status: "skipped", reason: "invalid_phone_number" };
  }

  const body = new URLSearchParams({
    To: normalizedPhone,
    Body: copy.smsText,
  });

  if (messagingServiceSid) {
    body.set("MessagingServiceSid", messagingServiceSid);
  } else {
    body.set("From", fromNumber);
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      status: "error",
      reason: result?.message || "sms_send_failed",
    };
  }

  return {
    status: "sent",
    id: result?.sid || null,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_error) {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const email = String(payload.email || "").trim();
  const phone = String(payload.phone || "").trim();

  if (!email && !phone) {
    return jsonResponse(200, {
      ok: true,
      channels: {
        email: { status: "skipped", reason: "missing_recipient" },
        sms: { status: "skipped", reason: "missing_recipient" },
      },
    });
  }

  const copy = getConfirmationCopy(payload);
  const channels = {
    email: email ? await sendEmailConfirmation(email, copy) : { status: "skipped", reason: "missing_recipient" },
    sms: phone ? await sendSmsConfirmation(phone, copy) : { status: "skipped", reason: "missing_recipient" },
  };

  const ok = [channels.email, channels.sms].every(
    (channel) => channel.status === "sent" || channel.status === "skipped"
  );

  return jsonResponse(200, { ok, channels });
};
