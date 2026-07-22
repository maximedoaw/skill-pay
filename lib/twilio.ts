// lib/twilio.ts

/**
 * Helper de service d'envoi SMS Twilio basé sur l'API REST officielle Twilio (compatibilité totale Node/Next.js)
 * 
 * Variables d'environnement dans .env ou .env.local :
 * - TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 * - TWILIO_AUTH_TOKEN=your_auth_token_here
 * - TWILIO_PHONE_NUMBER=+1XXXXXXXXXX (ou numéro d'expéditeur Twilio)
 */

export async function sendPaymentSMS(params: {
  toPhone: string;
  amount: number;
  currency: string;
  externalId: string;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn(
      "⚠️ [Twilio SMS] Ignoré : TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ou TWILIO_PHONE_NUMBER manquant dans .env"
    );
    return { success: false, reason: "Twilio non configuré dans .env" };
  }

  try {
    // Formatage E.164 (+237XXXXXXXXX)
    let formattedTo = params.toPhone.replace(/\D/g, "");
    if (!formattedTo.startsWith("237")) {
      formattedTo = `237${formattedTo}`;
    }
    const formattedToPhone = `+${formattedTo}`;

    // Formatage expéditeur
    const formattedFromPhone = fromPhone.trim().startsWith("+") ? fromPhone.trim() : `+${fromPhone.trim()}`;

    const bodyText = `[SkillPay] Confirmation : Initiation de paiement de ${params.amount} ${params.currency} réussie. Réf: ${params.externalId}.`;

    console.log(`📡 [Twilio API] Envoi SMS vers ${formattedToPhone} depuis ${formattedFromPhone}...`);

    // Appel direct API REST officielle Twilio (HTTP Basic Auth)
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const formData = new URLSearchParams();
    formData.append("To", formattedToPhone);
    formData.append("From", formattedFromPhone);
    formData.append("Body", bodyText);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [Twilio API Error] Code ${data.code}: ${data.message}`);
      return { 
        success: false, 
        code: data.code, 
        error: data.message || "Erreur de l'API Twilio",
        moreInfo: data.more_info 
      };
    }

    console.log(`✅ [Twilio API Success] SMS délivré (SID: ${data.sid}, Status: ${data.status})`);
    return { success: true, sid: data.sid, status: data.status };
  } catch (error: any) {
    console.error("❌ [Twilio Exception] Erreur lors de l'appel SMS :", error?.message || error);
    return { success: false, error: error?.message || "Exception inconnue" };
  }
}
