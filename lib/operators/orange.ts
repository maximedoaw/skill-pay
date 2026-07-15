import { OperatorAdapter, OperatorError } from "./types";

const ORANGE_BASE_URL = process.env.ORANGE_API_BASE_URL!; // mock puis https://api.orange.com/... plus tard

async function getOrangeAccessToken(): Promise<string> {
  const res = await fetch(`${ORANGE_BASE_URL}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export const orangeAdapter: OperatorAdapter = {
  async initiatePayment(input) {
    const token = await getOrangeAccessToken();

    const res = await fetch(`${ORANGE_BASE_URL}/webpayment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriber: { country: "CM", currency: input.currency, msisdn: input.payerMsisdn },
        order: { id: input.externalId, amount: input.amount, currency: input.currency },
        notifyUrl: `${process.env.APP_URL}/api/callbacks/orange`,
        channelUserMsisdn: input.merchantMsisdn,
      }),
    });

    if (res.status !== 201) {
      const error = await res.json();
      throw new OperatorError(error.code ?? "OPS_001", error.message ?? "Erreur Orange");
    }

    const data = await res.json();
    return { operatorRef: data.payToken, status: "PENDING" };
  },

  async checkStatus(operatorRef) {
    const token = await getOrangeAccessToken();
    const res = await fetch(`${ORANGE_BASE_URL}/status/${operatorRef}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};