import { randomUUID } from "crypto";
import { OperatorAdapter, OperatorError } from "./types";

const MTN_BASE_URL = process.env.MTN_API_BASE_URL!;

async function getMtnAccessToken(): Promise<string> {
  const res = await fetch(`${MTN_BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.MTN_API_USER}:${process.env.MTN_API_KEY}`).toString("base64")}`,
      "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY!,
    },
  });
  const data = await res.json();
  return data.access_token;
}

export const mtnAdapter: OperatorAdapter = {
  async initiatePayment(input) {
    const token = await getMtnAccessToken();
    const referenceId = randomUUID();

    const res = await fetch(`${MTN_BASE_URL}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": process.env.MTN_TARGET_ENV ?? "sandbox",
        "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(input.amount),
        currency: input.currency,
        externalId: input.externalId,
        payer: { partyIdType: "MSISDN", partyId: input.payerMsisdn },
        payerMessage: "Paiement SkillPay",
      }),
    });

    if (res.status !== 202) {
      throw new OperatorError("OPS_001", `MTN a renvoyé ${res.status} au lieu de 202`);
    }

    return { operatorRef: referenceId, status: "PENDING" };
  },

  async checkStatus(operatorRef) {
    const token = await getMtnAccessToken();
    const res = await fetch(`${MTN_BASE_URL}/collection/v1_0/requesttopay/${operatorRef}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": process.env.MTN_TARGET_ENV ?? "sandbox",
        "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY!,
      },
    });
    return res.json();
  },
};