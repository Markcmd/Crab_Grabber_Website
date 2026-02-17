export async function sendSms({ to, message }) {
    const enabled = String(process.env.TWILIO_ENABLED).toLowerCase() === "true";
    if (!enabled) {
      // MVP: no-op
      return { ok: true, provider: "disabled", sid: null };
    }
  
    // Uncomment after: npm i twilio
    // import twilio from "twilio";
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const result = await client.messages.create({
    //   from: process.env.TWILIO_FROM_NUMBER,
    //   to,
    //   body: message,
    // });
    // return { ok: true, provider: "twilio", sid: result.sid };
  
    throw new Error("TWILIO_ENABLED=true but Twilio code not enabled yet.");
  }